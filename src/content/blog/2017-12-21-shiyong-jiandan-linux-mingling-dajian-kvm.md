---
title: 使用 Linux 命令搭建 KVM 云环境
date: '2017-12-21'
description: "KVM 虚拟机部署实践。介绍如何将 VMware VMDK 格式磁盘转换为 KVM 兼容格式，使用 virt-install 创建虚拟机，以及用 virsh 命令添加网卡和磁盘等硬件。"
category: linux
tags:
  - kvm
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.d1net.com/virtual/news/408869.html
---

KVM（Kernel-based Virtual Machine）本地云提供低成本的虚拟机快速部署环境。以下介绍如何用命令行方式搭建 KVM 私有云。

## 磁盘格式转换

将 VMware VMDK 格式转换为 KVM 兼容的 QCOW2 格式：

```bash
qemu-img convert -O qcow2 vmdisk.vmdk vmdisk.qcow2
```

## 创建虚拟机

基于 QCOW2 磁盘文件创建虚拟机，指定 CPU、内存等配置：

```bash
virt-install -n server1 --disk=/var/lib/libvirt/images/server1.qcow2 --ram 1024 --vcpus 1 --connect qemu:///system --import --noautoconsole
```

参数说明：
- `-n server1`：虚拟机名称
- `--disk`：磁盘文件路径
- `--ram`：内存大小（MB）
- `--vcpus`：CPU 核心数
- `--import`：直接导入现有磁盘
- `--noautoconsole`：不自动打开控制台

## 添加网卡

使用 virsh 命令为虚拟机添加网卡：

```bash
virsh attach-interface --domain server1 --type network --source default --model virtio --mac 52:54:00:00:11:11 --config --live
```

参数：
- `--domain`：虚拟机名称
- `--type network`：网络类型
- `--model virtio`：使用 virtio 驱动
- `--config --live`：同时更新配置文件和运行时配置，无需重启

## 添加磁盘

创建稀疏文件作为虚拟磁盘：

```bash
dd if=/dev/zero of=/var/lib/libvirt/images/1Gfile.img bs=1M seek=1024 count=0
```

将其连接到虚拟机为 `/dev/vdb`：

```bash
virsh attach-disk server1 /var/lib/libvirt/images/1Gfile.img vdb --config --live
```
