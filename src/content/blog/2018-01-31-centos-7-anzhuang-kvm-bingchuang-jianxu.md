---
title: CentOS 7 安装 KVM 并创建虚拟机
date: '2018-01-31'
description: 在 CentOS 7 上使用 KVM 和 QEMU 进行虚拟化部署，包括 KVM 安装、网桥配置、虚拟机创建等完整步骤。
category: container-virt
tags:
  - kvm
  - systemd
draft: false
source: evernote-local-db
lang: zh
origin_url: http://blog.csdn.net/wh211212/article/details/54135565
---

## 环境要求

- CPU 支持虚拟化（Intel VT 或 AMD-V）

## 安装 KVM

```bash
yum -y install qemu-kvm libvirt virt-install bridge-utils
```

验证模块已加载：

```bash
lsmod | grep kvm
# kvm_intel             170181  0
# kvm                   554609  1 kvm_intel
# irqbypass             13503  1 kvm
```

启动 libvirt 服务：

```bash
systemctl start libvirtd
systemctl enable libvirtd
```

## 配置桥接网络

为 KVM 虚拟机配置桥接网络以访问外部网络。

实验环境：
- OS：CentOS Linux release 7.3.1611 (Core)
- 网络：双网卡 bonding
- 硬件：DELL R420, 16G 内存, 4 核 CPU

### 创建网桥配置文件

编辑 `/etc/sysconfig/network-scripts/ifcfg-br0`：

```bash
DEVICE="br0"
ONBOOT="yes"
TYPE="Bridge"
BOOTPROTO=static
IPADDR=192.168.1.133
NETMASK=255.255.255.0
GATEWAY=192.168.1.1
DEFROUTE=yes
```

### 配置 bonding（可选）

编辑 `/etc/sysconfig/network-scripts/ifcfg-bond0`：

```bash
DEVICE=bond0
TYPE=Ethernet
NAME=bond0
BONDING_MASTER=yes
BOOTPROTO=none
BRIDGE=br0
ONBOOT=yes
BONDING_OPTS="mode=5 miimon=100"
```

重启网络服务：

```bash
systemctl restart network
```

## 创建虚拟机

### 创建存储目录

```bash
mkdir -p /var/kvm/images
```

### 使用 virt-install 安装虚拟机

通过网络安装 CentOS 7：

```bash
virt-install \
  --name elk \
  --ram 4096 \
  --disk path=/var/kvm/images/elk.img,size=30 \
  --vcpus 2 \
  --os-type linux \
  --os-variant rhel7 \
  --network bridge=br0 \
  --graphics none \
  --console pty,target_type=serial \
  --location 'http://mirrors.aliyun.com/centos/7/os/x86_64/' \
  --extra-args 'console=ttyS0,115200n8 serial'
```

关键参数说明：

| 参数 | 说明 |
|---|---|
| `--name` | 虚拟机名称 |
| `--ram` | 虚拟机内存（MB） |
| `--disk path=xxx,size=xxx` | 磁盘路径和大小（GB） |
| `--vcpus` | 虚拟 CPU 数 |
| `--os-type` | GuestOS 类型（linux/windows） |
| `--os-variant` | GuestOS 具体版本（可用 `osinfo-query os` 查询） |
| `--network` | 网络类型（bridge=桥接） |
| `--graphics` | 图形界面（none=无） |
| `--console` | 控制台类型 |
| `--location` | 安装源位置（HTTP/NFS） |
| `--extra-args` | 内核启动参数 |

### 虚拟机网络配置

安装完成后，配置虚拟机内的网卡。编辑虚拟机内的 `/etc/sysconfig/network-scripts/ifcfg-eth0`：

```bash
TYPE=Ethernet
BOOTPROTO=static
DEFROUTE=yes
PEERDNS=yes
PEERROUTES=yes
IPV4_FAILURE_FATAL=no
NAME=eth0
UUID=a38ceceb-5f4e-4d08-a108-d83c176ea85b
DEVICE=eth0
ONBOOT=yes
IPADDR="192.168.0.206"
PREFIX="24"
GATEWAY="192.168.0.1"
DNS1="114.114.114.114"
```

## 虚拟机安装另一种方法

通过 XML 配置文件方式创建虚拟机：

```bash
# 编辑 vm.xml
virsh define vm.xml    # 定义虚拟机（不启动）
virsh list --all       # 查看虚拟机列表
virsh start vm_name    # 启动虚拟机
```

这种方式需要 KVM 模块已加载（某些特殊环境如 tlinux 可能不支持）。
