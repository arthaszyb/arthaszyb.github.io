---
title: Linux cpuinfo 详解
date: '2015-12-11'
description: 通过 /proc/cpuinfo 判断物理 CPU 数、核数、线程数与是否开启超线程的方法，附各字段（physical id / core id / siblings / cpu cores 等）的含义。
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
origin_url: http://icooke.blog.51cto.com/4123148/757555
---
![](/images/legacy/legacy-9a2a4c3e45.jpg)

Linux 中通过 `cat /proc/cpuinfo` 查看 CPU 信息，但要确定几个物理 CPU、几核、几线程，需要理解各字段的含义。

**判断依据**：

1. 具有相同 core id 的 cpu 是同一个 core 的超线程。
2. 具有相同 physical id 的 cpu 是同一颗 cpu 封装的线程或 cores。

统计脚本：

```bash
echo "logical CPU number:"
# 逻辑 CPU 个数
cat /proc/cpuinfo | grep "processor" | wc -l

echo "physical CPU number:"
# 物理 CPU 个数
cat /proc/cpuinfo | grep "physical id" | sort -u | wc -l

echo "core number in a physical CPU:"
# 每个物理 CPU 中 Core 的个数
cat /proc/cpuinfo | grep "cpu cores" | uniq | awk -F: '{print $2}'

# 查看 core id 的数量，即所有物理 CPU 上的 core 个数
cat /proc/cpuinfo | grep "core id" | uniq | wc -l

# 每个物理 CPU 中逻辑 CPU 的个数
cat /proc/cpuinfo | grep "siblings"
```

**各字段含义**（`/proc/cpuinfo` 中与多内核和超线程检查相关的 6 个条目）：

- `processor`：逻辑处理器的唯一标识符。
- `physical id`：每个物理封装的唯一标识符。
- `core id`：每个内核的唯一标识符。
- `siblings`：位于相同物理封装中的逻辑处理器数量。
- `cpu cores`：位于相同物理封装中的内核数量。
- `vendor id`：英特尔处理器为 `GenuineIntel`。

**判断规则**：

1. 拥有相同 physical id 的逻辑处理器共享同一物理插座，每个 physical id 代表一个唯一物理封装。
2. siblings 表示该物理封装上的逻辑处理器数量。
3. 每个 core id 代表一个唯一的处理器内核，相同 core id 的逻辑处理器位于同一内核。
4. 若一个以上逻辑处理器拥有相同 core id 和 physical id，则系统支持超线程。
5. 若两个及以上逻辑处理器拥有相同 physical id 但 core id 不同，则为多内核处理器。

**判断是否 64 位**：检查 cpuinfo 的 flags 区段是否有 `lm`（long mode）标识——64 位处理器有，32 位没有。
