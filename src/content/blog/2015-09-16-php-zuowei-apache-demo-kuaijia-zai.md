---
title: php作为apache的模块加载
date: '2015-09-16'
description: PHP 作为 Apache 模块加载时的工作原理，以及如何确认 Apache 是否成功加载 PHP 模块。
category: php
tags:
  - apache
  - php
draft: false
source: evernote-local-db
lang: zh
---
需求:为检查所有apache+php的服务器是否安装phpips,需要找到php的主目录.

1\. 检查apache是否调用php

2\. 查找php的主路径

作为apache的模块加载后，php就成为了apache的一部分。当apache接收到被判断为是php脚本的url请求后，就会把这个url交给php来处理，这整个过程都是在apache内部实现的，这也是为什么用模块方式在apache里跑php时，系统进程里只能看得到apache而没有php出现的原因.

使用ldd,strace都无法追踪到调用php的踪迹.还是使用lsof来看看

lsof -p apache主进程号 |grep php

![](/images/legacy/legacy-72c368c5b1.png)

鬼影终于现身啦!

同时也可以直接查看进程的smap查看到

![](/images/legacy/legacy-88bf4fc5ac.png)
