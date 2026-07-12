---
title: 'lsof -i:137 与netstat差不多'
date: '2014-04-11'
description: >-
  若root@10.137.133.107:~# netstat -nap|grep 8080 tcp 0 0 0.0.0.0:8080 0.0.0.0:
  LISTEN - 查不出来8080被谁占用了,可用下面 lsof -i:8080 找到对应进程号,即可找到进程.
category: shell
tags: []
draft: false
source: evernote-local-db
lang: zh
---
若root@10.137.133.107:~# netstat -nap|grep 8080
tcp 0 0 0.0.0.0:8080 0.0.0.0:* LISTEN -
查不出来8080被谁占用了,可用下面
lsof -i:8080 找到对应进程号,即可找到进程.
