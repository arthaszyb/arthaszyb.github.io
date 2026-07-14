---
title: ps 和 top 的 CPU 占用率区别
date: '2015-12-09'
description: ps 显示的 CPU 占用率是进程整个生命周期的平均值，top 显示的是上次刷新以来的即时值，这解释了为何关闭进程后 ps 仍显示高占用。
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
origin_url: http://blog.csdn.net/beginning1126/article/details/8057527
---
一个常见现象：关掉包含 flash 的网页后，`ps` 显示它的 CPU 占用率仍然居高不下，而同时 `top` 显示的占用是 0。两者差异不是误差，而是统计口径不同。

`man ps` 的说明：

> CPU usage is currently expressed as the percentage of time spent running during the entire lifetime of a process. This is not ideal, and it does not conform to the standards that ps otherwise conforms to. CPU usage is unlikely to add up to exactly 100%.

`top` 的说明：

> %CPU -- CPU usage: The task's share of the elapsed CPU time since the last screen update, expressed as a percentage of total CPU time. In a true SMP environment, if 'Irix mode' is Off, top will operate in 'Solaris mode' where a task's cpu usage will be divided by the total number of CPUs.

由此可知：

- **ps** 从进程开始就统计，是整个生命周期的**平均**占用率。
- **top** 从上次刷新开始统计（一般几秒一刷），可视为**即时**占用率。

桌面系统通常更关注即时值，所以 `top` 的 CPU 占用率更符合需要。此外 top 默认 CPU 占用率之和不是 100% 而是「核数 × 100%」，因此单个进程占用超过 100% 是正常的。
