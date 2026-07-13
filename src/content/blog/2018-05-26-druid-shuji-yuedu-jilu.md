---
title: Druid 书籍阅读记录
date: '2018-05-26'
description: "Druid 相关书籍阅读笔记。涉及列数据库、时序数据库定义，Druid 特点对比，LSM-tree 架构和性能特性，集群各节点职责。"
category: monitoring
tags:
  - druid
draft: false
source: evernote-local-db
lang: zh
---

Druid 相关书籍阅读笔记。

## 基本概念

- 列数据库定义、时序数据库定义
- Druid 特点、产品对比

## Druid 快写快读的基础

不同于关系型数据库的 B+ 树索引结构，Druid 使用 LSM-tree，利用磁盘的基本特性（顺序操作性能远高于随机操作），采用两部分树的数据结构存储数据。实时节点采用类 LSM-tree 架构，保证高速写入和快速实时查询。

## 集群节点职责

**历史节点**：先检查本地 segments，若 coordinator 分配的 segments 找不到，则从 deep storage 下载到本地（需要大内存以提高查询效率）。

**Broker 节点**：通常两个即可，提供内存作为缓存。

**索引服务**：与实时节点工作相同，但优势是支持 pull、push，还支持 API 灵活配置任务，能控制 segment 副本数量。包含 Overlord（分配任务）和 MiddleManager（执行任务）。实时节点因单点问题，已被索引服务取代。
