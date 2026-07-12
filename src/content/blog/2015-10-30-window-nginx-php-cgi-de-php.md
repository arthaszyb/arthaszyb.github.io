---
title: window+nginx+php-cgi的php-cgi线程/子进程问题
date: '2015-10-30'
description: >-
  发布者：明媚， 时间：2014-06-17 03:22:36 见bbs http://bbs.csdn.net/topics/390803643/close
  正常的配置情况下,window的php-cgi是不会出现多线程/子进程的,如下配置 fastcgi\pass 127.0.0.1:9000;
category: php
tags:
  - nginx
  - php
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
---
发布者：[明媚，](http://mail.cfanz.cn/index.php?c=uc/main&id=11515)

时间：2014-06-17 03:22:36

见bbs

[http://bbs.csdn.net/topics/390803643/close](http://bbs.csdn.net/topics/390803643/close)

正常的配置情况下,window的php-cgi是不会出现多线程/子进程的,如下配置

fastcgi\_pass 127.0.0.1:9000;

这时也就意味着当二个php文件同时请求解析时,就会出现[阻塞](http://mail.cfanz.cn/index.php?c=search&key=%E9%98%BB%E5%A1%9E)处理,处理时间就会是a.php+b.php,而不是[并行](http://mail.cfanz.cn/index.php?c=search&key=%E5%B9%B6%E8%A1%8C),是串行时间了.

如a.php

sleep(100);echo 1;

b.php

echo 2;

先运行a.php,100秒后输出1.在运行a.php的同时,运行b.php,2却出现在100秒以后.假设...却不是一运行就[立刻](http://mail.cfanz.cn/index.php?c=search&key=%E7%AB%8B%E5%88%BB)出现,因为上面的配置受影响导致解析是串行时间了.

在google.翻了几个小时.

找到

The problem is that the PHP\_FCGI\_CHILDREN environment variable is ignored under windows, therefore php-cgi does not spawn children, and when PHP\_FCGI\_MAX\_REQUESTS is reached the process terminates.

Check on PHP's source, file cgi\_main.c, around line 1982:

#ifndef PHP\_WIN32

/\* Pre-fork, if required \*/

if (getenv("PHP\_FCGI\_CHILDREN")) {

char \* children\_str = getenv("PHP\_FCGI\_CHILDREN");

...

So, php with fast-cgi will \*\*never\*\* work on Windows.

The question is, why is forking disabled under windows?

-------------[https://bugs.php.net/bug.php?id=49859](https://bugs.php.net/bug.php?id=49859)\-----------

[得知](http://mail.cfanz.cn/index.php?c=search&key=%E5%BE%97%E7%9F%A5)window不支持?????

看到网上有很多人不懂怎么处理.而我的是测试服务器,觉得[就算](http://mail.cfanz.cn/index.php?c=search&key=%E5%B0%B1%E7%AE%97)了.灵机一动.就[手工](http://mail.cfanz.cn/index.php?c=search&key=%E6%89%8B%E5%B7%A5)的开起几个php-cgi等着吧.

于是[变通](http://mail.cfanz.cn/index.php?c=search&key=%E5%8F%98%E9%80%9A)方案时.

手工开起n个php-cgi等着

::window不支持 nginx的多线程,只能手工生成多个php-cgi

start "fcgi服务" /MIN /D "%batDir%php" php-cgi.exe -b 127.0.0.1:9000 -c "%batDir%php/php.ini"

start "fcgi服务" /MIN /D "%batDir%php" php-cgi.exe -b 127.0.0.1:9001 -c "%batDir%php/php.ini"

start "fcgi服务" /MIN /D "%batDir%php" php-cgi.exe -b 127.0.0.1:9002 -c "%batDir%php/php.ini"

start "fcgi服务" /MIN /D "%batDir%php" php-cgi.exe -b 127.0.0.1:9003 -c "%batDir%php/php.ini"

start "nginx服务" /MIN /D "%batDir%nginx" nginx.exe

然后nginx的

http {

#window 不能派[生子](http://mail.cfanz.cn/index.php?c=search&key=%E7%94%9F%E5%AD%90)进程,只能[人工](http://mail.cfanz.cn/index.php?c=search&key=%E4%BA%BA%E5%B7%A5)配 PHP\_FCGI\_CHILDREN 在window不起作用的

upstream fastcgi\_backend {

server 127.0.0.1:9000;

server 127.0.0.1:9001;

server 127.0.0.1:9002;

server 127.0.0.1:9003;

}

弄一个[备用](http://mail.cfanz.cn/index.php?c=search&key=%E5%A4%87%E7%94%A8)服务器

域名配置时,使用转发到备用服务器

server {

listen 80;

server\_name q.qq;

access\_log ./../log/q.qq.access.txt;

root d:/web/www;

location ~ \\.php$ {

fastcgi\_pass fastcgi\_backend;

}

}

ok.同时打开4个php是可以独立解析了,并行,但是5个呢?第5个还是要等等吧..........

#经yau测试,php不可解析.
