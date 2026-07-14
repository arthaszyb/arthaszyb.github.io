---
title: Linux top 命令简介
date: '2015-09-11'
description: top 命令各区域字段（系统负载、任务数、CPU 各态百分比、内存、进程列表列）的含义，以及常用交互操作指令速查。
category: linux
tags:
  - linux-admin
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---
![](/images/legacy/legacy-95784dbdbc.png)

top 界面分为两部分：上半部分显示系统整体性能，下半部分显示各进程信息，光标处用于输入操作命令。

## 界面字段说明

**第一行**（与 uptime 相同，按 `l` 可显隐）：

- 系统当前时间
- `up 1:26`：系统开机到现在经过的时间
- `2 users`：当前在线用户数
- `load average: 0.00, 0.00, 0.00`：系统 1、5、15 分钟的 CPU 负载

**第二行（Tasks 与 CPU）**：

- `38 total`：当前进程数；`1 running` 运行中；`37 sleeping` 睡眠；`0 stopped` 停止；`0 zombie` 僵死
- `%us`：用户态进程占用 CPU 百分比（不含 renice 为负的任务）
- `%sy`：内核占用 CPU 百分比
- `%ni`：renice 为负的任务用户态 CPU 百分比
- `%id`：空闲 CPU 百分比
- `%wa`：等待 I/O 的 CPU 百分比
- `%hi`：硬中断时间百分比；`%si`：软中断时间百分比；`%st`：被虚拟化偷走的时间百分比

**第三行（内存）**：total 物理内存总量、used 已用、free 空闲、buffers 用作内核缓存的量；Swap 行为交换空间的 total/used/free 及 cached。

**进程列表列**：

- `PID` 进程 ID、`USER` 所有者、`PR` 优先级（越小越优先）、`NI` nice 值
- `VIRT` 虚拟内存、`RES` 物理内存、`SHR` 共享内存
- `S` 状态（S 休眠 / R 运行 / Z 僵死 / N 优先值为负）
- `%CPU` CPU 使用率、`%MEM` 物理内存占比
- `TIME+` 启动后累计占用的 CPU 时间、`COMMAND` 启动命令名

## 常用交互指令

- `q` 退出、`<Space>` 立即刷新、`s` 设置刷新间隔
- `c` 显示完整命令、`t` 显隐进程和 CPU 状态、`m` 显隐内存状态、`l` 显隐 uptime
- `f` 增减显示字段、`S` 累计模式（子进程 CPU 时间累计到父进程）
- `P` 按 %CPU 排序、`T` 按 TIME+ 排序、`M` 按 %MEM 排序
- `u` 指定显示用户进程、`r` 修改进程 renice 值、`k` kill 进程、`i` 只显示运行中进程
- `W` 保存设置到 `~/.toprc`、`h` 帮助
