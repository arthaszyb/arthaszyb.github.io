---
title: DB主从复制部分语句未被binlog记录问题解决
date: '2015-02-04'
description: >-
  原语句，结果不会记录在binlog 改为非echo的语句，结果不会记录binlog 改为指定库进入方式，结果会记录binlog 会记录 总结：
  原因：mysql不指定库直接登录，默认的登录库是null， 此时如果主库的配置文件中指定忽略某库不记录binlog，则mysql会对登录库进行筛选
category: database
tags:
  - mysql
  - php
  - mysql-replication
draft: false
source: evernote-local-db
lang: zh
---
原语句，结果不会记录在binlog
改为非echo的语句，结果不会记录binlog
改为指定库进入方式，结果会记录binlog
```bash
vi my.cnf,
#binlog-ignore-db=mysql
```
会记录
总结：
原因：mysql不指定库直接登录，默认的登录库是null，
此时如果主库的配置文件中指定忽略某库不记录binlog，则mysql会对登录库进行筛选，NULL本身也不会被记录到binlog，所以登录库未指定的所有语句都不会被记录。
过滤不是基于 查询的字符串的, 而实际于你used的数据库
请参考
http://www.eit.name/blog/read.php?433
