---
title: 请不要用SECONDS_BEHIND_MASTER来衡量MYSQL主备的延迟时间
date: '2014-11-14'
description: “Seconds_Behind_Master 无法准确衡量 MySQL 主备复制延迟，分析其限制原因，提出被动监控和主动预防两种方案。”
category: database
tags:
  - mysql
  - mysql-replication
  - 监控告警
  - 高可用
draft: false
source: evernote-local-db
lang: zh
---

MySQL 本身通过 `show slave status` 提供了 Seconds_Behind_Master，用于衡量主备之间的复制延迟。但在某些场景下，Seconds_Behind_Master 为 0，备库的 show slave status 显示 IO/SQL 线程都正常，但主库上的变更却无法同步到备库上。这个问题影响 MySQL、Percona、MariaDB 的所有版本。

## 问题重现

搭建主备复制，临时断开主库网络，并 kill 掉主库 MySQL 的 binlog dump 线程。此时观察备库复制情况，show slave status 中：

```
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
Seconds_Behind_Master: 0
```

但把网络恢复后，在主库做任何变更，备库都无法获得数据更新。备库上的 show slave status 显示 IO/SQL 线程一切正常，复制延迟一直是 0。

## 原理分析

MySQL 复制是”推”的方式：备库向主库申请数据时，需要指定从主库 Binlog 的哪个文件（MASTER_LOG_FILE）和具体字节偏移位置（MASTER_LOG_POS）。主库会启动一个 Binlog dump 线程，将变更从该位置一条条发给备库。

问题在于：当 Binlog dump 被 kill 掉时，备库一直没有收到任何变更，它会认为主库没有数据变更，而无法判断 Binlog dump 线程是意外终止还是长时间无变更。重现问题的关键是 Binlog dump 被 kill 的消息因网络堵塞或其他原因无法发送到备库。

## 解决方案

**被动处理**：修改延迟监控方法。不要直接采集 show slave status 中的 Seconds_Behind_Master，改为在主库轮询插入时间信息，通过主库写入时间与备库收到时间的差值来衡量复制延迟。Percona 的 pt-heartbeat 提供了类似方案。发现问题后执行 `stop slave; start slave;` 可解决。

**主动预防**：正确设置复制重试参数：

```
--master-retry-count
--master-connect-retry
--slave-net-timeout
```

其中 master-connect-retry 和 master-retry-count 需要在 Change Master 时指定，slave-net-timeout 是全局变量可在线设置。

重试策略：备库过了 slave-net-timeout 秒还没收到主库数据，就开始第一次重试；每隔 master-connect-retry 秒重新尝试；直到重试 master-retry-count 次才放弃。

默认值：slave-net-timeout 为 3600 秒、master-connect-retry 为 60 秒、master-retry-count 为 86400 次。这意味着主库一小时没有数据变更，备库才会尝试重连。如果主库变更频繁，可将 slave-net-timeout 设置更小，但过小会导致备库频繁重连主库，造成资源浪费。

## 相关故障处理

如果遇到：`Query partially completed on the master (error on master: 1317) and was aborted` 的错误，表示查询在主机上被部分执行并终止，从库因此停止同步。确认主库状态正常后，执行：

```sql
stop slave;
SET GLOBAL SQL_SLAVE_SKIP_COUNTER=1;
START SLAVE;
```

来重启同步。
T GLOBAL SQL_SLAVE_SKIP_COUNTER=1; START SLAVE;
