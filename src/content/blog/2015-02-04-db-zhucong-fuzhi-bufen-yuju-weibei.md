---
title: DB主从复制部分语句未被binlog记录问题解决
date: '2015-02-04'
description: "MySQL 未指定默认库时执行的 SQL 不会被 binlog 记录的问题诊断和解决方案：通过 USE 指定库或修改 binlog-ignore-db 配置。"
category: database
tags:
  - mysql
  - mysql-replication
draft: false
source: evernote-local-db
lang: zh
---

## 问题现象

原语句，结果不会记录在 binlog。通过改为非 echo 的语句，结果也不会记录 binlog。改为指定库进入方式后，结果会记录 binlog。

## 配置查看

```bash
vi my.cnf
# binlog-ignore-db=mysql
```

会记录 binlog。

## 原因分析

MySQL 不指定库直接登录时，默认的登录库是 null。此时如果主库的配置文件中指定忽略某库不记录 binlog，则 MySQL 会对登录库进行筛选。NULL 本身也不会被记录到 binlog，所以登录库未指定的所有语句都不会被记录。

过滤不是基于查询的字符串，而是基于你 USE 的数据库。

详见：http://www.eit.name/blog/read.php?433
