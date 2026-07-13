---
title: 自建 KVM 记录
date: '2018-01-31'
description: 个人使用 KVM 和 virt-install 部署虚拟化环境的实践记录，包括网桥配置、虚拟机创建、系统安装、网络配置等步骤。
category: container-virt
tags:
  - kvm
  - systemd
draft: false
source: evernote-local-db
lang: zh
---

## 安装和启动

安装 KVM 相关工具：

```bash
yum -y install qemu-kvm libvirt virt-install bridge-utils qemu
systemctl start libvirtd
```

创建存储目录：

```bash
mkdir /data/kvm/imgs
mkdir /data/kvm/vms
```

## 宿主机网络配置

配置网桥 `br0`，编辑 `/etc/sysconfig/network-scripts/ifcfg-br0`：

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

配置 bonding（可选），编辑 `/etc/sysconfig/network-scripts/ifcfg-bond0`：

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

使用 `virt-install` 创建虚拟机（注意：`distpath` 定义选择 `qcow2` 格式，`img` 格式占用空间更大）：

```bash
virt-install --name t3 \
  --ram 2048 \
  --disk path=/data/kvm/vms/t3.qcow2,size=22 \
  --vcpus 1 \
  --os-type linux \
  --os-variant rhel6 \
  --network bridge=br0 \
  --graphics none \
  --console pty,target_type=serial \
  --location '/data/kvm/imgs/CentOS-7-x86_64-DVD-1708.iso' \
  --extra-args 'console=ttyS0,115200n8 serial'
```

然后进入虚拟机操作系统安装界面进行安装。

## 虚拟机内网络配置

安装完成后，在虚拟机内配置网络。编辑 `/etc/sysconfig/network-scripts/ifcfg-eth0`：

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

启动网卡后可以 ping 宿主机的 `br0`，反向也能通，可以进行 SSH 连接。

## 安装虚拟机时的常见问题

### 安装后进入问题

安装完成后如果直接进入虚拟机（不自动 exit），按 `exit` 退出会一直循环在 login 界面。

### 挂载 ISO

在 `virt-install` 中使用 `--cdrom` 参数配置。如安装后忘记配置，可编辑 `cdrom.xml`：

```xml
<disk type='file'>
  <target dev='vde' bus='virtio'/>
  <source file='/data/kvm/imgs/CentOS-7-x86_64-DVD-1708.iso'/>
</disk>
```

执行挂载：

```bash
virsh attach-device --domain t3 --file cdrom.xml --live --config
```

在虚拟机内 mount 到目录即可使用。

## 虚拟机定义和启动的另一种方法

编辑虚拟机 XML 配置文件 `t4.xml`，然后：

```bash
virsh define t4.xml         # 定义虚拟机
virsh list --all            # 查看虚拟机列表（应看到 t4）
virsh start t4              # 启动虚拟机
```

**注意**：该方法要求内核已加载 KVM 模块。在某些特殊环境（如 tlinux）上可能无法加载 KVM 模块。

## 注意事项

- 使用 `qcow2` 格式的磁盘比 `img` 格式更高效
- 虚拟机创建后的初始网络配置很重要，建议在安装时配置好网络
- 在虚拟机内部进行的配置更改后需要重启相关服务或虚拟机才能生效
