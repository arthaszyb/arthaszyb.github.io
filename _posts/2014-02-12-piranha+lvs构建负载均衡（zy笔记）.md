---
title: "piranha+lvs构建负载均衡（zy笔记）"
date: 2014-02-12 08:23:05 +0000
categories: ["HA&LB"]
tags: []
description: "1.在两台dr服务器上yum install piranha,会依赖安装httpd,php和ipvsadm. 2.dr服务器上开启ip转发。sysctl -p 3.dr server上开启piranha-gui service piranha-gui start 4.dr server上配置piranha的密码 pir"
source: "evernote-local-db"
---

1.在两台dr服务器上yum install piranha,会依赖安装httpd,php和ipvsadm.

2.dr服务器上开启ip转发。sysctl -p
3.dr server上开启piranha-gui service piranha-gui start
4.dr server上配置piranha的密码 piranha-passwd xxxxx
5.web页面打开http：//dr服务器ip:3636 进入web配置页面以piranha用户配置lvs和ha
6.rs服务器上编辑脚本lvsrs.sh：
#!/bin/bash

VIP=192.168.34.20

case "$1" in

start)

/sbin/ifconfig lo:0 $VIP broadcast $VIP netmask 255.255.255.255 up

/sbin/route add -host $VIP dev lo:0

echo "1" >/proc/sys
et/ipv4/conf/lo/arp_ignore

echo "2" >/proc/sys
et/ipv4/conf/lo/arp_announce

echo "1" >/proc/sys
et/ipv4/conf/all/arp_ignore

echo "2" >/proc/sys
et/ipv4/conf/all/arp_announce

sysctl -p

echo "Real Server start OK."

;;

stop)

ifconfig lo:0 down

route del $VIP >/dev
ull 2>
&
1

echo "0" >/proc/sys
et/ipv4/conf/lo/arp_ignore

echo "0" >/proc/sys
et/ipv4/conf/lo/arp_announce

echo "0" >/proc/sys
et/ipv4/conf/all/arp_ignore

echo "0" >/proc/sys
et/ipv4/conf/all/arp_announce

sysctl -p

echo "Real Server stop OK."

;;

*)

echo "$0:Usage:$0 {start|stop}"
esac
7.rs服务器上执行lvsrs.sh start
8.dr服务器上启动pulse服务 service pulse start,检查虚拟ip是否加载。
