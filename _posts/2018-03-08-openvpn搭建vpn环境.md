---
title: "openvpn搭建vpn环境"
date: 2018-03-08 15:08:35 +0000
categories: ["科学上网"]
tags: []
description: "服务端： 下载openvpn，这个网站当然被墙了，所以你想办法吧。从 https://openvpn.net/index.php/access-server/download-openvpn-as-sw/113.html?osfamily=CentOS 获得到rpm包 执行rpm -Uvh openvpn-xxx.rp"
source: "evernote-local-db"
---

openvpn搭建vpn环境
服务端：
下载openvpn，这个网站当然被墙了，所以你想办法吧。从
https://openvpn.net/index.php/access-server/download-openvpn-as-sw/113.html?osfamily=CentOS
获得到rpm包
执行rpm -Uvh openvpn-xxx.rpm包，安装成功。安装后的程序目录通过ll /usr/bin/ |grep vpn发现在/usr/local/openvpn-as中，这时其实已经启动了web服务了，不信你可以netstat看看。
passwd openvpn设置密码，这是用于web登录的。
登录vpn管理站点，是443端口，用进去以admin重新登录，可以看到整体服务情况，一般是running状态。
客户端
客户端照样web登录该443站点，以connect身份登录，帐号密码仍然是服务器的那个账号。你需要按照os下载对应的客户端，看起来只有windows的客户端是集成在服务端中，其他的就被指到官网去下载了。
