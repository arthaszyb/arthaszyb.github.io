---
title: Linux的IO性能监控工具iostat详解
date: '2014-08-21'
description: "iostat用来监控磁盘IO性能，可显示设备的TPS、读写速率、响应时间等指标。常用参数：-d显示设备使用，-x显示扩展信息，-c显示CPU状态。"
category: linux
tags:
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.ha97.com/4546.html
---

iostat 是用来监控磁盘 IO 性能的工具，可显示设备使用状态和 CPU 统计数据。

## 基本使用

```bash
iostat -d -k 1 10
```

参数说明：
- `-d`：显示设备（磁盘）使用状态
- `-k`：强制使用 Kilobytes 为单位
- `1 10`：每隔 1 秒刷新一次，共显示 10 次

## 输出字段解释

```text
Device: tps kB_read/s kB_wrtn/s kB_read kB_wrtn
sda 39.29 21.14 1.44 441339807 29990031
```

- `tps`：每秒的传输次数（I/O 请求数）
- `kB_read/s`：每秒从设备读取的数据量
- `kB_wrtn/s`：每秒向设备写入的数据量
- `kB_read`：读取的总数据量
- `kB_wrtn`：写入的总数据量

## 扩展信息（-x 参数）

```bash
iostat -d -x -k 1 10
```

扩展输出：

```text
Device: rrqm/s wrqm/s r/s w/s rsec/s wsec/s rkB/s wkB/s avgrq-sz avgqu-sz await svctm %util
sda 1.56 28.31 7.80 31.49 42.51 2.92 21.26 1.46 1.16 0.03 0.79 2.62 10.28
```

- `rrqm/s`：每秒合并的读请求数
- `wrqm/s`：每秒合并的写请求数
- `r/s`：每秒读请求数
- `w/s`：每秒写请求数
- `rsec/s`：每秒读扇区数
- `wsec/s`：每秒写扇区数
- `rkB/s`：每秒读 KB 数
- `wkB/s`：每秒写 KB 数
- `avgrq-sz`：平均每次 I/O 操作的数据大小（扇区）
- `avgqu-sz`：平均 I/O 队列长度
- `await`：平均 I/O 响应时间（毫秒），建议 < 5ms
- `svctm`：平均 I/O 服务时间（毫秒）
- `%util`：一秒中用于 I/O 操作的时间百分比。接近 100% 表示设备满负荷

## CPU 统计

```bash
iostat -c 1 10
```

输出 CPU 使用率（user, nice, sys, iowait, idle）。

## 常见用法

```bash
# 查看 TPS 和吞吐量
iostat -d -k 1 10

# 查看设备使用率和响应时间
iostat -d -x -k 1 10

# 查看 CPU 状态
iostat -c 1 10
```

## 性能分析

- **%util 接近 100%**：设备已经满负荷，磁盘可能是瓶颈
- **idle < 70%**：IO 压力较大，通常有较多 wait
- **await 远大于 svctm**：IO 队列太长，应用响应时间会变慢
- **svctm 接近 await**：基本没有队列等待，磁盘性能充足

如果响应时间过高可考虑：更换更快的磁盘、调整内核 elevator 算法、优化应用、升级 CPU。
