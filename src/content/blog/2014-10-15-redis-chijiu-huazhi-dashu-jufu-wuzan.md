---
title: Redis持久化之大数据服务暂停问题
date: '2014-10-15'
description: “大数据场景下Redis持久化（RDB和AOF）导致的服务暂停现象、原因分析及解决方案，通过实测数据对比两种持久化方式的性能影响。”
category: database
tags:
  - redis
draft: false
source: evernote-local-db
origin_url: http://www.iteye.com/
---
## RDB快照方式的问题

RDB即快照存储，通过save参数配置触发条件：
```
save 3600 1000  # 前一次快照3600秒后，当有超过1000个key被改动时进行快照
```

**实测场景：** 20GB内存服务器，压入13GB Redis数据，进行快照操作

当进行快照时，Redis会fork子进程，导致内存使用翻倍（父进程13GB + 子进程13GB = 26GB），产生两个redis-server进程同时运行。结果：

```
set test2 22 # 耗时40秒左右，接近1分钟
```

大数据量下RDB会导致服务暂停，这对于需要频繁快照确保数据容错的场景不可容忍。

## AOF+RDB混合方式的优化

配置策略：
- RDB快照时间设置为1天
- 启用AOF进行增量持久化
- 加入5GB数据测试

**阶段1：fsync（内存写入AOF文件）**
- set操作：无暂停
- get操作：无暂停
- 最终AOF文件大小：5.7GB

**阶段2：BGREWRITEAOF（重写AOF）**
- 初始配置（no-appendfsync-on-rewrite = no）：set操作出现延迟，get无延迟
- 优化配置（no-appendfsync-on-rewrite = yes）：两种操作都无延迟

**关键发现：** 设置 `no-appendfsync-on-rewrite yes` 后，rewrite期间redis不进行fsync，新的写操作被暂存在内存中，待rewrite完成后再写入AOF文件，这样避免了主进程和子进程的资源竞争。

## 推荐方案

对于大数据量场景，考虑：
1. 单机多实例：一台机器上多开几个Redis实例，减少单实例内存量，避免大数据量暂停问题
2. 充分利用CPU：根据CPU核心数配置对应数量的Redis实例
