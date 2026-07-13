---
title: KVM 常用命令
date: '2018-01-31'
description: KVM 虚拟机管理常用命令速查表，涵盖虚拟机状态管理、配置编辑、网卡管理、快照备份、磁盘操作等。
category: container-virt
tags:
  - kvm
  - 备份恢复
draft: false
source: evernote-local-db
lang: zh
---

## 查看虚拟机运行状况

```bash
virsh list              # 列出所有在运行的虚拟机
virsh list --all        # 列出节点所有虚拟机
virsh dominfo <vm名字>  # 显示虚拟机的基本信息
virsh dumpxml <vm名字>  # 显示虚拟机的当前 XML 配置文件
```

## 改变虚拟机状态

```bash
virsh start <vm名字>     # 启动虚拟机
virsh reset <vm名字>     # 重启虚拟机
virsh shutdown <vm名字>  # 关闭虚拟机（调用系统关机）
virsh destroy <vm名字>   # 强制关闭虚拟机
virsh suspend <vm名字>   # 暂停虚拟机
virsh resume <vm名字>    # 恢复暂停的虚拟机
```

## 创建与编辑虚拟机配置

```bash
virsh define <vm配置文件>   # 通过配置文件定义一个虚拟机
virsh undefine <vm名字>     # 删除虚拟机
virsh edit <vm名字>         # 编辑虚拟机配置文件
```

### 虚拟机 XML 配置文件示例

```xml
<domain type='kvm'>
  <name>test_Ubuntu</name>           <!-- 虚拟机名称 -->
  <memory unit='KiB'>2097152</memory> <!-- 最大内存，单位 KiB -->
  <currentMemory unit='KiB'>2097152</currentMemory> <!-- 可用内存，单位 KiB -->
  <vcpu>8</vcpu>                     <!-- 虚拟 CPU 个数 -->
  <os>
    <type arch='x86_64' machine='rhel6.2.0'>hvm</type>
    <boot dev='cdrom'/>   <!-- 光盘启动为首选启动项 -->
    <boot dev='hd'/>      <!-- 硬盘启动为次要启动项 -->
  </os>
  <features>
    <acpi/>
    <apic/>
    <pae/>
  </features>
  <clock offset='localtime'/>
  <on_poweroff>destroy</on_poweroff>
  <on_reboot>restart</on_reboot>
  <on_crash>destroy</on_crash>
  <devices>
    <emulator>/usr/libexec/qemu-kvm</emulator>
    <!-- 硬盘配置 -->
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2'/>
      <source file='/var/lib/libvirt/images/test.qcow2'/> <!-- 镜像路径 -->
      <target dev='hda' bus='ide'/>  <!-- bus 还可设置为 virtio -->
    </disk>
    <!-- 光驱配置 -->
    <disk type='file' device='cdrom'>
      <source file='/var/lib/libvirt/images/ubuntu.iso'/>
      <target dev='hdb' bus='ide'/>
    </disk>
    <!-- 网络配置 -->
    <interface type='bridge'>
      <source bridge='kvmbr0'/>              <!-- 网桥名称 -->
      <mac address="00:16:3e:5d:aa:a8"/>    <!-- MAC 地址，务必唯一 -->
    </interface>
    <input type='mouse' bus='ps2'/>
    <!-- VNC 配置，端口自动分配 -->
    <graphics type='vnc' port='-1' listen='0.0.0.0' keymap='en-us'/>
  </devices>
</domain>
```

## VNC 连接虚拟机

```bash
virsh vncdisplay <vm名字>  # 显示 VNC 端口（如输出 :9）
# VNC 连接端口 = 5900 + 显示编号，如 :9 对应 5909
```

## 在线迁移

```bash
virsh migrate --persistent --undefinesource --live --unsafe <vm名字> qemu+tcp://<目标机>/system
```

参数说明：

```bash
--live              # 热迁移
--unsafe            # 即使迁移过程不安全也要迁移
--persistent        # 迁移后在新机上永久保留虚拟机
--undefinesource    # 迁移后在原机器删除虚拟机
--copy-storage-all  # 将虚拟磁盘也复制到新机器（非共享存储迁移时需要，但速度慢）
```

## 虚拟机网卡管理

```bash
virsh domiflist <vm名字>  # 查看虚拟机网卡信息

# 临时添加网卡
virsh attach-interface <vm名字> --type bridge --source <bridge名>

# 禁用和启用网卡
virsh domif-setlink <vm名字> <网卡MAC地址> <up|down>
```

## 限制虚拟机带宽

```bash
# 限制入站带宽
virsh domiftune <vm名称> <网卡MAC> --live --config --inbound -1,<峰值KByte/s>,<突发值KByte/s>

# 限制出站带宽
virsh domiftune <vm名称> <网卡MAC> --live --config --outbound -1,<峰值KByte/s>,<突发值KByte/s>
```

## 快照备份

```bash
virsh snapshot-create-as --domain <VM名字> --name <快照名> --no-metadata
virsh snapshot-list <vm名字>  # 列出快照
virsh domblklist <vm名字>     # 列出存储设备
```

## 挂载或卸载光驱

```bash
# 挂载光驱 ISO
virsh attach-disk <vm名字> <iso地址> <设备名如hda> --mode readonly --type cdrom

# 卸载光驱 ISO
virsh attach-disk <vm名字> "" <设备名如hda> --mode readonly --type cdrom
```

## 动态挂载或卸载硬盘

```bash
# 动态挂载硬盘
virsh attach-disk <VM名字> <硬盘绝对路径> vdb --driver qemu --subdriver qcow2

# 动态卸载硬盘
virsh detach-disk <vm名字> <设备名如hda>
```

## qemu-img 磁盘管理

```bash
# 查看磁盘信息
qemu-img info <硬盘路径>

# 创建硬盘
qemu-img create -f <qcow2|raw> <硬盘路径> <size>

# 派生创建硬盘（基于基础盘）
qemu-img create -f <qcow2|raw> <硬盘路径> -b <基础盘路径>

# 调整硬盘大小（只能增加，不能减少；需要 destroy 后开机才能显示）
qemu-img resize <硬盘路径> <新容量>

# 快照管理
qemu-img snapshot -l <硬盘路径>              # 列出快照
qemu-img snapshot -a <快照TAG> <硬盘路径>   # 应用快照
qemu-img snapshot -d <快照TAG> <硬盘路径>   # 删除快照

# 转换磁盘格式
qemu-img convert -f <旧格式> -O <新格式> <旧文件> <新文件>
# 支持格式：qcow2、raw、vmdk、vpc、vdi
```

## 重启 KVM 服务

```bash
service libvirtd restart
```
