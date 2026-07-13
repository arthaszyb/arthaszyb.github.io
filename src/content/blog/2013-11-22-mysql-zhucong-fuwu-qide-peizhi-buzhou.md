---
title: MySQL 主从服务器的配置步骤
date: '2013-11-22'
description: "MySQL主从复制的完整配置步骤，包括主库配置、用户授权、从库配置和主从同步验证。"
category: database
tags:
  - mysql
  - mysql-replication
draft: false
source: evernote-local-db
lang: zh
---

## 环境

- Master：192.168.1.110，RHEL 5.8，MySQL 5.5.28
- Slave：192.168.1.113，RHEL 5.8，MySQL 5.5.28

## 主库配置

编辑主库 `/etc/my.cnf` 的 `[mysqld]` 段：

```ini
[mysqld]
log-bin=mysql-bin              # 打开二进制日志
binlog-do-db=test             # 记录特定库
server-id=1                    # 主从ID不能相同
binlog-ignore-db=mysql         # 不记录的库
sync_binlog=1                  # 日志有更新时刷新到磁盘
```

## 创建复制用户

在主库中创建用于从库连接的复制用户：

```bash
mysql -u root -p
```

```sql
USE mysql;
GRANT REPLICATION SLAVE, FILE ON *.* TO 'Think'@'192.168.1.113' IDENTIFIED BY 'mysql';
FLUSH PRIVILEGES;
```

## 查看主库状态

```sql
SHOW MASTER STATUS\G;
```

输出示例：

```
File: mysql-bin.000002
Position: 107
Binlog_Do_DB: test
Binlog_Ignore_DB: mysql
```

**重要**：记录 File 和 Position，从库需要用到。

## 从库配置

编辑从库 `/etc/my.cnf` 的 `[mysqld]` 段：

```ini
[mysqld]
log-bin=mysql-bin
server-id=2                    # 不同于主库
replicate-do-db=test           # 复制特定库
replicate-ignore-db=mysql      # 不复制的库
log-slave-updates              # 从库日志包含来自主库的更新
sync_binlog=1
slave-net-timeout=10           # 从库连接超时时间
```

## 从库连接主库

```sql
STOP SLAVE;

CHANGE MASTER TO
  master_host='192.168.1.110',
  master_user='Think',
  master_password='mysql',
  master_log_file='mysql-bin.000002',
  master_log_pos=107;

START SLAVE;
```

## 验证从库状态

```sql
SHOW SLAVE STATUS\G;
```

关键输出字段：

```
Slave_IO_State: Waiting for master to send event
Master_Host: 192.168.1.110
Master_User: Think
Master_Log_File: mysql-bin.000002
Read_Master_Log_Pos: 107
```

确保 `Slave_IO_State` 显示 "Waiting for master to send event"，表示复制正常运行。
