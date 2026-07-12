---
title: linux下普通用户如何使用80端口启动程序
date: '2014-05-14'
description: >-
  大家都知道默认情况下linux的1024以下端口是只有root用户才有权限占用，于是我们的tomcat，apache，nginx等等程序如果想要用普通用户来占用80端口的话就会抛出permission
  denied的异常。  解决办法有两种： 1.使用非80端口启动程序，然后再用iptables做一个端口转发。
category: linux
tags:
  - nginx
  - apache
  - iptables
  - tomcat
draft: false
source: evernote-local-db
lang: zh
---
大家都知道默认情况下linux的1024以下端口是只有root用户才有权限占用，于是我们的tomcat，apache，nginx等等程序如果想要用普通用户来占用80端口的话就会抛出permission denied的异常。

解决办法有两种：

1.使用非80端口启动程序，然后再用iptables做一个端口转发。

2.假设我们需要启动的程序是nginx，那么这么做也可以达到目的。

一开始我们查看nginx的权限描述：

\-rwxr-xr-x 1 nginx dev 2408122 Sep 5 16:01 nginx

这个时候必然是无法正常启动的。

首先修改文件所属用户为root：

chown root nginx

然后再加上s权限：

chmod u+s nginx

再次查看权限描述的时候：

\-rwsr-xr-x 1 root root 2408122 Sep 5 16:01 nginx

这个时候再启动就没问题了。

参考：[http://bbs.chinaunix.net/thread-2212303-2-1.html](http://bbs.chinaunix.net/thread-2212303-2-1.html)
