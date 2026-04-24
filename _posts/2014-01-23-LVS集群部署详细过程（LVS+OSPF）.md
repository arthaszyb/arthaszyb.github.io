---
title: "LVS集群部署详细过程（LVS+OSPF）"
date: 2014-01-23 02:39:26 +0000
categories: ["HA&LB"]
tags: []
description: "一、前言 2013年下半年大部时候都用在LVS实施上面了，一路摸爬滚打走来，遇到各种问题，感谢同事们对我的帮助和指导，感谢领导对我的信任，本文总结一下lvs集群（ospf+fullnat）的详细部署情况以及需要注意的问题点，先大概说一下LVS在我们公司的应用情况吧，LVS在我们公司走过了以下三个阶段： 阶段一，一个业务"
source: "evernote-local-db"
---

一、前言
2013年下半年大部时候都用在LVS实施上面了，一路摸爬滚打走来，遇到各种问题，感谢同事们对我的帮助和指导，感谢领导对我的信任，本文总结一下lvs集群（ospf+fullnat）的详细部署情况以及需要注意的问题点，先大概说一下LVS在我们公司的应用情况吧，LVS在我们公司走过了以下三个阶段：

阶段一，一个业务一套LVS调度（主备模式），优缺点如下：

优点：业务和业务之间隔离，A业务有问题不会影响B业务

缺点：1、管理不方便，2、LB多了虚拟路由ID冲突导致业务异常，3、业务量足够大LB成为瓶颈
阶段二，一个IDC一套LVS调度（主备模式），优缺点如下：

优点、业务统一集中管理

缺点：1、A业务突发上流（超过LB的承受能力）会影响整个集群上的业务，2、LB很容易成为瓶颈
阶段三，一个IDC一套调度（ospf+fullnat集群模式），优缺点如下：

优点：1、LB调度机自由伸缩，横向线性扩展（最多机器数受限于三层设备允许的等价路由数目 ），2、业务统一集中管理，3、LB资源全利用，All Active。不存在备份机

缺点：部署相对比较复杂
二、环境说明
1、
架构图
2、fullnat
是淘宝开源的一种lvs转发模式，主要思想：引入local address（内网ip地址），cip-vip转换为lip->rip，而 lip和rip均为IDC内网ip，可以跨vlan通讯，这刚好符合我们的需求，因为我们的内网是划分了vlan的。
3、环境说明
软件环境：
系统版本：centos6.4
keepalived版本：v1.2.2
ospfd版本：version 0.99.20
zebra版本： version 0.99.20
交换机：
外网核心交换IP：114.11x.9x.1
内网核心交换IP：10.10.2.1
LB1外网机柜交换IP：114.11x.9x.122
LB2外网机柜交换IP：114.11x.9x.160
LB1内网机柜交换IP：10.10.15.254
LB2内网机柜交换IP：10.10.11.254
LB1:
调度机IP（外网bond1）：10.10.254.18/30 ##外网需要配置一个与核心交换机联通的私有地址
调度机IP（内网bond0）：10.10.15.77
内网分发私有网段：10.10.251.0/24 ##local address
外网ospf转发网段网关：10.10.254.17
LB2:
调度机IP（外网bond1）：10.10.254.22/30 #外网需要配置一个与核心交换机联通的私有地址
调度机IP（内网bond0）：10.10.11.77
内网分发私有网段：10.10.250.0/24 ##local address
外网ospf转发网段网关：10.10.254.21
为了提升网络吞吐量，网络冗余，我们LB上网卡是做bond的，详细说明如下图：
三、具体部署
部署分三大部分，网卡绑定、ospf配置和lvs配置，下面依次介绍：
A、网卡绑定部分
1、服务器（LB1）上配置如下：
[root@lvs_cluster_C1 ~]# vi /etc/sysconfig
etwork-scripts/ifcfg-bond0
DEVICE=bond0
ONBOOT=yes
BOOTPROTO=static
IPADDR=10.10.11.77 ##LB2为10.10.15.77
NETMASK=255.255.255.0
USERCTL=no
TYPE=Ethernet
[root@lvs_cluster_C1 ~]# vi /etc/sysconfig
etwork-scripts/ifcfg-bond1
DEVICE=bond1
ONBOOT=yes
BOOTPROTO=static
IPADDR=10.10.254.22 ##LB2为10.10.254.18
NETMASK=255.255.255.252
USERCTL=no
TYPE=Ethernet
[root@lvs_cluster_C1 ~]# vi /etc/sysconfig
etwork-scripts/ifcfg-eth0
DEVICE=eth0
BOOTPROTO=none
ONBOOT=yes
USERCTL=no
MASTER=bond0
SLAVE=yes
[root@lvs_cluster_C1 ~]# vi /etc/sysconfig
etwork-scripts/ifcfg-eth1
DEVICE=eth1
BOOTPROTO=none
ONBOOT=yes
USERCTL=no
MASTER=bond0
SLAVE=yes
[root@lvs_cluster_C1 ~]# vi /etc/sysconfig
etwork-scripts/ifcfg-eth2
DEVICE=eth2
BOOTPROTO=none
ONBOOT=yes
USERCTL=no
MASTER=bond1
SLAVE=yes
[root@lvs_cluster_C1 ~]# vi /etc/sysconfig
etwork-scripts/ifcfg-eth3
DEVICE=eth3
BOOTPROTO=none
ONBOOT=yes
USERCTL=no
MASTER=bond1
SLAVE=yes
[root@lvs_cluster_C1 ~]# vi /etc/modprobe.d/openfwwf.conf
options b43 nohwcrypt=1qos=0
alias bond0 bonding
options bond0 miimon=100mode=0 #bond的几种模式的详细说明我之前写的博文中有介绍或者去百度、谷歌吧
alias bond1 bonding
options bond1 miimon=100mode=0
alias net-pf-10off
2、交换机上配置
bond0：10.10.15.77 eth0-GigabitEthernet1/0/29eth1-GigabitEthernet1/0/30
LB1对应的内网机柜交换机操作：
interfaceBridge-Aggregation10
port access vlan 150
interfaceGigabitEthernet1/0/29
port link-aggregation group 10
interfaceGigabitEthernet1/0/30
port link-aggregation group 10
bond1：10.10.254.18GigabitEthernet1/0/26GigabitEthernet1/0/28
LB1对应的外网机柜交换机操作：
vlan 50
interfaceBridge-Aggregation10
port access vlan 50
interfaceGigabitEthernet1/0/26
port link-aggregation group 10
interfaceGigabitEthernet1/0/28
port link-aggregation group 10
bond0：10.10.11.77eth0:GigabitEthernet1/0/14 eth1:GigabitEthernet1/0/05
LB2对应的内网机柜交换机操作：
interfaceBridge-Aggregation110
port access vlan 110
interfaceGigabitEthernet1/0/05
port link-aggregation group 110
interfaceGigabitEthernet1/0/14
port link-aggregation group 110
bond1：10.10.254.22eth2:GigabitEthernet1/0/38 eth3:GigabitEthernet1/0/46
LB2对应的外网机柜交换机操作：
vlan 60
interfaceBridge-Aggregation110
port access vlan 60
interfaceGigabitEthernet1/0/38
port link-aggregation group 110
interfaceGigabitEthernet1/0/46
port link-aggregation group 110
display link-aggregation verbose #查看绑定状态是否ok
B、ospf配置部分
1、交换机上配置：
外网核心操作：
vlan 50
vlan 60
interfaceVlan-interface50
ip address 10.10.254.17255.255.255.252
ospf timer hello 1
ospf timer dead 4
ospf dr-priority 96
interfaceVlan-interface60
ip address 10.10.254.21255.255.255.252
ospf timer hello 1
ospf timer dead 4
ospf dr-priority 95
#配置ospf的参数, timer hello是发送hello包的间隔,timer dead是存活的死亡时间。默认是10、40，hello包是ospf里面维持邻居关系的报文，这里配置是每秒发送一个，当到4秒还没有收到这个报文，就会认为这个邻居已经丢失，需要修改路由
ospf 1
area 0.0.0.0
network 10.10.254.160.0.0.3
network 10.10.254.200.0.0.3
内网核心：
interfaceVlan-interface110
ip address 10.10.250.1255.255.255.0sub
interfaceVlan-interface150
ip address 10.10.251.1255.255.255.0sub
2、服务器上配置
mkdir/etc/quagga/
mkdir-p /var/log/quagga/
chmod-R 777 /var/log/quagga/
配置文件：
cat /etc/quagga/zebra.conf
hostname lvs_cluster_C2 ##LB2为：hostname lvs_cluster_C1
cat /etc/quagga/ospfd.conf
log file /var/log/quagga/ospfd.log
log stdout
log syslog
interfacebond1
ip ospf hello-interval 1
ip ospf dead-interval 4
router ospf
ospf router-id 10.10.254.17 ##LB2为：10.10.254.21
log-adjacency-changes
auto-cost reference-bandwidth 1000
network 114.11x.9x.0/24area 0.0.0.0
network 10.10.254.16/30area 0.0.0.0 ##LB2为：10.10.254.20/30
ospfd的启动脚本：
[root@lvs_cluster_C1 ~]# cat /etc/init.d/ospfd
#!/bin/bash
# chkconfig: - 16 84
# config: /etc/quagga/ospfd.conf
### BEGIN INIT INFO
# Provides: ospfd
# Short-Description: A OSPF v2 routing engine
# Description: An OSPF v2 routing engine for use with Zebra
### END INIT INFO
# source function library
. /etc/rc.d/init.d/functions
# Get network config
. /etc/sysconfig
etwork
# quagga command line options
. /etc/sysconfig/quagga
RETVAL=0
PROG="ospfd"
cmd=ospfd
LOCK_FILE=/var/lock/subsys/ospfd
CONF_FILE=/etc/quagga/ospfd.conf
case"$1"in
start)
# Check that networking is up.
[ "${NETWORKING}"= "no"]
&
&
exit1
# The process must be configured first.
[ -f $CONF_FILE ] || exit6
if[ `id-u` -ne0 ]; then
echo$"Insufficient privilege"1>
&
2
exit4
fi
echo-n $"Starting $PROG: "
daemon $cmd -d $OSPFD_OPTS
RETVAL=$?
[ $RETVAL -eq0 ]
&
&
touch$LOCK_FILE
echo
;;
stop)
echo-n $"Shutting down $PROG: "
killproc $cmd
RETVAL=$?
[ $RETVAL -eq0 ]
&
&
rm-f $LOCK_FILE
echo
;;
restart|reload|force-reload)
$0 stop
$0 start
RETVAL=$?
;;
condrestart|try-restart)
if[ -f $LOCK_FILE ]; then
$0 stop
$0 start
fi
RETVAL=$?
;;
status)
status $cmd
RETVAL=$?
;;
*)
echo$"Usage: $PROG {start|stop|restart|reload|force-reload|try-restart|status}"
exit2
esac
exit$RETVAL
zebra的启动脚本:
[root@lvs_cluster_C1 ~]# cat /etc/init.d/zebra
#!/bin/bash
# chkconfig: - 1585
# config: /etc/quagga/zebra.conf
### BEGIN INIT INFO
# Provides: zebra
# Short-Description: GNU Zebra routing manager
# Description: GNU Zebra routing manager
### END INIT INFO
# source functionlibrary
. /etc/rc.d/init.d/functions
# quagga command line options
. /etc/sysconfig/quagga
RETVAL=0
PROG="zebra"
cmd=zebra
LOCK_FILE=/var/lock/subsys/zebra
CONF_FILE=/etc/quagga/zebra.conf
case"$1"in
start)
# Check that networking isup.
[ "${NETWORKING}"= "no"]
&
&
exit 1
# The process must be configured first.
[ -f $CONF_FILE ] || exit 6
if[ `id -u` -ne 0]; then
echo $"Insufficient privilege"1>
&
2
exit 4
fi
echo -n $"Starting $PROG: "
/sbin/ip route flush proto zebra
daemon $cmd -d $ZEBRA_OPTS
RETVAL=$?
[ $RETVAL -eq 0]
&
&
touch $LOCK_FILE
echo
;;
stop)
echo -n $"Shutting down $PROG: "
killproc $cmd
RETVAL=$?
[ $RETVAL -eq 0]
&
&
rm -f $LOCK_FILE
echo
;;
restart|reload|force-reload)
$0stop
$0start
RETVAL=$?
;;
condrestart|try-restart)
if[ -f $LOCK_FILE ]; then
$0stop
$0start
fi
RETVAL=$?
;;
status)
status $cmd
RETVAL=$?
;;
*)
echo $"Usage: $0 {start|stop|restart|reload|force-reload|try-restart|status}"
exit 2
esac
exit $RETVAL

quagga的配置：
[root@lvs_cluster_C1 ~]# cat /etc/sysconfig/quagga
#
# Default: Bind all daemon vtys to the loopback(s) only
#
QCONFDIR="/etc/quagga"
BGPD_OPTS="-A 127.0.0.1 -f ${QCONFDIR}/bgpd.conf"
OSPF6D_OPTS="-A ::1 -f ${QCONFDIR}/ospf6d.conf"
OSPFD_OPTS="-A 127.0.0.1 -f ${QCONFDIR}/ospfd.conf"
RIPD_OPTS="-A 127.0.0.1 -f ${QCONFDIR}/ripd.conf"
RIPNGD_OPTS="-A ::1 -f ${QCONFDIR}/ripngd.conf"
ZEBRA_OPTS="-A 127.0.0.1 -f ${QCONFDIR}/zebra.conf"
ISISD_OPTS="-A ::1 -f ${QCONFDIR}/isisd.conf"
# Watchquagga configuration (please check timer values before using):
WATCH_OPTS=""
WATCH_DAEMONS="zebra bgpd ospfd ospf6d ripd ripngd"
# To enable restarts, uncomment thisline (but first be sure to edit
# the WATCH_DAEMONS line to reflect the daemons you are actually using):
#WATCH_OPTS="-Az -b_ -r/sbin/service_%s_restart -s/sbin/service_%s_start -k/sbin/service_%s_stop"
3、服务启动：
/etc/init.d/zebra start
&
&
chkconfig zebra on
/etc/init.d/ospfd start
&
&
chkconfig ospfd on
PS：先启动zebra再启动ospf，不然LB会学习不到路由信息
C、lvs部署部分
1、安装组件
#安装带fullnat功能内核（淘宝已开源）
rpm -ivh kernel-2.6.32-220.23.3.el6.x86_64.rpm kernel-firmware-2.6.32-220.23.3.el6.x86_64.rpm --force
#安装lvs-tools(ipvsadm,keepalived,quagga),这些工具都是依据新内核修改过的，所以不要用原生的
rpm -ivh lvs-tools-1.0.0-77.el6.x86_64.rpm

2、添加local_address网段
cat /opt/sbin/ipadd.sh
#!/bin/bash
arg=$1
dev=bond0
network="10.10.251"##LB2 10.10.250
seq="2 254"
functionstart() {
fori in`seq $seq`
do
ip addr add $network.$i/32dev $dev
done
}
functionstop() {
fori in`seq $seq`
do
ip addr del $network.$i/32dev $dev
done
}
case"$arg"in
start)
start
;;
stop)
stop
;;
restart)
stop
start
;;
esac
echo "/opt/sbin/ipadd.sh">> /etc/rc.local ##加入开机启动
3、keepalived的配置文件
1>配置问的大概说明
.
├── gobal_module ##全局配置文件
├── info.txt ##记录集群部署的业务信息
├── keepalived.conf ##主配置文件
├── kis_ops_test.conf ##业务配置文件
├── local_address.conf ##local_address
├── lvs_module ##所有业务的include配置
└── realserver #rs目录
└── kis_ops_test_80.conf ##业务的realserver的配置文件
2>配置文件的内容说明
[root@lvs_cluster_C1 keepalived]# cat /etc/keepalived/gobal_module

! global configure file
global_defs {
notification_email {
navy@qq.com
}
notification_email_from navy@qq.com
smtp_server 127.0.0.1
smtp_connect_timeout 30
router_id LVS_CLUSTER
}

[root@lvs_cluster_C1 keepalived]# cat /etc/keepalived/local_address.conf

1
2
3 local_address_group laddr_g1 {
10.10.250.2-254 ##LB1 10.10.251.2-254
}

PS：local_address每个LB不能重复
[root@lvs_cluster_C1 keepalived]# cat /etc/keepalived/lvs_module

include./kis_ops_test.conf #测试

[root@lvs_cluster_C1 keepalived]# cat /etc/keepalived/kis_ops_test.conf

#把local_address include进来
include./local_address.conf
#VIP组，可以有多个vip
virtual_server_group kis_ops_test_80 {
114.11x.9x.18580 #kis_ops_test
}
virtual_server group kis_ops_test_80 {
delay_loop 7
lb_algo wrr
lb_kind FNAT
protocol TCP
nat_mask 255.255.255.0
persistence_timeout 0 #回话保持机制，默认为0
syn_proxy ##开启此参数可以有效防范SynFlood攻击
laddr_group_name laddr_g1
alpha #开启alpha模式：启动时默认rs是down的状态，健康检查通过后才会添加到vs pool
omega #开启omega模式，清除rs时会执行相应的脚本（rs的notify_up，quorum_up）
quorum 1 #服务是否有效的阀值（正常工作rs的wight值）
hysteresis 0 #延迟系数跟quorum配合使用
#高于或低于阀值时会执行以下脚本。
quorum_up " ip addr add 114.11x.9x.185/32 dev lo ;"
quorum_down " ip addr del 114.11x.9x.185/32 dev lo ;"
include./realserver/kis_ops_test_80.conf
}

[root@lvs_cluster_C1 ~]# cat /etc/keepalived/realserver/kis_ops_test_80.conf

#real_server 10.10.2.240 80 {
# weight 1
# inhibit_on_failure
# TCP_CHECK {
# connect_timeout 3
# nb_get_retry 3 ##TCP_CHECK 方式此参数不生效
# delay_before_retry 3 ##TCP_CHECK 方式此参数不生效
# connect_port 80
# }
#}
real_server 10.10.2.240 80 {
weight 1
inhibit_on_failure
HTTP_GET {
url {
path /abc
digest 134b225d509b9c40647377063d211e75
}
connect_timeout 3
nb_get_retry 3
delay_before_retry 3
connect_port 80
}
}

到这里LB上的配置基本上完成了，还有一点需要配置哈，那就是要在LB上配置路由策略，不然vip是ping不通的，但是不影响http访问，具体配置如下：
echo "from 114.11x.9x.0/24 table LVS_CLUSTER">/etc/sysconfig
etwork-scripts/rule-bond1
echo "default table LVS_CLUSTER via 10.10.254.21 dev bond1">/etc/sysconfig
etwork-scripts/route-bond1 ##LB1 via 10.10.254.17
echo "203 LVS_CLUSTER">> /etc/iproute2/rt_tables
/etc/init.d
etwork restart ##重启网络

四、realserver的配置
1、realserver需要更换带toa模块的内核，如果不更改的话你的web服务（比如nginx）的日志获取不到用户的真实IP，而是记录了LB的local_address的IP
centos5系列的系统：
rpm -ivh kernel-2.6.18-274.18.2.el5.kis_toa.x86_64.rpm
centos6系列的系统：
rpm -ivh kernel-toa-2.6.32-220.23.3.el6.kis_toa.x86_64.rpm
2、realserver要能和LB的local_address互访即可，这个要看大家的内网环境了。
五、LB的调优
1、网卡调优，这个很重要，如果不调优大流量下，cpu单核耗尽会把LB搞死的，本人亲身体验过，

具体看参考我之前的文章,
高并发、大流量网卡调优
2、内核参数调优
#该参数决定了，网络设备接收数据包的速率比内核处理这些包的速率快时，允许送到队列的数据包的最大数目
net.core.netdev_max_backlog = 500000
#开启路由转发功能
net.ipv4.ip_forward = 1
#修改文件描述符
fs.nr_open = 5242880
fs.file-max = 4194304
sed -i 's/1024/4194304/g'/etc/security/limits.conf
PS：目前集群有这么个问题，realserver不能访问自己的vip，因为有些业务确实有这样的需要，最后想到以下解决办法：
1、如果realserver上有公网IP且和vip是同一个段则需要加路由：

route add -net vip netmask 255.255.255.255gw 114.11x.9x.1

2、如果realserver走的nat网关，而nat网关的出口是和vip同一个网段，那就需要在nat上加如上功能的路由即可 。
