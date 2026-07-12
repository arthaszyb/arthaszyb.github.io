---
title: mysql-proxy的IP权限配置
date: '2014-10-08'
description: >-
  使用mysql-proxy来代理后台db后,后台db只需要配proxy的权限即可.所有实际客户端的访问权限需要proxy本身来配置(即哪些客户端IP和用户可以访问db). 
  下图是登陆后台db中查看到的信息: 可以看出后台db的访问源ip都是proxy服务器的ip.
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---
使用mysql-proxy来代理后台db后,后台db只需要配proxy的权限即可.所有实际客户端的访问权限需要proxy本身来配置(即哪些客户端IP和用户可以访问db).
下图是登陆后台db中查看到的信息:
可以看出后台db的访问源ip都是proxy服务器的ip.
首先通过主配置文件找到对应的权限配置文件:
再编辑权限配置文件:
重启proxy进程即可.
