---
title: Prometheus入门
date: '2018-03-05'
description: Prometheus 与时序数据库（TSDB）的基础概念。TSDB 特性、写入模式、时间排序、数据采集和保留策略等核心原理。
category: monitoring
tags:
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.hi-linux.com/posts/25047.html
---

## 什么是 TSDB？

TSDB（Time Series Database）时序列数据库，是一个优化后用来处理时间序列数据的软件，数据中的数组由时间进行索引。

## 时间序列数据库的特点

- **大部分时间都是写入操作**：系统优化重点在于高效处理写入
- **写入操作几乎是顺序添加**：数据大多以时间排序到达，避免随机写入
- **写操作很少涉及历史数据**：几乎不更新很久之前的数据
- **数据采集与写入间隔短**：大多数情况下数据在采集后数秒或数分钟内就写入数据库
- **删除操作**：支持基于保留策略的数据过期删除
