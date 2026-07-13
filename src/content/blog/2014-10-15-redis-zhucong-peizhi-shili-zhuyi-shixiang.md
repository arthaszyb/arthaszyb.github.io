---
title: redis 主从配置实例、注意事项、及备份方式
date: '2014-10-15'
description: "Redis主从复制的配置示例，包括master端关闭持久化、slave端开启AOF的策略，以及定期备份和数据同步监控的实现方法。"
category: database
tags:
  - redis
  - 备份恢复
draft: false
source: evernote-local-db
origin_url: https://www.cnblogs.com/
lang: zh
---
配置线上Redis主从复制时的推荐方案是：**在master上关闭所有持久化，在slave上使用AOF持久化**。这样可以大幅降低master的资源消耗，提高性能。

## Master端配置

```ini
######Master config
###General 配置
daemonize yes
pidfile /tmp/redis.pid
port 6379
timeout 30
# 日志用warning级别便于监控（只有告警才产生日志）
loglevel warning
logfile /opt/logs/redis/redis.log
databases 16

###SNAPSHOTTING 配置（在master上全部注释，不做持久化）
#save 900 1
#save 300 100
#save 60 10000
rdbcompression yes
dbfilename dump.rdb
dir /opt/data/redis/

###LIMITS 设置
maxclients 0
maxmemory 14gb
maxmemory-policy volatile-lru

###APPEND ONLY MODE 设置（master不使用AOF）
appendonly no
appendfsync everysec
no-appendfsync-on-rewrite no

###SLOW LOG 设置
slowlog-log-slower-than 10000
slowlog-max-len 1024

###VIRTUAL MEMORY 设置（Redis 2.4不建议使用）
vm-enabled no
vm-swap-file /tmp/redis.swap
vm-max-memory 0
vm-page-size 32
vm-pages 134217728
vm-max-threads 4

###ADVANCED CONFIG 设置
hash-max-zipmap-entries 512
hash-max-zipmap-value 64
list-max-ziplist-entries 512
list-max-ziplist-value 64
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
activerehashing yes

###INCLUDES 设置（slave配置分离）
#include /opt/redis/etc/slave.conf
```

## Slave端配置

```ini
######Slave config
###REPLICATION 设置
slaveof redis01 6397
slave-serve-stale-data no  # 若无法与master同步，设为不可读，便于监控发现问题

###APPEND ONLY MODE 设置（slave使用AOF保证数据可用性）
appendonly yes
```

## 备份和监控

1. **Master备份：** 每天凌晨执行一次 `redis-cli bgsave`，将数据备份到其他服务器
2. **Slave备份：** 每半小时执行 `redis-cli bgrewriteaof` 重写AOF文件，并备份到其他服务器
3. **数据同步监控：** 编写脚本定期对比master和slave上的key，若不同步则报警
