---
title: 线程监控
date: '2016-05-12'
description: >-
  显示进程的线程信息 ps -efL 显示每个线程和其所绑定的cpu ps -eo ruser,pid,ppid,lwp,psr,args -L | grep
  Conn|awk '{if($5==0)print $0}' top进去后按H可看线程信息.
category: linux
tags:
  - shell-scripting
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---
显示进程的线程信息

ps -efL

显示每个线程和其所绑定的cpu

ps -eo ruser,pid,ppid,lwp,psr,args -L | grep Conn|awk '{if($5==0)print $0}'

top进去后按H可看线程信息.
