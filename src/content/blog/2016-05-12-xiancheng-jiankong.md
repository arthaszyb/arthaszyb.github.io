---
title: 线程监控
date: '2016-05-12'
description: '使用 ps 和 top 命令查看进程线程信息及其绑定的 CPU。'
category: linux
tags:
  - shell-scripting
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---
## 显示进程的线程信息

```bash
ps -efL
```

## 显示每个线程及其所绑定的 CPU

```bash
ps -eo ruser,pid,ppid,lwp,psr,args -L | grep Conn | awk '{if($5==0)print $0}'
```

## 在 top 中查看线程信息

进入 top 后按 `H` 可查看线程信息。
