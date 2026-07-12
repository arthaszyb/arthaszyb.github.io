---
title: 'Linux查看机器开放的端口2009-03-10 14:39:41'
date: '2014-10-13'
description: >-
  Linux查看机器开放的端口 2009-03-10 14:39:41 标签：端口 RHEL5 linux nmap netstat
  原创作品，允许转载，转载时请务必以超链接形式标明文章 原始出处 、作者信息和本声明。 否则将追究法律责任。
category: linux
tags:
  - mysql
  - vmware
  - dns
draft: false
source: evernote-local-db
lang: zh
---
Linux查看机器开放的端口

2009-03-10 14:39:41

标签：[端口](http://blog.51cto.com/tag-%E7%AB%AF%E5%8F%A3.html) [RHEL5](http://blog.51cto.com/tag-RHEL5.html) [linux](http://blog.51cto.com/tag-linux.html) [nmap](http://blog.51cto.com/tag-nmap.html) [netstat](http://blog.51cto.com/tag-netstat.html)

原创作品，允许转载，转载时请务必以超链接形式标明文章 [原始出处](http://snailwarrior.blog.51cto.com/680306/137291) 、作者信息和本声明。否则将追究法律责任。[http://snailwarrior.blog.51cto.com/680306/137291](http://snailwarrior.blog.51cto.com/680306/137291)

【数据资料来自互联网，个人收集总结

![](/images/legacy/legacy-fe349c3adc.gif)

】

**一、使用nmap扫描机器开放的端口**

我用这个工具的目的是查看自己服务器RHEL5所开放的端口，发现没有必要的端口就关闭，并不是用来扫描别的机器的端口……善哉善哉……

nmap是个跨平台的工具，在Linux、Linux,FreeBSD,UNIX,Windows下都有可用的版本。

官方网站：[\[url\]http://insecure.org/nmap/\[/url\]](http://insecure.org/nmap/)

主要功能：

1、测一组主机是否在线

2、扫描主机端口，嗅探所提供的网络服务

3、推断主机所用的操作系统

我用到的几个命令如下：

检查我所在网段有多少台“活着”的机器

\[root@pps ~\]# nmap -sP 192.168.32.0/24

Starting Nmap 4.11 ( [\[url\]http://www.insecure.org/nmap/\[/url\]](http://www.insecure.org/nmap/) ) at 2009-03-10 13:31 CST

Host 192.168.32.1 appears to be up.

MAC Address: 00:50:56:C0:00:08 (VMWare)

Host hoho.com (192.168.32.50) appears to be up.

Host 192.168.32.254 appears to be up.

MAC Address: 00:50:56:E1:E2:F8 (VMWare)

Nmap finished: 256 IP addresses (3 hosts up) scanned in 5.476 seconds

我感觉这个结果不真实，因为我的虚拟机不止一个IP，有些IP并没有检测到。但是自己没有把握说明白原因，于是就不多说了。

检查我本身的机器开放了哪些端口

\[root@pps ~\]# nmap -sTU localhost

Starting Nmap 4.11 ( [\[url\]http://www.insecure.org/nmap/\[/url\]](http://www.insecure.org/nmap/) ) at 2009-03-10 13:33 CST

Interesting ports . localhost.localdomain (127.0.0.1):

Not shown: 3156 closed ports

PORT STATE SERVICE

25/tcp open smtp

53/tcp open domain

80/tcp open http

111/tcp open rpcbind

631/tcp open ipp

953/tcp open rndc

3306/tcp open mysql

53/udp open|filtered domain

111/udp open|filtered rpcbind

631/udp open|filtered unknown

Nmap finished: 1 IP address (1 host up) scanned in 2.875 seconds

根据实际的需要，用防火墙来“屏蔽”对一些端口的访问，确保安全。

参数说明：

-sS/sT/sA/sW/sM: TCP SYN/Connect()/ACK/Window/Maimon scans

比较实用的还有以下三个：

SYN扫描,又称为半开放扫描，它不打开一个完全的TCP连接，执行得很快：

nmap -sS 192.168.32.0/24

当SYN扫描不能用时，TCP Connect()扫描就是默认的TCP扫描：

nmap -sT 192.168.32.0/24

UDP扫描用-sU选项,UDP扫描发送空的(没有数据)UDP报头到每个目标端口:

nmap -sU 192.168.32.0/24

Windows下的NmapWin等使用可以参考：

[\[url\]http://hi.baidu.com/xzqmr/blog/item/67226a8dfde32a13b31bbad3.html\[/url\]](http://hi.baidu.com/xzqmr/blog/item/67226a8dfde32a13b31bbad3.html)
