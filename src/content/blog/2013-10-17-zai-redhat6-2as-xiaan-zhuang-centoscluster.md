---
title: RedHat 6.2 下安装 RHCS（CentOS Cluster）集群
date: '2013-10-17'
description: Red Hat Cluster Suite（RHCS）的搭建实践，包括 LUCI 管理界面、集群节点配置、故障转移、iSCSI 共享存储和 GFS 文件系统的集成
category: linux
tags:
  - 集群
  - 高可用
  - 负载均衡
  - 存储
draft: false
source: evernote-local-db
lang: zh
---

## RHCS（Red Hat Cluster Suite）概述

RHCS 是一个能够提供高可用性、高可靠性、负载均衡、存储共享且经济廉价的集群工具集合。

- **LUCI**：基于 Web 的集群配置方式，通过 LUCI 可以轻松搭建功能强大的集群系统
- **CLVM**：Cluster 逻辑卷管理，是 LVM 的扩展，允许集群中的机器使用 LVM 来管理共享存储
- **CMAN**：分布式集群管理器

## 实验规划

- 节点一：192.168.0.54（desktop54.example.com）
- 节点二：192.168.0.85（desktop85.example.com）
- 管理主机：192.168.0.22（desktop22.example.com）

一、【准备工作】

1、将三台电脑的解析分别写入到各自的 hosts 文件，这里是这样:

1. 192.168.0.54 desktop54.example.com

192.168.0.85 desktop85.example.com

192.168.0.22 desktop22.example.com

2、两台节点主机关闭 selinux、iptables、和NetworkManager

2. \[root@desktop54 node1\]# iptables -F

\[root@desktop54 node1\]# service iptables save

\[root@desktop54 node1\]# grep ^SELINUX= /etc/selinux/config

SELINUX=enforcing

\[root@desktop54 node1\]# sed -i 's/^SELINUX=.\*/SELINUX=disabled/g' /etc/selinux/config

\[root@desktop54 node1\]# yum remove NetworkManager NetworkManager-glib NetworkManager-gnome NetworkManager-devel NetworkManager-glib-devel

\[root@desktop54 node1\]# reboot

(node1和node2都关闭selinux、iptables和NetworkManager)

一、【管理主机】

3. 安装luci:

\[root@desktop22 manager\]# yum install luci -y

\[root@desktop22 manager\]# chkconfig luci on

\[root@desktop22 manager\]# service luci start

Point your web browser to [https://desktop22.example.com:8084](https://desktop22.example.com:8084/) to access luci

这是可以通过访问 [https://desktop22.example.com:8084](https://desktop22.example.com:8084/) 进入到RHCS网页集群管理。要求安装证书，然后以系统用户登录。这里以 root 登录。

二、【节点配置】

1. 安装 ricci、rgmanager、cman，并且启动这些服务（无先后顺序），其中cman会启动失败，可以先不启动

\[root@desktop54 node1\]# yum install ricci rgmanager cman -y \[root@desktop54 node1\]# chkconfig ricci on

2. \[root@desktop54 node1\]# chkconfig rgmanager on

\[root@desktop54 node1\]# chkconfig cman on

3. 设置用户ricci的密码，启动服务。在web中加入node时使用的密码就是ricci的密码

\[root@desktop54 node1\]# service ricci start

Starting ricci: \[ OK \]

\[root@desktop54 node1\]# service rgmanager start

Starting Cluster Service Manager: \[ OK \]

\[root@desktop85 node2\]# service cman start

Starting cluster:

Checking Network Manager... \[ OK \]

Global setup... \[ OK \]

Loading kernel modules... \[ OK \]

Mounting configfs... \[ OK \]

Starting cman... xmlconfig cannot find /etc/cluster/cluster.conf

\[FAILED\]

这是因为还没有加入集群没有产生配置文件/etc/cluster/cluster.conf

下面这些服务都要为running状态

![](/images/legacy/legacy-19f9da4fdf.png)

三、【管理界面配置】

登录网址：https://desktop22.example.com:8084 用户名和密码为系统的root账户和密码

1、添加集群：

Manager Clusters -> Create {集群名字，注意及群名最好不要有空格和特殊符号，否则后面添加gfs名称时会报错 。节点的密码是否一样，输入主机名和ricci用户密码，端口不用改。这里选择在线下载所需的软件包，允许加入节点前重启，支持共享存储。} ->Create Cluster

1. 2、配置集群：（点击创建的集群进去）

\*\*创建节点：

创建完集群之后：会将添加的节点加进去，但都是显示红色，是因为相互通信的cman服务没有开启，手动开启cman服务：

2. \[root@desktop54 node1\]# service cman start （节点1）

Starting cluster:

Checking Network Manager... \[ OK \]

Global setup... \[ OK \]

Loading kernel modules... \[ OK \]

Mounting configfs... \[ OK \]

Starting cman... \[ OK \]

Waiting for quorum... \[ OK \]

Starting fenced... \[ OK \]

Starting dlm\_controld... \[ OK \]

Starting gfs\_controld... \[ OK \]

Unfencing self... \[ OK \]

Joining fence domain... \[ OK \]

\[root@desktop86 node2\]# service cman start (节点2)

Starting cluster:

Checking Network Manager... \[ OK \]

Global setup... \[ OK \]

Loading kernel modules... \[ OK \]

Mounting configfs... \[ OK \]

Starting cman... \[ OK \]

Waiting for quorum... \[ OK \]

Starting fenced... \[ OK \]

Starting dlm\_controld... \[ OK \]

Starting gfs\_controld... \[ OK \]

Unfencing self... \[ OK \]

Joining fence domain... \[ OK \]

此时再刷新管理页面，节点都显示正常了。

\*\*添加fence设备：

Fence Devices -> Add{Fence virt(Multicast Mode) (然后fence type 会变为fence xvm ) ; 名字：kevin\_virt\_fence} -> Submit 确定

1. 在各个节点中分别绑定该fence。

2. Nodes->node1->add fence methed(名字一样)->add fence instance(名字一样)

1. \*\*添加Failover Domains 故障转移域：

Prioritized:优先级，故障转移时选择优先级高的。

Restricted:服务只运行在指定的节点上。

No Failback:当故障节点又正常的时候，不必把服务切换回去。

Failover Domains -> Add {名字：kevin\_failover ;勾选Prioritized，No Failback具体情况自己设定；将实验的两台节点勾选，设定其优先级。}

-> Create

\*\*添加资源：(具体的自己添加，实验以apache服务)

Resources -> Add -> 选择IP Address

{IP address:192.168.0.234『虚拟ip地址，用于访问的，确保没被使用』;

Netmask bits (optional)：24『掩码位数』；

1. Monitor link：勾选上；

Number of seconds to sleep after removing an IP address：默认 }

->Submit

Resources -> Add -> 选择Script

{Name:httpd;

Full path to script [file:/etc/init.d/httpd](file://etc/init.d/httpd) }

->Submit

\*\*添加服务：（具体的自己添加）

Services -> Add

{Service name:apache ;

Automatically start this service:勾上『自动启动服务』；

Run exclusive:

Failover domain:选择刚刚加入的故障转移域kevin\_failover;

Recovery policy:轮循方式}

-> Add a resource 选择刚刚添加的虚拟ip -> Add a resource 选择刚刚添加的脚本httpd ->Submit

1. 用 ip addr show 可查看虚拟ip的情况

2. 四、测试

节点均装上httpd服务并开启服务：

\[root@desktop54 node1\]# yum install httpd -y (节点1)

\[root@desktop54 node1\]# service httpd start

\[root@desktop54 node1\]# echo \`hostname\` > /var/www/html/index.html

\[root@desktop86 node2\]# yum install httpd -y (节点2)

\[root@desktop86 node2\]# service httpd start

\[root@desktop86 node2\]# echo \`hostname\` > /var/www/html/index.html

没有截图，用文本方式访问：

\[root@desktop22 server\]# elinks -dump 192.168.0.54 (管理)

desktop54.example.com

\[root@desktop22 server\]# elinks -dump 192.168.0.86

desktop86.example.com

OK! 都正常

\[root@desktop22 server\]# elinks -dump 192.168.0.234 （虚拟ip）

desktop54.example.com （54优先级高）

在node1上模拟故障，看服务还能继续吗？用web方式刷新更直观

\[root@desktop54 node1\]# echo b > /proc/sysrq-trigger

\[root@desktop22 server\]# elinks -dump 192.168.0.234 （虚拟ip）

desktop86.example.com

再等node1开接启动服务后：

\[root@desktop22 server\]# elinks -dump 192.168.0.234 （虚拟ip）

desktop86.example.com

服务节点切回去了，这是因为刚刚勾选No Failback了。即使服务节点正常了不会再切回去。

【iSCSI GFS实现网络存储】

1、查看iscsi的状态：

\[root@desktop54 node1\]# /etc/init.d/iscsi status （node1的状态）

iSCSI Transport Class version 2.0-870

version 2.0-872

Target: iqn.2012-03.com.example:kevin

Current Portal: 192.168.0.24:3260,1

Persistent Portal: 192.168.0.24:3260,1

\*\*\*\*\*\*\*\*\*\*

Interface:

\*\*\*\*\*\*\*\*\*\*

Iface Name: default

Iface Transport: tcp

Iface Initiatorname: iqn.1994-05.com.redhat:86d532367ca0

Iface IPaddress: 192.168.0.54

Iface HWaddress:

Iface Netdev:

SID: 2

iSCSI Connection State: LOGGED IN

iSCSI Session State: LOGGED\_IN

Internal iscsid Session State: NO CHANGE

\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

Negotiated iSCSI params:

\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

HeaderDigest: None

DataDigest: None

MaxRecvDataSegmentLength : 262144

1. MaxXmitDataSegmentLength : 8192

2. FirstBurstLength: 65536

MaxBurstLength: 262144

ImmediateData: Yes

InitialR2T: Yes

MaxOutstandingR2T: 1

\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

Attached SCSI devices:

\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

Host Number: 3 State: running

scsi3 Channel 00 Id 0 Lun: 0

scsi3 Channel 00 Id 0 Lun: 1

Attached scsi disk sdb （这里发现为sdb） State: running

\[root@desktop86 node2\]# service iscsi status （node2的状态）

iSCSI Transport Class version 2.0-870

version 2.0-872

Target: iqn.2012-03.com.example:kevin

Current Portal: 192.168.0.24:3260,1

Persistent Portal: 192.168.0.24:3260,1

\*\*\*\*\*\*\*\*\*\*

Interface:

\*\*\*\*\*\*\*\*\*\*

Iface Name: default

Iface Transport: tcp

Iface Initiatorname: iqn.1994-05.com.redhat:12546582ea96

Iface IPaddress: 192.168.0.85

Iface HWaddress:

Iface Netdev:

SID: 2

iSCSI Connection State: LOGGED IN

iSCSI Session State: LOGGED\_IN

Internal iscsid Session State: NO CHANGE

\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

Negotiated iSCSI params:

\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

HeaderDigest: None

DataDigest: None

MaxRecvDataSegmentLength : 262144

3. MaxXmitDataSegmentLength : 8192

4. FirstBurstLength: 65536

MaxBurstLength: 262144

ImmediateData: Yes

InitialR2T: Yes

MaxOutstandingR2T: 1

\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

Attached SCSI devices:

\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

Host Number: 3 State: running

scsi3 Channel 00 Id 0 Lun: 0

scsi3 Channel 00 Id 0 Lun: 1

Attached scsi disk sda （发现为sda，源存储为vda） State: running

2、在节点node1和node2上配置：

\[root@desktop54 node1\]# lvmconf --enable-cluster (启动CLVM的集成cluster锁)

\[root@desktop54 node1\]# chkconfig clvmd on

\[root@desktop54 node1\]# service clvmd start (clvm对lvm有效哦)

Activating VG(s): No volume groups found

\[ OK \]

3、现在可以在任意一台节点client对发现的磁盘进行分区,划分出sdb1。然后格式化成网络文件系统gfs2.

\[root@desktop54 node1\]# pvcreate /dev/sdb1

Physical volume "/dev/sdb1" successfully created

\[root@desktop54 node1\]# vgcreate vg1 /dev/sdb1

Clustered volume group "vg1" successfully created

\[root@desktop54 node1\]# lvcreate -L 1G -n lv1 vg1

Error locking on node desktop85.example.com: Volume group for uuid not found: e1CQKruwtLzT6dRc9wysYIDq 1Df78V0hZDs9a1sf3duPexOy v115ETnOiM9C4P36

1. Aborting. Failed to activate new LV to wipe the start of it.

(出现问题了，不能创建lv 我们去node2上去同步一下吧)

\[root@desktop86 node2\]# pvcreate /dev/sda1

Can't initialize physical volume "/dev/sda1" of volume group "vg1" without -ff (不用管，再去node2看看。)

\[root@desktop54 node1\]# lvcreate -L 1G -n lv1 vg1

Logical volume "lv1" created （能够创建lv了。）

\[root@desktop54 node1\]# /etc/init.d/clvmd start

Activating VG(s): 1 logical volume(s) in volume group "vg1" now active

\[ OK \]

4、创建GFS文件系统

\[root@desktop54 node1\]# mkfs.gfs2 -p lock\_dlm -t kevin\_cluster:gfs2 -j 3 /dev/vg1/lv1

This will destroy any data on /dev/vg1/lv1.

It appears to contain: symbolic link to \`../dm-0'

Are you sure you want to proceed? \[y/n\] y

Device: /dev/vg1/lv1

Blocksize: 4096

Device Size 1.00 GB (262144 blocks)

Filesystem Size: 1.00 GB (262142 blocks)

Journals: 3

Resource Groups: 4

Locking Protocol: "lock\_dlm"

Lock Table: "kevin\_cluster:gfs2"

UUID: 0E8AC404-767B-8C1A-5ADF-8B18AB157CC3

『kevin\_cluster:gfs2这个kevin\_cluster就是集群的名字(要和集群名一致，否则无法挂载)，gfs2是定义的名字，相当于标签吧。\-j是指定挂载这个文件系统的主机个数，不指定默认为1即为管理节点的。这里实验有两个节点，加上管理主机为3』

1. 5、挂载GFS文件系统

在挂载之前将RHCS上apache服务停掉：

Services 里将apache服务disabled掉。

\[root@desktop54 node1\]# mount.gfs2 /dev/vg1/lv1 /var/www/html/

如果这里出现类似『fs is for a different cluster error mounting lockproto lock\_dlm』错误，查看日志文件：tail -n1 /var/log/messages,当前集群名字为current="kevin\_cluster"，上一步重新格式化，修改集群名就好了。

6、测试

\*\*node1：

\[root@desktop54 node1\]# echo node1 > /var/www/html/index.html

\[root@desktop54 node1\]# service httpd start

\[root@desktop24 ~\]# elinks -dump 192.168.0.54 (管理主机)

node1

\*\*node2：

\[root@desktop86 node2\]# mount.gfs2 /dev/vg1/lv1 /var/www/html/

\[root@desktop86 node2\]# service httpd start

\[root@desktop24 ~\]# elinks -dump 192.168.0.85 (管理主机)

node1

看，node2挂载上之后，数据还是刚刚在node1里边创建的。达到了共享存储的目的。

整合GFS文件系统和apache服务到RHCS集群套件上集中管理吧。

\*\*Resources -> Add -> GFS2

{Name:lv1;

Mount point:/var/www/html;

Device, FS label, or UUID:/dev/vg1/lv1;

Mount options:\_netdev;

Force unmount: yes}

-> Submit

\*\*Services -> apache -> Add a resource -> lv1 -> Submit

然后启动apache服务

用浏览器访问：http://192.168.0.234

\[root@desktop24 ~\]# elinks -dump 192.168.0.234

client1

OK 配置成功

还可以模拟刚刚的节点故障～ 实现了需要的效果.
