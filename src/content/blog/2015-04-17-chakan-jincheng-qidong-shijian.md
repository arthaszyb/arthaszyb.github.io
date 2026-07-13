---
title: 查看进程启动时间
date: '2015-04-17'
description: ps 看到的进程启动时间超过一天会变成问号，本文通过 /proc/<pid>/stat 的 jiffies 值配合系统启动时间，精确计算进程的真实启动时刻。
category: linux
tags:
  - linux-admin
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
origin_url: http://xiaoy.info/author/wangyuanzheng/
---
Linux 中用 `ps` 查看进程状态可以看到系统启动时间，但如果启动超过一天，它会变成问号。要精确获取进程启动时间，需要借助 `/proc` 下的时间信息。

Linux 时间管理有两个基本概念：

- **xtime**：主要给 time 系函数使用，其 `tv_sec` 就是常说的 unix 时间戳，在 CMOS 中维护，关机时由电池维持。系统启动时通过 `get_cmos_time()` 赋初值，运行时每个 tick 通过 `update_wall_time_one_tick()` 更新。
- **jiffies**：内核全局变量，记录从系统启动以来的 tick 数——这是解题关键。

`/proc/<pid>/stat`（源码见 `fs/proc/array.c` 的 `proc_pid_stat()`）第 22 项是进程启动时的 jiffies 值，由它可算出进程启动时系统已开机的时间，再加上系统启动时间（`/proc/stat` 的 btime）即得进程启动时刻。

脚本如下：

```bash
#!/bin/sh
function show_start_time( )
{
    pid=$1
    JIFFIES=`cat /proc/$pid/stat | cut -d" " -f22`
    UPTIME=`grep btime /proc/stat | cut -d" " -f2`
    START_SEC=$(( $UPTIME + $JIFFIES / 100 ))
    date -d "1970-01-01 UTC $START_SEC seconds"
}

if [ $# > 1 ]
then
    for pid in $@; do show_start_time ${#pid};done
fi

while read pid; do show_start_time ${#pid}; done
```

脚本中的 100 是「用户可见」的 tick 频率（tick_rate），等于常量 `CLOCKS_PER_SEC`。新版内核实际 tick_rate 已远高于 100（i386 为 1000），但为兼容依赖旧值的程序，内核又做了一层封装保持这个数值。
