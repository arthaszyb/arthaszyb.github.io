---
title: 查看僵尸进程
date: '2014-07-02'
description: 查看僵尸进程的方法，需要 kill -9 杀死其父进程。
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

查看所有僵尸进程：

```bash
ps -A -o stat,user,pid,ppid,%mem,%cpu,cmd | grep -e "^[Zz]"
```

说明：进程状态以 Z 或 z 开头的为僵尸进程。需要 `kill -9` 杀死它们的父进程。
