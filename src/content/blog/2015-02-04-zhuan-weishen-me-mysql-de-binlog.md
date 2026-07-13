---
title: "为什么 MySQL 的 binlog-do-db 选项是危险的"
date: '2015-02-04'
description: "binlog-do-db 和 binlog-ignore-db 的危险性：它们基于连接的默认库而非查询涉及的表进行过滤，容易造成主从不一致。推荐改用 replicate-wild-* 选项。"
category: database
tags:
  - mysql
  - mysql-replication
  - 备份恢复
draft: false
source: evernote-local-db
origin_url: "http://www.mysqlperformanceblog.com/2009/05/14/why-mysqls-binlog-do-db-option-is-dangerous/"
lang: zh
---

## 危险性分析

很多人使用 `binlog-do-db`、`binlog-ignore-db`、`replicate-do-db`、`replicate-ignore-db` 进行复制过滤，但这些选项很危险且被过度使用。

关键问题：这些选项不是基于查询涉及的表，而是基于连接的当前默认数据库（USE 语句）进行过滤。

## 危险案例

假设设置 `binlog-ignore-db=garbage`（表示忽略 garbage 库），然后执行：

```sql
$ mysql
mysql> delete from garbage.junk;
mysql> use garbage;
mysql> update production.users set disabled = 1 where user = "root";
```

结果：复制会失败两次
1. 第一条语句会在 slave 上执行，但 slave 没有 garbage.junk 表，导致错误
2. 第二条语句（虽然涉及 production 库的表）因为连接的当前库是 garbage，所以被过滤掉不记录，root 用户在 slave 上没有被禁用——数据不一致

## 安全替代方案

改用 `replicate-wild-*` 选项，它基于查询涉及的表而非连接的库进行过滤：

```sql
replicate-wild-ignore-table=garbage.%
```

这样才能避免上述陷阱。`binlog-do-db` 和 `binlog-ignore-db` 尤其危险，因为它们会导致语句根本不被写入 binlog，使二进制日志无法用于时间点恢复。
