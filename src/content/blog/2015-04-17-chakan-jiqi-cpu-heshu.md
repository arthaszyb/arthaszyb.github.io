---
title: 查看机器CPU核数
date: '2015-04-17'
description: >-
  1 查看物理cpu个数 grep 'physical id' /proc/cpuinfo | sort -u 2 查看核心数量 grep 'core id'
  /proc/cpuinfo | sort -u | wc -l 3 查看线程数 grep 'processor' /proc/cpuinfo | sort
  -u
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
1. 1

**查看物理cpu个数**

grep 'physical id' /proc/cpuinfo | sort -u

1. 2

**查看核心数量**

grep 'core id' /proc/cpuinfo | sort -u | wc -l

1. 3

**查看线程数**

grep 'processor' /proc/cpuinfo | sort -u | wc -l

1. 4

**实例1**

命令执行结果如图所示，根据结果得知，此服务器有1个cpu，6个核心，每个核心2线程，共12线程。
