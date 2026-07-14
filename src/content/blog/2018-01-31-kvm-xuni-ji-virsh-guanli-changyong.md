---
title: KVM 虚拟机 virsh 管理常用命令
date: '2018-01-31'
description: KVM 虚拟机管理详细指南，包括虚拟机基本操作、硬盘添加和扩容、内存 CPU 动态调整、虚拟机参数修改等完整命令集。
category: container-virt
tags:
  - kvm
  - lvm
draft: false
source: evernote-local-db
lang: zh
origin_url: https://www.centos.bz/2017/07/kvm-virsh-manage-command/
---

## 虚拟机基本操作

### 列出虚拟机

```bash
virsh list --all              # 列出所有虚拟机
virsh dominfo kvm-1           # 显示虚拟机信息
virt-top                      # 显示虚拟机内存和 CPU 使用情况（需先 yum install virt-top）
virt-df kvm-1                 # 显示虚拟机分区信息
```

### 虚拟机状态管理

```bash
virsh shutdown kvm-1          # 关闭虚拟机（ACPI 关机）
virsh start kvm-1             # 启动虚拟机
virsh autostart kvm-1         # 设置虚拟机跟随系统自启
virsh autostart --disable kvm-1  # 关闭虚拟机自启
virsh undefine kvm-1          # 删除虚拟机
virsh console kvm-1           # 通过控制窗口登录虚拟机
```

## 虚拟机存储管理

### 添加物理磁盘或 LVM 卷

```bash
# 添加物理磁盘或 USB
virsh attach-disk kvm-1 /dev/sdb vbd --driver qemu --mode shareable

# 卸载磁盘
virsh detach-disk kvm vdb
```

### 添加 LVM 卷并挂载

```bash
# 在宿主机创建 LVM 卷
lvcreate -n kvm-1-data -L 50G vg_shkvm1

# 添加到虚拟机
virsh attach-disk kvm-1 /dev/vg_shkvm1/kvm-1-data vdb --driver qemu --mode shareable

# 在虚拟机内查看
virsh console kvm-1
fdisk -l                      # 查看硬盘挂载情况
```

### 新磁盘格式化和 LVM 扩展

```bash
# 对新磁盘分区
fdisk /dev/vdb

# 创建物理卷
pvcreate /dev/vdb1

# 扩展逻辑卷组
vgextend VolGroup /dev/vdb1

# 查看逻辑卷组信息
vgs                           # 显示 VG 容量和可用空间
```

## 虚拟机参数调整

### 修改内存

```bash
# 查看当前内存
virsh dominfo kvm-1 | grep memory

# 动态设置内存为 512MB（单位必须是 KB）
virsh setmem kvm-1 524288

# 增加内存需要停止虚拟机
virsh shutdown kvm-1
virsh edit kvm-1              # 修改 <memory> 标签
virsh create /etc/libvirt/qemu/kvm-1/kvm-1.xml  # 启动虚拟机
```

### 修改 CPU

修改 CPU 数需要停止虚拟机：

```bash
virsh shutdown kvm-1
virsh edit kvm-1              # 修改 <vcpu> 标签（如改成 4）
virsh create /etc/libvirt/qemu/kvm-1/kvm-1.xml
```

### 硬盘扩容

```bash
# 创建 10GB 新文件
dd if=/dev/zero of=/vm-images/vm1-add.img bs=1M count=10240

# 停止虚拟机
virsh shutdown vm1

# 编辑虚拟机配置，添加新硬盘（复制粘贴现有硬盘配置，修改 target 和 source）
virsh edit vm1
```

**建议**：使用 `virsh attach-disk` 命令动态添加硬盘更简便。

## 虚拟机删除

```bash
# 第一步：停掉虚拟机
virsh shutdown kvm-1

# 第二步：强制关闭（如果 shutdown 失败）
virsh destroy kvm-1

# 第三步：删除虚拟机配置
virsh undefine kvm-1

# 第四步：删除磁盘（可选，不建议自动删除以防数据丢失）
rm /dev/vg_shkvm1/kvm-1
```

## 常用命令速查

```bash
virsh list --all                    # 列出所有虚拟机
virsh dominfo <vm>                  # 显示虚拟机信息
virsh dumpxml <vm>                  # 导出虚拟机配置
virsh start <vm>                    # 启动虚拟机
virsh shutdown <vm>                 # 关闭虚拟机
virsh destroy <vm>                  # 强制关闭
virsh undefine <vm>                 # 删除虚拟机
virsh edit <vm>                     # 编辑虚拟机配置
virsh domstate <vm>                 # 显示虚拟机状态
virsh suspend <vm>                  # 暂停虚拟机
virsh resume <vm>                   # 恢复虚拟机
virsh console <vm>                  # 进入虚拟机控制台
virsh vncdisplay <vm>               # 查看 VNC 端口
virsh snapshot-create-as --domain <vm> --name <name>  # 创建快照
```
