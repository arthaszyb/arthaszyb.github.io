---
title: my.cnf的一个典型配置
date: '2014-05-22'
description: "MySQL配置文件示例，展示了主要配置段的典型参数设置，包括客户端、服务端、数据导出等部分的常用选项。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---
一个MySQL配置文件的典型范例，涵盖客户端、服务端和数据操作工具的常用参数。

```ini
[mysql]
default-character-set=latin1
no-auto-rehash
port=3307
socket=/data2/mysqldata/mysql.sock

[mysqld]
#绑定ip(默认为0.0.0.0)
bind-address=10.166.6.171
character-set-server=latin1
datadir=/data2/mysqldata/data
default-storage-engine=MyISAM
key_buffer_size=512M
log-error=/data/mysqllog/mysql_3307.err
max_allowed_packet=1M
max_binlog_size=1073741824
max_connect_errors=1000
max_connections=100
max_heap_table_size=4096M
myisam_max_sort_file_size=128M
myisam_sort_buffer_size=128M
port=3307
read_rnd_buffer=2M
skip-innodb
skip-name-resolv
socket=/data2/mysqldata/mysql.sock
sort_buffer=8M
table_cache=30010
thread_cache=8
thread_concurrency=4
tmp_table_size=4096M
tmpdir=/data2/mysqldata/tmp
init_connect='SET AUTOCOMMIT=1'

[client]
port=3307
socket=/data2/mysqldata/mysql.sock

[mysqldump]
max_allowed_packet=16M
quick
```
