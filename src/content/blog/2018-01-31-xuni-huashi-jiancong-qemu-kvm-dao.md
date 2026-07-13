---
title: 虚拟化实践：从 QEMU-KVM 到 libvirt
date: '2018-01-31'
description: 关于 QEMU、KVM 和 libvirt 的学习总结，包括工具链安装、基本概念、操作命令，适合虚拟化初学者。
category: container-virt
tags:
  - kvm
  - vmware
draft: false
source: evernote-local-db
lang: zh
---

## 前言

结合学习和实践，总结 libvirt 和 qemu-kvm 的理解和使用，包括工具链安装和操作命令。

## QEMU 简单入门

### 什么是 QEMU

QEMU 是一个虚拟机管理器，类似 Virtualbox。为使虚机达到接近主机的性能，通常结合 KVM（或 Xen）进行硬件虚拟化。

- **KVM**：负责 CPU + 内存虚拟化
- **QEMU**：负责模拟 IO 设备（网卡、USB 等）
- **结合**：实现完整的全系统仿真

### 安装 QEMU

**Ubuntu/Debian**：

```bash
sudo apt-get install qemu
```

**RedHat/CentOS**：

```bash
sudo yum install qemu -y
```

### 检查 KVM 模块

KVM 需要硬件虚拟化支持，通过以下命令检查：

```bash
grep -E 'vmx|svm' /proc/cpuinfo    # 有输出则支持虚拟化

# 检查 KVM 模块（Intel 处理器）
lsmod | grep kvm
# kvm_intel     143590  0
# kvm           452043  1 kvm_intel

# 如未加载，使用命令加载（AMD 处理器用 kvm-amd）
modprobe kvm-intel
```

## QEMU-KVM 启动虚拟机

### 创建虚拟机硬盘

```bash
qemu-img create -f qcow2 disk.img 10G
# -f qcow2：指定硬盘格式，支持动态增长
# 10G：硬盘大小
```

### 安装操作系统

```bash
qemu-system-x86_64 -enable-kvm -m 512 -smp 2 \
  -boot order=dc -hda /home/liushy/disk.img \
  -cdrom /home/liushy/CentOS-6.4-x86_64-minimal.iso \
  -vnc 127.0.0.1:30
```

参数说明：

| 参数 | 说明 |
|---|---|
| `-enable-kvm` | 启动 KVM 模块，开启硬件加速 |
| `-m 512` | 内存设置为 512MB |
| `-smp 2` | 分配 2 个 CPU |
| `-boot order=dc` | 启动顺序（d=CD-ROM，c=硬盘） |
| `-hda` | 指定硬盘 |
| `-cdrom` | 指定光驱/安装镜像 |
| `-vnc` | 设置 VNC 访问端口 |

### 启动已有的虚拟机

```bash
qemu-system-x86_64 disk.img -m 512 -enable-kvm
```

## libvirt 基本使用

### 什么是 libvirt

libvirt 是一整套对 KVM 虚机进行管理的工具和 API，包括：
- API 库
- libvirtd 守护程序
- virsh 命令行工具

OpenStack 虚机管理默认基于 qemu-kvm，但不直接调用 qemu-kvm，而是调用 libvirt 库。libvirt 不仅支持 qemu-kvm，还支持 VMware、Virtualbox、Xen 等。

### 安装 libvirt

从 libvirt 官网下载源代码，例如 `libvirt-1.3.5.tar.gz`：

```bash
tar -zxvf libvirt-1.3.5.tar.gz
cd libvirt-1.3.5
./configure --prefix=/usr --localstatedir=/var --sysconfdir=/etc
# --prefix：安装目标路径（默认 /usr/local/bin）
make
make install
libvirtd -d                          # 启动 libvirtd
```

**依赖**（如出现错误，根据提示安装）：libyajl-dev, libxml2-dev, libdevmapper1.0.2.1, libdevmapper-dev, libpciaccess-dev, libnl-dev

### 使用 virsh 创建虚拟机

**第一步**：创建虚拟机硬盘（同 QEMU）

```bash
qemu-img create -f qcow2 disk.img 10G
```

**第二步**：创建虚拟机 XML 配置文件

创建 `kali.xml`：

```xml
<domain type="kvm">
  <name>kali</name>           <!-- 虚拟机名称 -->
  <memory unit="MiB">1024</memory>       <!-- 最大内存 -->
  <currentMemory unit="MiB">1024</currentMemory>  <!-- 可用内存 -->
  <vcpu>2</vcpu>              <!-- 虚拟 CPU 个数 -->
  <os>
    <type arch="x86_64" machine="pc">hvm</type>  <!-- 半虚拟化 -->
    <boot dev="hd"/>          <!-- 硬盘启动 -->
    <boot dev="cdrom"/>       <!-- 光盘启动 -->
  </os>
  <features>
    <acpi/>
    <apic/>
    <pae/>
  </features>
  <clock offset="localtime"/>
  <on_poweroff>destroy</on_poweroff>
  <on_reboot>restart</on_reboot>
  <on_crash>destroy</on_crash>
  <devices>
    <emulator>/usr/bin/qemu</emulator>  <!-- Ubuntu 和 CentOS 路径可能不同 -->
    <!-- 硬盘配置 -->
    <disk type="file" device="disk">
      <driver name="qemu" type="qcow2"/>
      <source file="/home/liushy/disk.img"/>
      <target dev="hda" bus="ide"/>
    </disk>
    <!-- 光驱配置 -->
    <disk type="file" device="cdrom">
      <source file="/media/liushy/kali-linux-2.0-i386.iso"/>
      <target dev="hdb" bus="ide"/>
    </disk>
    <!-- 网络配置 -->
    <interface type='network'>
      <mac address='52:54:00:4f:1b:07'/>
      <source network='default'/>          <!-- 连接到虚拟网络 -->
      <model type='virtio'/>               <!-- virtio 模式，1000M 工作速率 -->
    </interface>
    <input type="mouse" bus="ps2"/>
    <!-- VNC 配置 -->
    <graphics type="vnc" port="-1" autoport="yes" listen="0.0.0.0" keymap="en-us"/>
  </devices>
</domain>
```

**第三步**：启动虚拟机

```bash
virsh create kali.xml    # 等价于以下两条命令
# virsh define kali.xml  # 注入 XML 配置
# virsh start kali       # 启动虚拟机

virsh list              # 查看运行中的虚拟机
```

## PCI 直通配置

将物理主机的网卡绑定到虚拟机（PCI passthrough）：

### 1. 查看 PCI 设备

```bash
lspci
# 04:00.0 Ethernet controller: Intel Corporation 82571 EB Gigabit Ethernet Controller (rev 06)
# 04:00.1 Ethernet controller: Intel Corporation 82571 EB Gigabit Ethernet Controller (rev 06)
```

### 2. 找到对应的 nodedev

```bash
virsh nodedev-list --tree
# pci_0000_04_00_0 对应 04:00.0
```

### 3. 获取网卡 XML 配置

```bash
virsh nodedev-dumpxml pci_0000_04_00_0
```

### 4. 添加到虚拟机配置

```xml
<hostdev mode='subsystem' type='pci' managed='yes'>
  <source>
    <address domain='0x0000' bus='0x04' slot='0x00' function='0x0'/>
  </source>
</hostdev>
```

## virsh 常用命令

```bash
virsh list --all                   # 查询本地所有虚拟机
virsh define kali.xml              # 定义虚拟机（inactive）
virsh undefine kali                # 删除虚拟机
virsh start kali                   # 启动虚拟机
virsh create kali.xml              # 创建并立即运行虚拟机
virsh edit kali                    # 编辑虚拟机配置
virsh domstate kali                # 显示虚拟机状态
virsh dumpxml kali                 # 显示虚拟机配置文件
virsh suspend kali                 # 暂停虚拟机
virsh resume kali                  # 恢复虚拟机
virsh shutdown kali                # 关闭虚拟机
virsh destroy kali                 # 强制关闭虚拟机
virsh dominfo kali                 # 显示虚拟机基本信息
virsh vncdisplay kali              # 查看 VNC 端口
virsh nodedev-list --tree          # 查看 PCI 设备
virsh net-dumpxml default          # 获取默认网络配置
virsh net-define default.xml       # 配置网络
libvirtd -l                        # 查看 libvirtd 运行状态
```

## 常见问题

- 若 `libvirt-sock` 找不到，用 `find` 搜索并创建软链接：`ln -s <path> /var/run/libvirt/libvirt-sock`
- XML 配置文件可复用，创建其他虚拟机时需修改 `uuid`、`name`、PCI 设备等唯一配置信息
