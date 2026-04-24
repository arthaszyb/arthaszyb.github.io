---
title: "虚拟化实践从qemu-kvm到libvirt"
date: 2018-01-31 07:57:47 +0000
categories: ["VM"]
tags: []
description: "By Liushy Apr 29 2017 Updated:Apr 30 2017 前言 结合自己最近的学习和实践，总结了一下libvirt和qemu-kvm的理解和使用，其中包括工具链的安装以及部分操作命令。 QEMU简单入门 qemu是什么，简单来说它是一个虚拟机的管理器，类似Virtualbox之类的。为了使虚机"
source: "evernote-local-db"
---

虚拟化实践从qemu-kvm到libvirt
By

Liushy

Apr 29 2017

Updated:Apr 30 2017
前言
结合自己最近的学习和实践，总结了一下libvirt和qemu-kvm的理解和使用，其中包括工具链的安装以及部分操作命令。
QEMU简单入门
qemu是什么，简单来说它是一个虚拟机的管理器，类似Virtualbox之类的。为了使虚机达到接近主机的性能，一般会结合kvm（或者Xen）对硬件虚拟化。kvm负责cpu+mem虚拟化，但kvm不能模拟其他设备；qemu负责模拟IO设备（网卡，usb等），两者结合能实现真正意义上的全系统仿真。kvm与qemu的结构如图所示：
#安装qemu:
qemu的安装，ubuntu／Debian系列的发行版使用下面的命令安装：
1
sudo

apt-get install qemu
redhat/centos系列的发行版使用如下命令安装：
1
sudo

yum install qemu -y
当然，也可以通过编译源码来安装。
#qemu官网
#检查kvm模块:
kvm作为Linux的内核模块，其运行需要硬件对虚拟化的支持，通过如下命令查看是否支持虚拟化：
1
grep -E

'vmx|svm'

/proc/cpuinfo
有输出则说明支持虚拟化。检查kvm模块（intel处理器）是否加载:
1
2
3
liushy@ubuntu:/usr/bin$ lsmod | grep kvm
kvm_intel

143590

0
kvm

452043

1

kvm_intel
若未加载，使用
modprobe kvm-intel
(amd处理器：kvm-amd）加载模块。
#qemu-kwm起虚机:
基本的几条命令如下，第一步，创建一个虚拟机硬盘：
1
qemu-img create

-f

qcow2 disk.img

10
G
硬盘大小设置为10G，存放操作系统的。
-f qcow2
指定了硬盘格式，qcow2支持硬盘数据大小动态的增加。
第二步，安装操作系统：
1
qemu-system-x86_64 -enable-kvm -m

512

-smp

2

-boot order=dc -hda /home/liushy/disk.img -cdrom /home/liushy/CentOS-
6.4
-x86_64-minimal.iso -vnc

127.0
.
0.1
:
30
-enable-kvm
启动kwm模块，开启硬件加速；
-m 512
设置内存为512m；
-smp 2
分配2个cpu；
-boot order=dc
指定系统启动顺序orber=dc为光驱(d:CD-ROM)、硬盘(c:hard Disk)；
-hda
和
-cdrom
分别指定硬盘和光驱(系统的安装镜像)；
-vnc
设置访问虚机的vnc端口。
安装完成后重起虚拟机便会从硬盘启动，之后再启动虚拟机只需要执行：
1
qemu-system-x86_64 disk.img -m

512

-enable-kvm
qemu起虚机的相关命令还有很多，比如指定网络设备，创建快照等，根据实际需求进行配置。
Libvirt基本玩法
libvirt是一整套对kvm虚机进行管理的工具和应用程序接口，它包括一个API库，一个守护程序（libvirtd）和一个命令行工具（virsh）。libvirtd通过调用qemu-kvm操作虚拟机，libvirt与qemu的架构关系，图像更直观：
openstack的虚机管理默认基于qemu-kvm，但是它不直接调用qemu-kvm，而是调用libvirt的库去操作qemu-kvm。libvirt提供的库除了能够操作qemu-kvm，还提供了对vmware, virtualbox，xen的支持。
#安装libvirt:
从
libvirt官网
下载libvirt源，我用的libvirt-1.3.5.tar.gz，解压，配置，编译，安装，启动（root权限）：
1
2
3
4
5
6
tar -zxvf libvirt-
1.3
.
5
.tar.gz
cd

libvirt-
1.3
.
5
./configure --prefix=/usr --localstatedir=/var --sysconfdir=/etc

#--prefix指定安装的目的路径,默认安装到/usr/local/bin
make
make install
libvirtd

-d

#启动libvirtd
如果在./configure这一步报error，可能是缺少相关依赖：libyajl-dev ,libxml2-dev ,libdevmapper1.0.2.1 ,ibdevmapper-dev ,libpciaccess-dev ,libnl-dev。根据实际情况安装。
#virsh管理虚机:
virsh是libvirt的命令行工具，可直接输入virsh进入一个特殊的shell。接下来简单几个步骤，利用virsh创建虚机：
第一步，创建虚机硬盘，如上节qemu的步骤一；
第二步，创建一个xml文件，配置虚机的内存，cpu，硬盘，光驱，vnc等信息，如下kali.xml：
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
<
domain

type
=
"kvm"
>
<
name
>
kali
<
/
name
>

<
!--虚拟机名称-->
<
memory

unit
=
"MiB"
>
1024
<
/
memory
>

<
!--最大内存，单位k-->
<
currentMemory

unit
=
"MiB"
>
1024
<
/
currentMemory
>

<
!--可用内存，单位k-->
<
vcpu
>
2
<
/
vcpu
>

<
!--虚拟cpu个数-->
<
os
>
<
type

arch
=
"x86_64"

machine
=
"pc"
>
hvm
<
/
type
>

<
!--半虚拟化-->
<
boot

dev
=
"hd"

/>

<
!--硬盘启动 -->
<
boot

dev
=
"cdrom"

/>

<
!--光盘启动-->
<
/
os
>
<
features
>
<
acpi

/>
<
apic

/>
<
pae

/>
<
/
features
>
<
clock

offset
=
"localtime"

/>
<
on_poweroff
>
destroy
<
/
on_poweroff
>
<
on_reboot
>
restart
<
/
on_reboot
>
<
on_crash
>
destroy
<
/
on_crash
>
<
devices
>
<
emulator
>
/usr/bin/qemu
<
/
emulator
>

<
!--ubuntu和centos路径不同。可能会报错找不到，可以删掉这个标签规避-->
<
!--镜像配置-->
<
disk

type
=
"file"

device
=
"disk"
>
<
driver

name
=
"qemu"

type
=
"qcow2"

/>
<
source

file
=
"/home/liushy/disk.img"

/>

<
!--硬盘镜像路径-->
<
target

dev
=
"hda"

bus
=
"ide"

/>
<
/
disk
>
<
disk

type
=
"file"

device
=
"cdrom"
>
<
source

file
=
"/media/liushy/CE270A25D4A27269/kali-linux-2.0-i386.iso"

/>

<
!--光盘镜像路径 -->
<
target

dev
=
"hdb"

bus
=
"ide"

/>
<
/
disk
>
<
!--接口配置-->
<
interface

type
=
'network'
>

<
!--连接到虚拟网络，连接方式还有bridge，ethernet，hostdev等-->
<
mac

address
=
'52:54:00:4f:1b:07'
/>
<
source

network
=
'default'
/>

<
!--指定default网络，需要先virsh net-define创建-->
<
model

type
=
'virtio'
/>

<
!--virtio模式，网卡工作速率为1000M-->
<
address

type
=
'pci'

domain
=
'0x0000'

bus
=
'0x00'

slot
=
'0x03'

function
=
'0x0'
/>
<
/
interface
>
<
input

type
=
"mouse"

bus
=
"ps2"

/>

<
!--鼠标-->
<
!--vnc端口号自动分配，自动加1-->
<
graphics

type
=
"vnc"

port
=
"-1"

autoport
=
"yes"

listen
=
"0.0.0.0"

keymap
=
"en-us"

/>
<
/
devices
>
<
/
domain
>
第三步，virsh create kali.xml启动虚机，等同于执行：
virsh define kali.xml———注入xml文件的配置
virsh start kali———启动kali虚机
启动虚机后，可通过virsh list查看当前运行的虚机。xml文件可以复用，创建其他虚机，但注意修改其中的uuid，name，pci设备等唯一配置信息。
#绑定pci设备:
如果要为虚机的接口绑定物理主机的网卡（pci passthrough，pci直通），则可以通过下面的操作完成：
第一步，lspci查看pci设备的信息：
1
2
3
lspci
04
:
00.0

Ethernet controller: Intel Corporation

82571
EB Gigabit Ethernet Controller (rev

06
)
04
:
00.1

Ethernet controller: Intel Corporation

82571
EB Gigabit Ethernet Controller (rev

06
)
比如得到第一张网卡的编号04:00.0，然后通过以下指令找到对应的nodedev：
1
2
3
4
5
6
7
8
9
10
virsh nodedev-list --tree
+- pci_0000_00_07_0
| |
| +- pci_0000_04_00_0
| | |
| | +- net_p1p1_00_1b_21_88_69_dc
| |
| +- pci_0000_04_00_1
| |
| +- net_p1p2_00_1b_21_88_69_dd
04:00.0对应的nodedev是pci_0000_04_00_0
第二步，得到对应网卡的xml配置：
1
2
virsh nodedev-dumpxml pci_0000_04_00_0
...
第三步，将网卡pci设备信息写入到虚机的xml文件中：
1
2
3
4
5
<
hostdev mode=
'subsystem'

type
=
'pci'

managed=
'yes'
>
<
source
>
<
address domain=
'0x0000'

bus=
'0x04'

slot=
'0x00'

function=
'0x0'
/>
<
/
source
>
<
/hostdev>
其中的domain，bus，slot，function信息都是从网卡的xml配置中获取的。修改完虚机配置文件，重启虚机，就可以独占物理主机的网卡了。
#virsh命令及调试:
virsh的一些常用命令：
virsh list————#查询本地active的虚拟机
virsh list –all———-#查询本地所有的虚拟机（active+inactive）
virsh define kali.xml———-#定义kali虚机的xml（虚拟机是inactive）
virsh undefine kali———-#移除虚机
virsh start kali———-#启动名字为kali的非活动虚拟机
virsh create kali.xml———-#创建虚拟机（虚拟机立即执行）
virsh edit kali———-#编辑配置文件
virsh domstate kali———-#显示虚拟机的当前状态
virsh dumpxml kali———-#显示虚拟机的当前配置文件
virsh suspend kali———-#挂起虚拟机
virsh resume kali———-#启动挂起的虚拟机
virsh shutdown kali———-#关闭虚拟机
virsh destroy kali———-#强制关闭虚拟机
virsh dominfo kali———-#显示虚拟机的基本信息
virsh domname 2 ———-#显示id号为2的虚拟机名
virsh domid kali———-#显示虚拟机id号
virsh domuuid kali————#显示虚拟机的uuid
virsh setvcpus kali 4———-#给不活动虚拟机设置cpu个数
virsh vncdisplay kali———-#查看虚机的vnc端口
virsh nodedev-list —tree————#查看pci设备信息
virsh nodedev-dumpxml pci_000_05_00_0———-#查看pci_000_05_00_0的xml配置
virsh net-dumpxml default———-#得到defaul网络的xml配置
virsh net-define default.xml————#配置default网络的xml
virsh net-start defalt ———-#运行defaukt网络
virsh net-destroy default ———-#移除default网络
libvirtd -l：libvirtd运行状态
libvirt-sock找不到该文件的情况，用find搜索，并ln -s软连接
总结
本文简单介绍了虚拟化技术qemu-kvm和libvirt相关工具链的安装和基本使用，并未深入讨论一些技术细节。文末附上一些参考资料，可以加深理解，部分技术关键词比如virtio，sr-iov，pci passthrough，virsh配置网络，以及virsh虚机迁移等，都是比较有意思的，可以深入研究。
