---
title: MySQL 多实例的安装和管理
date: '2013-11-22'
description: "MySQL多实例的两种实现方式对比和详细配置步骤，包括多配置文件方式和mysqld_multi方式。"
category: database
tags:
  - mysql
  - mysql-replication
draft: false
source: evernote-local-db
lang: zh
---

MySQL 多实例有两种实现方式：

1. **多配置文件方式**：使用不同配置文件启动多个进程，配置简单但管理不太方便
2. **mysqld_multi 方式**：使用官方工具和单个配置文件，管理集中便利但单个实例定制性差

## 多配置文件方式实战

### 环境

- MySQL 版本：5.1.50
- 操作系统：SUSE 11
- 实例数：3 个
- 端口：3306、3307、3308

### 创建用户

```bash
/usr/sbin/groupadd mysql
/usr/sbin/useradd -g mysql mysql
```

### 编译安装

```bash
tar xzvf mysql-5.1.50.tar.gz
cd mysql-5.1.50

./configure \
  '--prefix=/usr/local/mysql' \
  '--with-charset=utf8' \
  '--with-extra-charsets=complex' \
  '--with-pthread' \
  '--enable-thread-safe-client' \
  '--with-ssl' \
  '--with-client-ldflags=-all-static' \
  '--with-mysqld-ldflags=-all-static' \
  '--with-plugins=partition,innobase,blackhole,myisam,innodb_plugin,heap,archive' \
  '--enable-shared' \
  '--enable-assembler'

make && make install
```

### 初始化数据库

为三个实例创建数据目录：

```bash
/usr/local/mysql/bin/mysql_install_db --basedir=/usr/local/mysql --datadir=/data/dbdata_3306 --user=mysql
/usr/local/mysql/bin/mysql_install_db --basedir=/usr/local/mysql --datadir=/data/dbdata_3307 --user=mysql
/usr/local/mysql/bin/mysql_install_db --basedir=/usr/local/mysql --datadir=/data/dbdata_3308 --user=mysql
```

### 配置文件

为每个实例创建配置文件，主要区别是端口和数据目录。

**3306 实例配置**（`/data/dbdata_3306/my.cnf`）：

```ini
[client]
port = 3306
socket = /data/dbdata_3306/mysql.sock

[mysqld]
datadir=/data/dbdata_3306/
skip-name-resolve
lower_case_table_names=1
innodb_file_per_table=1
port = 3306
socket = /data/dbdata_3306/mysql.sock
back_log = 50
max_connections = 300
max_connect_errors = 1000
table_open_cache = 2048
max_allowed_packet = 16M
binlog_cache_size = 2M
max_heap_table_size = 64M
sort_buffer_size = 2M
join_buffer_size = 2M
thread_cache_size = 64
thread_concurrency = 8
query_cache_size = 64M
query_cache_limit = 2M
ft_min_word_len = 4
default-storage-engine = innodb
thread_stack = 192K
transaction_isolation = REPEATABLE-READ
tmp_table_size = 64M
log-bin=mysql-bin
binlog_format=mixed
slow_query_log
long_query_time = 1
server-id = 1
key_buffer_size = 8M
read_buffer_size = 2M
read_rnd_buffer_size = 2M
bulk_insert_buffer_size = 64M
myisam_sort_buffer_size = 128M
myisam_max_sort_file_size = 10G
myisam_repair_threads = 1
myisam_recover
innodb_additional_mem_pool_size = 16M
innodb_buffer_pool_size = 200M
innodb_data_file_path = ibdata1:10M:autoextend
innodb_file_io_threads = 8
innodb_thread_concurrency = 16
innodb_flush_log_at_trx_commit = 1
innodb_log_buffer_size = 16M
innodb_log_file_size = 512M
innodb_log_files_in_group = 3
innodb_max_dirty_pages_pct = 60
innodb_lock_wait_timeout = 120

[mysqldump]
quick
max_allowed_packet = 256M

[mysql]
no-auto-rehash
prompt=\u@\d\R:\m >

[myisamchk]
key_buffer_size = 512M
sort_buffer_size = 512M
read_buffer = 8M
write_buffer = 8M

[mysqlhotcopy]
interactive-timeout

[mysqld_safe]
open-files-limit = 8192
```

**3307 和 3308 配置**：只需修改：
- 所有 `3306` 改为 `3307`/`3308`
- 所有 `/data/dbdata_3306` 改为 `/data/dbdata_3307`/`/data/dbdata_3308`
- server-id 分别为 2 和 3

关键配置参数说明：
- `server-id`：用于主从复制，每个实例必须唯一
- `port`：实例监听端口
- `datadir`：数据存储目录
- `innodb_buffer_pool_size`：InnoDB 缓冲池大小
- `log-bin`：二进制日志文件名

### 启动和管理

```bash
# 启动单个实例
/usr/local/mysql/bin/mysqld_safe --defaults-file=/data/dbdata_3306/my.cnf &

# 连接到具体实例
/usr/local/mysql/bin/mysql -S /data/dbdata_3306/mysql.sock

# 关闭实例
mysqladmin -S /data/dbdata_3306/mysql.sock shutdown
```

## mysqld_multi 方式

mysqld_multi 工具是 MySQL 官方提供的多实例管理工具，使用单一配置文件。对于需要集中管理多个实例的场景，这种方式更方便，但单个实例的定制配置选项受限。
