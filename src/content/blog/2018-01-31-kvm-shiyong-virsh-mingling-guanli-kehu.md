---
title: KVM 使用 virsh 命令管理客户机
date: '2018-01-31'
description: 使用 virsh 命令挂载 ISO 文件到 KVM 虚拟机的完整步骤，包括创建 XML 配置、挂载、卸载等操作。
category: container-virt
tags:
  - kvm
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.cnblogs.com/chengmo/archive/2010/10/13/1850515.html
---

## 虚拟机挂载 ISO

### 编写 cdrom 设备 XML 配置

在宿主机上创建文件 `cdrom.xml`，定义需要挂载的镜像文件：

```xml
<disk type='file'>
  <target dev='vde' bus='virtio'/>
  <source file='/data/image/guo.iso'/>
</disk>
```

### 使用 virsh 挂载磁盘

```bash
virsh attach-device --domain KY20160303170514Y1B --file cdrom.xml --live --config
```

**注意**：可以使用 `--live` 选项进行热插拔（虚拟机无需关闭）；不使用 `--live` 则需要先关机。

### 查看 VNC 端口

```bash
virsh vncdisplay KY20160225165610SLn
# :1

# VNC 访问地址：{宿主IP}:{vnc_port+5900}
# 例：宿主 10.160.0.6，vnc_port=1，则访问 10.160.0.6:5901
```

### 在客户机内部挂载光驱

```bash
mkdir -p /data/cdrom
mount -t iso9660 -r /dev/vdb /data/cdrom
ll /data/cdrom
```

## 卸载 ISO

编辑 `cdrom.xml` 为空，或保持原配置，然后执行：

```bash
# 需要在关闭虚拟机状态下（去掉 --live 选项）
virsh detach-device --domain KY20160303170514Y1B --file cdrom.xml --live --config
```

## 总结

虚拟机挂载 ISO 的关键步骤：
1. 编写设备 XML 配置文件
2. 使用 `virsh attach-device` 挂载
3. 在客户机内部 `mount` 到目录
4. 使用完后用 `virsh detach-device` 卸载
