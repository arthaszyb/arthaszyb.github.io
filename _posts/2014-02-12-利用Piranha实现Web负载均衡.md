---
title: "利用Piranha实现Web负载均衡"
date: 2014-02-12 02:43:13 +0000
categories: ["HA&LB"]
tags: []
description: "分类： LVS 集群 HA 2013-01-17 09:59 141人阅读 评论 (0) 收藏 举报 一、背景知识 1、LVS架构的基本分类 （1）Virtual Server via Network Address Translation（VS/NAT） 通过网络地址转换，调度器重写请求报文的目标地址，根据预设的调度"
source: "evernote-local-db"
---

利用Piranha实现Web负载均衡
分类：
LVS

集群

HA
2013-01-17 09:59

141人阅读

评论
(0)

收藏

举报
一、背景知识
1、LVS架构的基本分类
（1）Virtual Server via Network Address Translation（VS/NAT）
通过网络地址转换，调度器重写请求报文的目标地址，根据预设的调度算法，将请求分派给后端真实服务器；真实服务器的响应报文通过调度器时，
报文源地址被重写再返回给客户
，完成整个负载调度过程。
在Red Hat的官方网站上对采用LVS的基本结构和较为复杂与HA集群配合的三层结构其实都是利用NAT这种方式。这种情况的配置比较简单，
但通常在流量比较大的情况下会造成调度器的瓶颈
。因为服务数据的返回必须通过调度器出去。详情见下图：
同时在下面的链接有对基于NAT结构的LVS的官方说明：
http://www.redhat.com/docs/en-US/Red_Hat_Enterprise_Linux/5.2/html/Virtual_Server_Administration/s2-lvs-nat-VSA.html
（2）Virtual Server via Direct Routing（VS/DR）
VS/DR通过改写请求报文的MAC地址，将请求发送到真实服务器，而
真实服务器将响应直接返回给客户
。同VS/TUN技术一样，VS/DR技术
可极大地提高集群系统的伸缩性
。
这种方法没有IP隧道的开销，对集群中的真实服务器也没有必须支持IP隧道协议的要求
，但是
要求调度器与真实服务器都有一块网卡连在同一物理网段上
。也就是说，在这种结构中，数据从外部到内部真实服务器的访问会通过调度器进来，但是真实服务器对其的应答不是通过调度器出去。即在大多数情况下，真实服务器可以通过各自的网关或者专用的网关对数据进行外发，从而降低调度器负载。详情见下图：
同时在下面的链接有对基于DR结构的LVS的官方说明：
http://www.redhat.com/docs/en-US/Red_Hat_Enterprise_Linux/5.2/html/Virtual_Server_Administration/s2-lvs-directrouting-VSA.html
（3）Virtual Server via IP Tunneling（VS/TUN）
采用NAT技术时，由于请求和响应报文都必须经过调度器地址重写，当客户请求越来越多时，调度器的处理能力将成为瓶颈。为了解决这个问题，调度器把请求报文
通过IP隧道
转发至真实服务器，而真实服务器将响应直接返回给客户，所以调度器只处理请求报文。由于一般网络服务应答比请求报文大许多，采用VS/TUN技术后，集群系统的最大吞吐量可以提高10倍。
但事实上使用Tunnel技术实现LVS的做法，根据我们在工作环境中Debug LVS的经验，实际上是
三种结构中配置最复杂、排错最困难且同时也是性能最低的一种
。之所以有生存空间，从个人角度理解实际上是因为在一些特殊的网络环境中客户有特殊的要求。否则大多数情况下也都是使用
基于NAT或者DR的方式来实现LVS
。
2、Linux Virtual Server工作原理与核心组件：
LVS集群采用IP负载均衡技术和基于内容请求分发技术。调度器具有很好的吞吐率，将请求衡地转移到不同的服务器上执行，且调度器自动屏蔽掉服务器的故障，从而将一组服务器构成一个高性能的、高可用的虚拟服务器。整个服务器集群的结构对客户是透明的，而且无需修改客户端和服务器端的程序。
为此，在设计时需要考虑系统的透明性、可伸缩性、高可用性和易管理性。一般来说，LVS集群采用三层结构，三层主要组成部分为：
负载调度器（load balancer）
，它是整个集群对外面的前端机，负责将客户的请求发送到一组服务器上执行，而客户认为服务是来自一个IP地址（我们可称之为虚拟IP地址）上的。
服务器池（server pool）
，是一组真正执行客户请求的服务器，服务有WEB、MAIL、FTP和DNS等。
共享存储（shared storage）
，它为服务器池提供一个共享的存储区，这样很容易使得服务器池拥有相同的内容，提供相同的服务。
调度器是服务器集群系统的唯一入口点（Single Entry Point），它可以采用IP负载均衡技术、基于内容请求分发技术或者两者相结合。在IP负载均衡技术中，需要服务器池拥有相同的内容提供相同的服务。当客户请求到达时，调度器只根据服务器负载情况和设定的调度算法从服务器池中选出一个服务器，将该请求转发到选出的服务器，并记录这个调度；当这个请求的其他报文到达，也会被转发到前面选出的服务器。在基于内容请求分发技术中，服务器可以提供不同的服务，当客户请求到达时，调度器可根据请求的内容选择服务器执行请求。因为所有的操作都是在Linux操作系统核心空间中将完成的，它的调度开销很小，所以它具有很高的吞吐率。
服务器池的结点数目是可变的。当整个系统收到的负载超过目前所有结点的处理能力时，可以在服务器池中增加服务器来满足不断增长的请求负载。对大多数网络服务来说，请求间不存在很强的相关性，请求可在不同的结点上并行执行，所以整个系统的性能基本上可随着服务器池的结点数目增加而线性增长。
共享存储通常是数据库、网络文件系统或者分布式文件系统。负载调度器、服务器池和共享存储系统通过高速网络相连接，如100Mbps交换网络、Myrinet和Gigabit网络等。使用高速的网络，主要为避免当系统规模扩大时互联网络成为整个系统的瓶颈。在具体实施过程中，在红帽企业版Linux上对LVS集群的定义和配置提供了更加详细的方案。
另外在红帽的LVS中还有一个比较关键的东西是LVS的组件：
LVS的组件中服务包括pulse，lvs，ipvsadm以及nany；另外还包括配置文件/etc/sysconfig/ha/lvs.cf，配置工具piranha configuration tooly以及服务IP进行浮动之前arp欺骗手段中的send_arp。
pulse
是LVS的控制进程，该进程用于启动和控制所有的其他LVS相关的守护进程。该进程的配置文件是/etc/sysconfig/ha/lvs.cf。在主router上pulse用于启动LVS守护进程，
在备份router上pulse通过定期收发心跳信号监控主router的状态
。如果一旦主router失效，在备份router上的pulse进程将关闭所有主router上的LVS服务，并且开启send_arp程序来重新指派浮动IP到备份router的MAC上。
lvs进程运行在主router上，主要读取/etc/sysconfig/ha/lvs.cf文件，调用lvsadm工具来建立与维护ipvs路由表并对每一个LVS服务指派
nanny
进程。如果nanny报告一个真实服务器失效，lvs进程将调用ipvsadm工具将失效真实服务器从IPVS路由表中删除。
ipvsadm
用于升级kernel中的IPVS路由表，该进程主要用于更改、添加、删除IPVS路由表的条目。nanny监控的进程运行在主LVS Router上，主LVS Router会通过他来监控每一个真实服务器的状况。另外
piranha configuration tool
提供了一个图形接口用于修改/etc/sysconfig/ha/lvs.cf文件，而send_arp会在浮动IP向不同的LVS router进行切换时发送
arp广播。
二、Linux Virtual Server（LVS）的具体配置
1、VS/NAT架构
VS/NAT拓扑图
拓扑结构如上图所示：
我的全部操作系统使用RHEL5u3，用两台双网卡主机充当Primary和Backup LVS Router，这两台LVS Router将采用NAT方式来分发来自客户端请求到真实服务器上，然后应答由真实服务器
沿原路返回LVS Router
。
首先配置网络参数：
在Primary LVS Router上的基本参数：
[root@primary-lvs ~]#
ifconfig | grep inet

inet addr:192.168.1.10 Bcast:192.168.1.255 Mask:255.255.255.0

inet addr:10.0.0.10 Bcast:10.0.255.255 Mask:255.255.0.0

[root@ primary-lvs~]#
sysctl -a | grep ip_forward

net.ipv4.ip_forward = 1

[root@ primary-lvs~]#
sysctl –p
在Backup LVS Router上的基本参数：

[root@backup-lvs~]#
ifconfig | grep inet

inet addr:192.168.1.20 Bcast:192.168.1.255 Mask:255.255.255.0

inet addr:10.0.0.20 Bcast:10.0.255.255 Mask:255.255.0.0

[root@ backup-lvs~]#
sysctl -a | grep ip_forward

net.ipv4.ip_forward = 1

[root@ primary-lvs~]#
sysctl –p
在Real Server上的基本参数：

第一台：

[root@rs-1 ~]#
cat /etc/sysconfig
etwork-scripts/ifcfg-eth0

# Advanced Micro Devices [AMD] 79c970 [PCnet32 LANCE]

DEVICE=eth0

ONBOOT=yes

BOOTPROTO=static

HWADDR=00:0c:29:b2:60:a5

IPADDR=10.0.0.100

NETMASK=255.255.0.0

GATEWAY=10.0.0.254
第二台：
[root@rs-2 ~]#
cat /etc/sysconfig
etwork-scripts/ifcfg-eth0

# Advanced Micro Devices [AMD] 79c970 [PCnet32 LANCE]

DEVICE=eth0

ONBOOT=yes

BOOTPROTO=static

HWADDR=00:0c:29:b2:60:a5

IPADDR=10.0.0.200

NETMASK=255.255.0.0

GATEWAY=10.0.0.254
在基本配置完成之后可以在Primary LVS Router上安装LVS所需要的软件包和启用图形化的LVS配置工具Piranha：

[root@primary-lvs~]#
yum install -y ipvsadm

[root@primary-lvs~]#
yum install -y piranha
完成之后为piranha-gui设置密码并启动服务：
[root@primary-lvs~]#
/usr/sbin/piranha-passwd

New Password:

Verify:

Updating password for user piranha
[root@primary-lvs~]#
service piranha-gui restart

Shutting down piranha-gui: [ OK ]

Starting piranha-gui: [ OK ]
[root@primary-lvs~]#
chkconfig piranha-gui on

完成之后进入图形界面并在浏览器中输入：http://localhost:3636，输入用户名：piranha和刚才定义的密码，即可进入piranha configuration tool的配置界面：
具体的配置是：
在该界面中第一个要设置的地方是CONTROL/MONITORING，在该界面中将MONITOR中的选项：Auto update勾选上，Update Interval将自动定义为10s，在服务没有启动之前LVS
ROUTING TABLE和LVS PROCESS都不可见。完成之后选择Update information now。如下图：
Piranha cgi monitor配置
在该界面的第二个要设置的地方是GLOBAL SETTINGS，在该界面中：

Primary server public IP
：
192.168.1.10

（真实外部地址）

Primary server private IP
：
10.0.0.10
（真实内部地址）

Use network type
：
NAT
（LVS方式）

NAT Router IP
：
10.0.0.254

（内部浮动IP）

NAT Router MASK
：
255.255.0.0
（内部浮动掩码）

NAT Router Device
：
eth1:1

（运行浮动IP的设备）
如下图：
LVS Global Setting
填写完成后点击"ACCEPT"按钮
REDUNDANCY 配置
在该界面的第三个要设置的地方REDUNDANCY添加冗余配置：
Redundant server public IP
：
192.168.1.20
（Backup-LVS 外部地址）

Redundant server private IP
：
10.0.0.20
（Backup-LVS内部地址）

Heartbeat Interval（seconds）
：
2

（心跳间隔）

Assume dead after（seconds）
：
5

（3次心跳无响应则切换主从）

Heartbeat runs on port
：
539

（心跳端口）

Monitor NIC links for failure
： 不勾选

Syncdaemon
： 不勾选
如下图：
Backup-LVS 设置
填写完成后点击"ACCEPT"保存配置
VIRTUAL SERVERS 配置
每一个Virtual Servers代表所提供的一种服务，暂时先设置HTTP服务，所以点击ADD按钮如下图：
点击ADD按钮后出现新的Virtual Servers如下图：
然后再点击EDIT按钮，出现如下页面：
在提示中输入下面的信息：
Name
：
HTTP

（Virtual Server 名称）

Application port
：
80

（端口）

Protocal
：
TCP

（协议）

Virtual Server Address
：
192.168.1.250
（虚拟服务IP地址）

Virtual IP Network Mask
：
255.255.255.0
（子网掩码）
Firewall Mark
：

Device
：
eth0:1

（设备名）

Re-entry Time
：
5

（重新加入时间）

Service Timeout
：
2

（服务超时时间）

Quiesce
：
No

Load Monitor Tool
：
none

Scheduling
：
Weighted least-connections
加权最小连接算法（默认）

Persistence
：

Persistence Network Mask
：
Unused
确认无误后点击"ACCEPT"按钮保存配置
设置Real Server
添加Real Server
编辑Real Server
配置rs-1
利用相同的步骤添加并配置rs-2
Name
：
web_1

Address
：
10.0.0.100

Weighted
：
1

Name
：
web_2

Address
：
10.0.0.200

Weighted
：
1
保存并激活RS
添加rs后点击ACTIVATE按钮激活rs
在上图的界面上还有关于MONITORING SCRIPTS的设置，保持默认即可。
完成之后确认所有的配置都已经保存，这个LVS/NAT结构基本上就配置完成。最后的工作是在LVS的Router上启动主服务：
[root@ primary-lvs ~]#
service pulse start

[root@ primary-lvs ~]#
chkconfig pulse on
这个时候可以看到eth0:1和eth1:1已经自动建立：
[root@ primary-lvs ~]#
ifconfig
eth0:1 Link encap:Ethernet HWaddr 00:0C:29:08:A1:62

inet addr:192.168.1.250 Bcast:192.168.1.255 Mask:255.255.255.0

UP BROADCAST RUNNING MULTICAST MTU:1500 Metric:1

eth1:1 Link encap:Ethernet HWaddr 00:0C:29:08:A1:6C

inet addr:10.0.0.254 Bcast:10.0.255.255 Mask:255.255.0.0

UP BROADCAST RUNNING MULTICAST MTU:1500 Metric:1

Interrupt:19 Base address:0x2080
并且相关服务也开启了：
[root@ primary-lvs ~]#
service ipvsadm status
IP Virtual Server version 1.2.1 (size=4096)

Prot LocalAddress:Port Scheduler Flags

-> RemoteAddress:Port Forward Weight ActiveConn InActConn

TCP 192.168.1.250:80 wlc

-> 10.0.0.200:80 Masq 1 0 0

-> 10.0.0.100:80 Masq 1 0 15
[root@ primary-lvs ~]#
ps -ef | grep nanny | grep -v grep
root 3614 3596 0 23:09 ? 00:00:03 /usr/sbin
anny -c -h
10.0.0.100 -p 80
-s GET / HTTP/1.0\r\n\r\n -x HTTP -a 15 -I /sbin/ipvsadm -t 6 -w 1 -V 192.168.1.250 -M m -U none --lvs

root 3615 3596 0 23:09 ? 00:00:03 /usr/sbin
anny -c -h
10.0.0.200 -p 80
-s GET /HTTP/1.0\r\n\r\n -x HTTP -a 15 -I /sbin/ipvsadm -t 6 -w 1 -V 192.168.1.250 -M m -U none --lvs
同时开启两台真实服务器上的http服务，并在两台主机上的服务目录中分别建立同样的测试页面。
[root@web-1 ~]#
chkconfig httpd on

[root@web-1 ~]#
service httpd start
现在通过在客户端上访问LVS服务器进行测试：http://192.168.1.250，这次的测试是针对访问是否可以被LVS Router轮询，通过该刚才的访问可以看到real server给出了页面。而这里为了便于进一步看到测试效果，实际上可以在Real Server1和Real Server2上都开启HTTP服务，但为网站主目录设置不同的index.html文件。这样如果在客户端多刷新几次的话会发现访问被平均分配到两台真实服务器。
或者我们也可以在客户端上发起一个简单的压力测试：
执行命令：
[root@client ~]# ab -c 1000 -n 100000 http://192.168.1.250/index.html
这样在LVS Router上获得的LVS ROUTING TABLE如下：
[root@ primary-lvs ~]#
ipvsadm -l
IP Virtual Server version 1.2.1 (size=4096)
Prot LocalAddress:Port Scheduler Flags
-> RemoteAddress:Port Forward Weight ActiveConn InActConn
TCP 192.168.1.250:80 wlc
-> 10.0.0.200:80 Masq 1 0 317
-> 10.0.0.100:80 Masq 1 0 1007
访问量貌似在不同的服务器上的分布不太一样。事实上是由于采用了加权最小连接算法，所以负载在轮询的同时也会按照真实服务器的空闲状况分布。因此LVS Router的轮询功能已经可以正常工作。这样的话，一个基本的运行HTTP的LVS就算成功，也就是说LVS的架子搭建起来了。
接着我们再来测试LVS Router的主备切换功能。测试的方法很简单，第一台LVS Router现在是primary，那么正常情况下他提供服务，而备份lvs router开启pulse进程对第一台状态进行监控。现在将第一台LVS Router关闭，在短时间内客户端访问虚拟服务器将受到影响。但是在大概6秒左右的时间就可以访问成功，此时可以看到备份LVS Router已经成为primary并提供服务。如果此时再将已经关闭的第一台LVS Router开启，那么他将再次成为主LVS Router。
2、VS/DR架构
拓扑图
[root@ primary-lvs ~]#
vi /etc/sysconfig/ha/lvs.cf
serial_no = 102

primary = 192.168.108.108

service = lvs

backup_active = 1

backup = 192.168.108.109

heartbeat = 1

heartbeat_port = 539

keepalive = 2

deadtime = 3

network = direct

debug_level = NONE

monitor_links = 0

syncdaemon = 0

virtual lvs_server {

active = 1

address = 192.168.108.180 eth0:1

vip_nmask = 255.255.255.0

port = 80

persistent = 30

send = "GET / HTTP/1.0\r\n\r\n"

expect = "HTTP"

use_regex = 0

load_monitor = none

scheduler = wlc

protocol = tcp

timeout = 2

reentry = 5

quiesce_server = 0

server web_1 {

address = 192.168.108.161

active = 1

weight = 1

}

server web_2 {

address = 192.168.108.162

active = 1

weight = 1

}

}
该配置文件使用web页面进行配置，完成之后将配置文件复制到backup-lvs的相应目录下。
配置系统，启动LVS Route 上的pulse服务
Primary-LVS

[root@ primary-lvs ~]
vi /etc/sysctl.conf

net.ipv4.ip_forward = 1

[root@ primary-lvs ~]#
sysctl -p

[root@ primary-lvs ~]#
service pulse start

[root@ primary-lvs ~]#
scp /etc/sysconfig/ha/lvs.cf 192.168.108.109:/etc/sysconfig/ha/lvs.cf
backup-lvs做相同操作

[root@ backup-lvs ~]
vi /etc/sysctl.conf

net.ipv4.ip_forward = 1

[root@ backup-lvs ~]#
sysctl -p

[root@ backup-lvs ~]#
service pulse start
Real Server所做的操作我已经写了一个shell脚本，内容如下：
?
[Copy to clipboard]
View Code
BASH

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

#!/bin/bash
#Description : RealServer Start!
#Write by:Cooper
#Last Modefiy:2009.08.21

VIP
=192.168.108.180

startDR
(
)
{
/
sbin
/
ifconfig
lo:0
$VIP
broadcast
$VIP
netmask 255.255.255.255 up

/
sbin
/
route add
-host

$VIP
dev lo:0

echo

"1"

&
gt;
/
proc
/
sys
/
net
/
ipv4
/
conf
/
lo
/
arp_ignore

echo

"2"

&
gt;
/
proc
/
sys
/
net
/
ipv4
/
conf
/
lo
/
arp_announce

echo

"1"

&
gt;
/
proc
/
sys
/
net
/
ipv4
/
conf
/
all
/
arp_ignore

echo

"2"

&
gt;
/
proc
/
sys
/
net
/
ipv4
/
conf
/
all
/
arp_announce
sysctl
-p

&
gt;
/
dev
/
null 2
&
gt;
&
amp;1

}

startTunnel
(
)
{
/
sbin
/
ifconfig
tunl0
$VIP
netmask 255.255.255.255 broadcast
$VIP
up

/
sbin
/
route add
-host

$VIP
dev tunl0

echo

"1"

&
gt;
/
proc
/
sys
/
net
/
ipv4
/
conf
/
tunl0
/
arp_ignore

echo

"2"

&
gt;
/
proc
/
sys
/
net
/
ipv4
/
conf
/
tunl0
/
arp_announce

echo

"1"

&
gt;
/
proc
/
sys
/
net
/
ipv4
/
conf
/
all
/
arp_ignore

echo

"2"

&
gt;
/
proc
/
sys
/
net
/
ipv4
/
conf
/
all
/
arp_announce
sysctl
-p

&
gt;
/
dev
/
null 2
&
gt;
&
amp;1

}

# ============ Main ===========
echo

-n

"please choose lvs type.(dr|tunnel) : "
read
LVSTYPE

LVSTYPE
=
`
echo

$LVSTYPE

|

tr

'A-Z'

'a-z'
`

case

"
$LVSTYPE
"

in

"dr"
)

startDR
;;

"tunnel"
)

startTunnel
;;

*
)

echo

-e

"please input
\"
dr
\"
or
\"
tunnel
\"
"
esac
运行脚本会出现选择LVS结构的提示，根据提示输入 dr或tunnel即可来完成dr或tunnel结构的LVS
查看LVS-Router状态
[root@ primary-lvs ~]#
ipvsadm -l

IP Virtual Server version 1.2.1 (size=4096)

Prot LocalAddress:Port Scheduler Flags

-> RemoteAddress:Port Forward Weight ActiveConn InActConn

TCP localhost:http wlc persistent 30

-> localhost:http Route 1 0 0

-> localhost:http Route 1 0
0
[root@ primary-lvs ~]#
tail -f /var/log/message
Sep 1 17:34:41 experiment pulse[6661]: STARTING PULSE AS MASTER

Sep 1 17:34:44 experiment lvs[6664]: starting virtual service lvs_server active: 80

Sep 1 17:34:44 experiment nanny[6669]: starting LVS client monitor for 192.168.108.180:80

Sep 1 17:34:44 experiment lvs[6664]: create_monitor for lvs_server/web_1 running as pid 6669

Sep 1 17:34:44 experiment nanny[6670]: starting LVS client monitor for 192.168.108.180:80

Sep 1 17:34:44 experiment nanny[6670]: [ active ] making 192.168.108.162:80 available

Sep 1 17:34:44 experiment lvs[6664]: create_monitor for lvs_server/web_2 running as pid 6670

Sep 1 17:34:44 experiment nanny[6669]: [ active ] making 192.168.108.161:80 available

Sep 1 17:34:49 experiment pulse[6666]: gratuitous lvs arps finished
Real Server 的apache日志
[root@ web-1 ~]# tail -f /var/log/httpd/accesss.log
192.168.108.108 - - [01/Sep/2009:17:36:52 +0800] "GET / HTTP/1.0" 200 24718 "-" "-"

192.168.108.108 - - [01/Sep/2009:17:36:54 +0800] "GET / HTTP/1.0" 200 24718 "-" "-"

192.168.108.108 - - [01/Sep/2009:17:36:56 +0800] "GET / HTTP/1.0" 200 24718 "-" "-"

192.168.108.108 - - [01/Sep/2009:17:36:58 +0800] "GET / HTTP/1.0" 200 24718 "-" "-"

192.168.108.108 - - [01/Sep/2009:17:37:00 +0800] "GET / HTTP/1.0" 200 24718 "-" "-"

192.168.108.108 - - [01/Sep/2009:17:37:02 +0800] "GET / HTTP/1.0" 200 24718 "-" "-"

192.168.108.108 - - [01/Sep/2009:17:37:04 +0800] "GET / HTTP/1.0" 200 24718 "-" "-"
这些访问记录即为Primary-LVS 上的nanny进程发起的监控操作。
原创文章，转载请注明: 转自

http://salogs.com
