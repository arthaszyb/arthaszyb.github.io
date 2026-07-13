---
title: 修复表、优化时减少磁盘占用空间
date: '2014-07-16'
description: "MySQL表修复和优化命令的用途说明，使用REPAIR TABLE修复损坏表，使用OPTIMIZE TABLE回收删除数据后的磁盘空间。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---
MySQL表在长期使用过程中可能出现损坏或磁盘空间浪费的问题，可以通过修复和优化来解决。

修复表（用于修复被破坏的表）：
```sql
REPAIR TABLE `table_name`;
```

优化表（用于回收被删除数据行占用的磁盘空间）：
```sql
OPTIMIZE TABLE `table_name`;
```

`OPTIMIZE TABLE` 执行后会回收闲置空间并对磁盘上的数据行进行重排。通常不需要频繁运行，只需在批量删除数据行之后、或定期（每周一次或每月一次）对特定表进行一次优化即可。
