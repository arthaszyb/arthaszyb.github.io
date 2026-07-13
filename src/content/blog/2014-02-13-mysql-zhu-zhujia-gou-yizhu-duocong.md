---
title: MySQL 主-主架构和一主多从架构配置
date: '2014-02-13'
description: "MySQL主-主互为主从和一主多从架构的配置步骤，以及多级复制的限制说明。"
category: database
tags:
  - mysql
  - mysql-replication
draft: false
source: evernote-local-db
lang: zh
---

## 主-主架构配置

主-主架构中两台服务器互为主从关系。

### 配置步骤

1. **两台服务器都启用二进制日志和 server-id**

编辑两台服务器的 `/etc/my.cnf`：

```ini
[mysqld]
log-bin=mysql-bin
server-id=1          # Server A
# server-id=2        # Server B（另一台）
```

2. **两台服务器分别创建复制用户**

在 Server A 中：

```sql
GRANT REPLICATION SLAVE, FILE ON *.* TO 'slave_user'@'192.168.1.112' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
```

在 Server B 中：

```sql
GRANT REPLICATION SLAVE, FILE ON *.* TO 'slave_user'@'192.168.1.111' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
```

3. **分别在两台服务器执行 CHANGE MASTER**

Server A 中（指向 Server B）：

```sql
CHANGE MASTER TO
  master_host='192.168.1.112',
  master_user='slave_user',
  master_password='password',
  master_log_file='mysql-bin.000001',
  master_log_pos=107;

START SLAVE;
SHOW SLAVE STATUS\G;
```

Server B 中（指向 Server A）：

```sql
CHANGE MASTER TO
  master_host='192.168.1.111',
  master_user='slave_user',
  master_password='password',
  master_log_file='mysql-bin.000001',
  master_log_pos=107;

START SLAVE;
SHOW SLAVE STATUS\G;
```

**总结**：主-主架构本质上就是两个主-从关系互换。关键是两边都要启用 binary log 和正确的 server-id。

## 一主多从架构配置

一个主库，多个从库。

### 配置步骤

1. **在主库中创建复制用户**

```sql
GRANT REPLICATION SLAVE, FILE ON *.* TO 'slave_user'@'%' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
```

2. **在每个从库执行 CHANGE MASTER**

每个从库都指向同一主库，但可能有不同的 server-id：

```sql
CHANGE MASTER TO
  master_host='192.168.1.110',
  master_user='slave_user',
  master_password='password',
  master_log_file='mysql-bin.000001',
  master_log_pos=107;

START SLAVE;
```

## 多级复制的限制

**重要**：MySQL 不支持多级复制链路。

示例拓扑（不支持）：

```
A (主) -----> B (从, 同时也是 C 的主) -----> C (从)
```

这种配置中：
- A 上的修改数据能到达 B
- B 上的修改数据能到达 A 和 C
- **但 A 上的修改数据无法到达 C**（复制链路断）

原因是 B 作为 A 的从库接收数据，但如果 B 没有在 `my.cnf` 中启用 `log-slave-updates` 选项，则从 A 复制过来的数据不会被记录到 B 的二进制日志中，C 就看不到这些更新。

### 解决方案

如果 B 需要同时作为 C 的主库，需要在 B 的配置中启用：

```ini
[mysqld]
log-bin=mysql-bin
log-slave-updates      # 将从主库复制的更新也记录到二进制日志
```

这样 A 的更新才能通过 B 传递到 C。

## 架构选择

- **主-主**：互备，任意一台故障都能切换，但数据一致性需要仔细管理
- **一主多从**：主服务器负责写，多从服务器负责读，可提高查询吞吐量
