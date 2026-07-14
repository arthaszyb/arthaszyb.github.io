---
title: 为什么在Python里推荐使用多进程而不是多线程？
date: '2017-02-10'
description: GIL 的限制导致 Python 多线程无法真正并行。CPU 密集型代码中多线程因频繁竞争 GIL 反而降低效率，IO 密集型代码可获益。多进程各自独立 GIL，能真正并行，是多核系统的首选。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
origin_url: http://m.blog.csdn.net/article/details?id=51243137
---

## GIL 的限制

GIL（Global Interpreter Lock，全局解释器锁）是 Python 设计之初为数据安全做的决定。每个 Python 进程中只有一个 GIL，线程必须获取 GIL 才能执行。

在 Python2.x 中，GIL 在线程遇到 IO 操作或 ticks 计数达到 100 时释放。在 Python3.x 中改为使用计时器（执行时间达到阈值后释放），但仍未根本解决"同一时刻只能执行一个线程"的问题。

## 多线程性能分析

**CPU 密集型代码**（循环处理、计数等）：ticks 计数快速达到阈值，频繁触发 GIL 释放与竞争，线程来回切换消耗资源，效率低下。

**IO 密集型代码**（文件处理、网络爬虫等）：单线程 IO 等待会浪费 CPU 时间；多线程能在某线程等待时切换到其他线程，提高效率。

## 多核环境下的问题

多核多线程比单核情况更差。原因是：单核 CPU 释放 GIL 后被唤醒的线程能无缝获取；而多核下，其他 CPU 上的线程都会竞争 GIL，且 GIL 可能立即被原 CPU 再次拿到，导致其他线程"醒着等待"，造成线程颠簸（thrashing），效率更低。

## 为什么使用多进程

每个进程有各自独立的 GIL，互不干扰，能真正意义上并行执行。在 Python 中，多进程执行效率优于多线程（特别是在多核 CPU 上）。
