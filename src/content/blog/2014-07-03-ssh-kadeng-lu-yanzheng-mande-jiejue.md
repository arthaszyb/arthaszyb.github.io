---
title: SSH卡登陆，验证慢的解决方法
date: '2014-07-03'
description: >-
  作者： 魏延是反贼.  分类： Linux, 生活·随笔
  最近开发那边发现有一个SSH连接的问题，每次他从他的虚拟机连接我们这边服务器的时候，都会出现验证速度慢，输入完ssh
  xxx.xxx.xxx.xxx之后，要经过很长时间的没响应过程。
category: linux
tags:
  - ssh
draft: false
source: evernote-local-db
lang: zh
---
作者： [魏延是反贼](http://www.weiyan.me/author/admin). 分类： [Linux](http://www.weiyan.me/category/work/linux), [生活·随笔](http://www.weiyan.me/category/life)

最近开发那边发现有一个SSH连接的问题，每次他从他的虚拟机连接我们这边服务器的时候，都会出现验证速度慢，输入完ssh xxx.xxx.xxx.xxx之后，要经过很长时间的没响应过程。

研究了一下，发现是这样：

SSH的配置文件sshd\_config里有这么一个参数：

GSSAPIAuthentication yes

官方对这个参数的说明很傻：

Specifies whether user authentication based on GSSAPI is allowed.The default is ”yes”. Note that this option applies to proto-col version 2 only.

(是否允许用户基于GSSAPI的验证，默认是’yes’,这个选项只用于SSH-2。)

实际上，这个GSSAPI认证，是在用户登录的时候，客户端要对服务器端的IP地址进行反向解析，如果服务器的IP地址没有配置PTR记录，那么解析不通过，就会被卡住~等待很长一段时间之后~才能连接~。

所以我们要做的就是：设置为no即可。

很多时候大家在使用ssh工具连接某个服务器的时候，如果遇到卡验证，基本上都是在这个配置上卡住了。改了即可。
