---
title: 查看机器 CPU 核数
date: '2015-04-17'
description: 通过 /proc/cpuinfo 查看物理 CPU 个数、每颗 CPU 的核心数与总线程数的命令速查。
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---
从 `/proc/cpuinfo` 中提取物理 CPU 个数、核心数与线程数：

```bash
# 查看物理 CPU 个数
grep 'physical id' /proc/cpuinfo | sort -u

# 查看核心数量
grep 'core id' /proc/cpuinfo | sort -u | wc -l

# 查看线程数
grep 'processor' /proc/cpuinfo | sort -u | wc -l
```

例如某服务器的执行结果显示：1 个 CPU、6 个核心、每核心 2 线程，共 12 线程。
