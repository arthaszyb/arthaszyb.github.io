---
title: 使用简单Linux命令搭建KVM云环境
date: '2017-12-21'
description: >-
  2017年12月21日 12:04 使用简单Linux命令搭建KVM云环境 责任编辑：editor005 作者：Sander Van Vugt |
  2016-04-25 14:30:51 本文摘自：TechTarget中国 本地KVM(Kernel-based Virtual
category: linux
tags:
  - kvm
  - vmware
  - 存储
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---
2017年12月21日

12:04

**使用简单Linux命令搭建KVM云环境**

责任编辑：editor005 作者：Sander Van Vugt | 2016-04-25 14:30:51 本文摘自：TechTarget中国

本地KVM(Kernel-based Virtual Machine)云能够为企业提供快速创建虚拟机的安全环境，非常类似于传统云，但是成本却大幅度降低。

私有云通常被认为是快速、高效交付大规模虚拟机的最佳实践，但并非是唯一选择。对于那些想要部署小规模虚拟机的企业来说，本地KVM云也许会是更好的选择。这篇文章中会进一步分析如何在不依赖于公有云或者昂贵云软件的情况下运行类似云环境。

如果企业正在寻找一种部署虚拟机的简单方式，首先应该考虑如何为将要使用的磁盘镜像创建模板。可以使用KVM或者任何其他虚拟化软件，也可以使用类似于virt-manager的工具。

在下面的实例当中，假设管理员已经创建了这样的镜像文件，也会使用一些由VMware Fusion创建的虚拟机，这样能够更好地理解转换过程中面临的挑战。

创建兼容虚拟机文件

当在VMware中创建虚拟机文件时，必须首先确保这些文件能够和其他基础架构相互兼容。如果只使用VMware的hypervisor，这并不存在问题，但是很多企业还会使用KVM。确保虚拟机兼容性的方式之一就是将虚拟机导出为OVF(Open Virtualization Format)格式。这种格式类似于zip压缩文件，其优势在于能够兼容任何现有的虚拟化软件或者hypervisor。

在虚拟机当中通常能够找到一个用于描述虚拟机硬件的OVF文件，以及至少一个虚拟机磁盘文件(VMDK)，也就是虚拟磁盘自身。在开始使用KVM云之前必须导入VMDK文件。可以在Linux Sehll当中使用下面的命令完成导入操作：

qemu-img convert -O qcow2 vmdisk.vmdk vmdisk.qcow2

创建虚拟机

在运行上面的命令之后，将会 产生和KVM兼容的磁盘文件。下一步是基于磁盘文件创建新的虚拟机。这里可以使用virt-install命令，后面的参数信息指定用户希望分配的硬件配置。最终命令应该如下所示：

virt-install -n server1 --disk=/var/lib/libvirt/images/server1.qcow2 --ram 1024 vcpus 1 --connect qemu:///system --import --noautoconsole

这条命令将会基于存储在目录"/var/lib/libvirt/images"当中的qcow2文件创建一台新的虚拟机。这时，你就可以开始使用虚拟机了。

为虚拟机分配新的硬件

导入虚拟机之后，可能还需要为其添加新的硬件。为了完成这项任务，可以使用virsh命令和virsh管理层(和libvird进行通信)直接进行交互，假如需要为虚拟机添加一个名称为server1的网卡，那么应该使用下面的命令：

virsh attach-interface --domain server1 --type network --source default --model virtio --mac 52:54:00:00:11:11 --config --live

这条命令可以提供一块使用virtio驱动的新网卡，智能访问网络硬件。Virtio还能够更改配置文件，将新的接口加入运行配置当中，这意味着无需重启就能够使用新添加的硬件了。

还可以使用类似方式为虚拟机添加新的磁盘设备。在这样做之前，需要首先创建存储设备。为了定义磁盘文件，可以使用dd命令首先创建一个稀疏文件(sparse file)。

使用如下命令创建一个1GB的稀疏文件：

dd if=/dev/zero of=/var/lib/libvirt/images/1Gfile.img bs=1M seek=1024 count=0

之后使用如下命令将设备连接到虚拟机：

virsh attach-diks myvm /var/lib/libvirt/images/1Gfile.img vdb --config --live

这条命令会将虚拟磁盘——名称为“/dev/vdb”——添加到虚拟机当中。

在一台常见Linux KVM主机当中管理虚拟化环境可以参考上述操作，用户还可以使用Linux命令部署自己的私有KVM云，并且基于模板文件轻松部署和更改虚拟机。

来自 <[http://www.d1net.com/virtual/news/408869.html](http://www.d1net.com/virtual/news/408869.html)\>
