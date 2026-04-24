---
title: "mysql双实例标准conf(tx)"
date: 2014-05-27 16:30:03 +0000
categories: ["MySQL [2]"]
tags: ["Pages"]
description: "Tuesday, May 27, 2014 4:30 PM # mysql config file # File : /etc/my.cnf # Author : TR # Date : 2010-08-27 # Notes # First edit by marryhe [client] port = 3306 so"
source: "evernote-local-db"
---

mysql双实例标准conf(tx)
Tuesday, May 27, 2014
4:30 PM
# mysql config file
# File : /etc/my.cnf
# Author : TR
# Date : 2010-08-27
# Notes
# First edit by marryhe

[client]
port = 3306
socket = /tmp/mysql.sock

[mysqld1]
user=mysql
bind-address = 10.166.6.170
port = 3306
socket = /tmp/mysql3306.sock
datadir = /data1/mysqldata/data
pid-file = /data1/mysqldata/binlog/mysqld3306.pid
log-error = /data/mysqldata/binlog/mysql_3306.err
slave_load_tmpdir = /data/tmp
skip-locking
skip-innodb

open_files_limit=65535
max_connections=400
key_buffer_size=1073741824
max_allowed_packet=30M
table_cache=30010
sort_buffer=8388608
record_buffer=8388608
thread_cache=8
read_rnd_buffer=8388608
max_heap_table_size=268435456
tmp_table_size=1073741824
myisam_max_sort_file_size=134217728
myisam_max_extra_sort_file_size=134217728
thread_concurrency=4
myisam_sort_buffer_size=134217728

[mysqld2]
user=mysql
bind-address = 10.166.6.170
port = 3307
socket = /tmp/mysql3307.sock
datadir = /data2/mysqldata/data
pid-file = /data2/mysqldata/binlog/mysqld3307.pid
log-error = /data2/mysqldata/binlog/mysql_3307.err
skip-locking
skip-innodb

max_connections=128
key_buffer_size=1024M
max_allowed_packet=1M
table_cache=1024
sort_buffer=8M
record_buffer=2M
thread_cache=8
read_rnd_buffer=2M
max_heap_table_size=256M
tmp_table_size=256M
myisam_max_sort_file_size=128M
myisam_max_extra_sort_file_size=128M
thread_concurrency=4
myisam_sort_buffer_size=128M
max_heap_table_size=4096M
tmp_table_size=4096M

[mysqldump]
quick
max_allowed_packet=16M

[mysql]
no-auto-rehash

[isamchk]
key_buffer=256M
sort_buffer=256M
read_buffer=2M
write_buffer=2M

[myisamchk]
key_buffer=256M
sort_buffer=256M
read_buffer=2M
write_buffer=2M

[mysqlhotcopy]
interactive-timeout

已使用 Microsoft OneNote 2016 创建。
