---
title: "RHEL6_GFS_Web_HA实现"
date: 2014-02-08 02:43:22 +0000
categories: ["HA&LB"]
tags: []
description: "1. 实验环境 节点 1: v1.domain.com 192.168.137.11 节点 2: v2.domain.com 192.168.137.12 iscsi 存储 / 配置服务器： rhel6.domain.com 192.168.137.6 修改 /etc/hosts 文件或者搭建 DNS 服务器，三台 s"
source: "evernote-local-db"
---

1.
实验环境

节点
1: v1.domain.com 192.168.137.11

节点
2:
v2.domain.com 192.168.137.12
iscsi
存储
/
配置服务器：
rhel6.domain.com 192.168.137.6

修改
/etc/hosts
文件或者搭建
DNS
服务器，三台
server
的
hosts
文件如下：

127.0.0.1 localhost localhost.localdomain localhost4 localhost4.localdomain4

::1 localhost localhost.localdomain localhost6 localhost6.localdomain6

192.168.137.11 v1.domain.com v1

192.168.137.12 v2.domain.com v2

192.168.137.6 rhel6.domain.com rhel6
2.
配置集群之前
2.1.
存储配置
2.1.1.
ISCSI
服务器
1.
rhel6.domain.com上sda1和sda2为/分区和swap 分区，尚余一部分磁盘空间未分配，用fdisk分出sda3一个分区（10G）准备用作iscsi共享存储。
2.
安装
scsi-target-utils
软件提供
iscsi
服务

[root
@rhel6
~]# yum install scsi-target-utils
3.
修改/etc/tgt/targets.conf，添加：
<
target iqn.2011-06.com.domain:server.target1>

backing-store /dev/sda3

<
/target>
4.
重启tgtd服务，并将其设为开机启动：

[root
@rhel6
~]# /etc/init.d/tgtd restart

[root
@rhel6
~]# chkconfig tgtd on
5.
查看服务状态，可以看到已经提供了一个10G的ISCSI

LUN 1卷
6.
打开防火墙端口3260或者关闭防火墙，具体设置自行解决。
2.1.2.
ISCSI
客户机
1.
安装iscsi客户端软件iscsi-initiator-utils

[root@v1 ~]# yum install iscsi-initiator-utils
2.
发现服务器rhel6.domain.com的iscsi共享卷

[root@v1 ~]# iscsiadm -m discovery -t sendtargets -p
rhel6
Rhel6
为主机名，使用
ip
地址也可
3.
登录ISCSI存储：

[root@v1 ~]#
iscsiadm -m node -T iqn.2011-06.com.domain:server.target1 -p 192.168.137.6:3260 -l
使用iscsiadm -m node -T target名称 -p targetIP地址：端口号 –login 命令
5.
卸载ISCSI存储命令

[root@v1 ~]# iscsiadm -m node -T iqn.2011-06.com.domain:server.target1 -p 192.168.137.6:3260 -u
6.
在其他的节点上挂载ISCSI
7.将iscsi设为开机启动
2.2.
集群软件包安装

分为集群节点和配置管理器（
Luci
，
RHCS
的
web
管理工具，仅仅只是配置工具，集群可脱离它正常运行）
2.2.1.
集群节点
1.
配置好yum源后，安装集群软件包

[root@v1 ~]# yum install ricci openais cman rgmanager lvm2-cluster gfs2-utils
2.
打开防火墙相应端口

端口 协议 程序

5404,5405 UDP corosync/cman

11111 TCP ricci

21064 TCP dlm

16851 TCP modclusterd
3.
或者直接禁用防火墙

[root@v1 ~]# /etc/init.d/iptables stop

[root
@rhel6
~]# chkconfig iptables off
4.
关闭节点上的ACPI服务：

[root@v1 ~]# /etc/init.d/acpid stop

[root@v1 ~]# chkconfig acpid off
5.
禁用NetworkManager

[root@v1 ~]# /etc/init.d/NetworkManager stop

[root@v1 ~]# chkconfig NetworkManager off
6.
给软件用户ricci设置密码：

[root@v1 ~]# passwd ricci
7.
启动ricci服务

[root@v1 ~]# /etc/init.d/ricci start
2.2.2.
集群配置管理器（
luci
）

可以安装在节点上，我现在安装在存储服务器上，更利于监控集群状态。
1.
配置好yum源后，安装管理软件：

[root
@rhel6
~]# yum install luci
2.
打开软件相应端口（iptables命令）

端口 协议 程序

8084 TCP luci
3.
或者直接禁用防火墙

[root
@rhel6
~]# /etc/init.d/iptables stop

[root
@rhel6
~]# chkconfig iptables off
4.
启动luci：

[root
@rhel6
~]# /etc/init.d/luci start
3.
创建集群
1.
登录管理服务器的luci 界面，端口8084：

luci1.png
(103.04 KB)
2011-7-1 23:37
2.
输入用户名root和密码，登录

luci2.png
(31.65 KB)
2011-7-1 23:37
3.
转到manage cluster界面

luci3.png
(35.23 KB)
2011-7-1 23:37
4.
点击Create,创建集群

luci4.png
(53.13 KB)
2011-7-1 23:37
5.
此处密码为ricci密码

luci5.png
(40.29 KB)
2011-7-1 23:37
6.
集群创建成功

luci6.png
(45.03 KB)
2011-7-1 23:37
7.
转到Fence Devices创建fence设备，因为不是用的服务器，没有fence设备，我随意建了一个SRF，实际生产环境中，必须使用fence硬件设备。

luci7.png
(40.73 KB)
2011-7-1 23:37
8.
回到nodes菜单下，点击v1.domain.com,出现节点详情后点击add fence method添加一个method，
9.
点击add fence instance，添加刚才设定的SRF。

luci8.png
(20.61 KB)
2011-7-1 23:37

luci8-2.png
(28.91 KB)
2011-7-1 23:37

luci8-3.png
(22.25 KB)
2011-7-1 23:37

luci9.png
(29.96 KB)
2011-7-1 23:37
4.
建立
GFS
文件系统
4.1.
创建
LVM
卷
1.
创建物理卷

[root@v1 ~]# pvcreate /dev/sda
2.
查看物理卷
[root@v1 ~]# pvdisplay
3.
创建卷组v g1

[root@v1 ~]# vgcreate vg1 /dev/sda
4.
查看卷组

[root@v1 ~]# vgdisplay
5.
创建逻辑卷lv1

[root@v1 ~]# lvcreate -L 10G -n lv1 vg1

-L 10G指定大小 –n lv1指定名称 vg1指定所在卷组
6.
现在在两台节点上手动重启/etc/clvmd服务：

[root@v1 ~]# /etc/init.d/clvmd restart
7.
在两边主机上都可以看到新建的lvm卷
4.2.
创建
GFS2
文件系统
1.
在将lvm卷 lv1格式化成GFS2文件系统

[root@v1 ~]# mkfs.gfs2 -p lock_dlm -t mycluster:data1 -j 4 /dev/vg1/lv1

-p指定lock参数，-t指定

集群名：文件系统名 –j 指定可以连接的节点数
2.
节点上挂载GFS2文件系统

[root@v1 ~]# mkdir /mnt/data1

[root@v1 ~]# mount /dev/vg1/lv1 /mnt/data1/

[root@v2 ~]# mkdir /mnt/data1

[root@v2 ~]# mount /dev/vg1/lv1 /mnt/data1/
3.
测试GFS2文件系统是否正常运行，在v1和v2上分别新建文件，在双方查看是否同步
4.
让GFS2文件系统开机自动挂载

查看
mount

[root@v1 ~]# mount

。。。。。。

/dev/mapper/vg1-lv1 on /mnt/data1 type gfs2 (rw,relatime,hostdata=jid=0)
[root@v2 ~]# mount

。。。。。。

/dev/mapper/vg1-lv1 on /mnt/data1 type gfs2 (rw,relatime,hostdata=jid=1)

分别修改节点
/etc/fstab
文件，加入

/dev/mapper/vg1-lv1 /mnt/data1 gfs2 defaults 0 0

重启节点验证

[root@v1 ~]# df -h
5.
建立
Web
高可用服务
5.1.
配置
web
服务器

两个节点上建立
web
服务器，实际使用中网站根目录均应使用
/mnt/data1/
下的相同目录，测试中为了更好的验证，分别使用
/mnt/data1/www1
和
/mnt/data1/www2.
1.
修改两个节点上的/etc/httpd/conf/httpd.conf

[root@v1 ~]# vim /etc/httpd/conf/httpd.conf

DocumentRoot "/var/www/html"改为

DocumentRoot "/mnt/data1/www1"

[root@v2 ~]# vim /etc/httpd/conf/httpd.conf

DocumentRoot "/var/www/html"改为

DocumentRoot "/mnt/data1/www2"
2.
新建目录及网页文件index.html

[root@v2 ~]# mkdir /mnt/data1/www1

/mnt/data1/www2

root@v2 ~]# vim /mnt/data1/www1/index.html

This is v1 ！

root@v2 ~]# vim /mnt/data1/www2/index.html

This is v2 ！
3.
启动http服务

[root@v1 ~]# /etc/init.d/httpd start

[root@v2 ~]# /etc/init.d/httpd start
4.
访问192.168.137.11和192.168.137.12得到：

11.png
(80.08 KB)
2011-7-1 23:37

12.png
(80.53 KB)
2011-7-1 23:37
5.2.
集群中创建服务组
1.
创建Web高可用需要的两个资源：
(1)

ip
地址：
192.168.137.10/24
(2)

httpd
脚本：
/etc/init.d/httpd

521.png
(51.59 KB)
2011-7-1 23:37

522.png
(51.47 KB)
2011-7-1 23:37
2.
新建故障倒换域

523.png
(47.88 KB)
2011-7-1 23:37
3.
新建服务组，添加刚才新建的两个资源进服务组

524.png
(57.99 KB)
2011-7-1 23:37

525.png
(63.09 KB)
2011-7-1 23:37
4.
启动服务组

526.png
(56.51 KB)
2011-7-1 23:37
显示运行在
v2
上，访问
192.168.137.10
有：

527.png
(82.42 KB)
2011-7-1 23:37
5.3.
高可用性验证
1.
手动切换

531.png
(53.74 KB)
2011-7-1 23:37

532.png
(57.64 KB)
2011-7-1 23:37

刷新
192.168.137.10
页面

533.png
(83.01 KB)
2011-7-1 23:37
2.
模拟宕机，关闭V1（
现实生产应用中必须使用Fence设备！！！
）

534.png
(83.28 KB)
