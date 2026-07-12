---
title: 查看僵尸进程
date: '2014-07-02'
description: 'ps -A -o stat,user,pid,ppid,%mem,%cpu,cmd|grep -e "^\[Zz\]" 需要kill -9 他们的父进程.'
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
ps -A -o stat,user,pid,ppid,%mem,%cpu,cmd|grep -e "^\[Zz\]"

需要kill -9 他们的父进程.
