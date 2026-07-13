---
title: mysql临时目录
date: '2014-07-30'
description: "MySQL执行排序等大查询时会在临时目录生成数据文件，默认为/tmp，导致分区饱满时的排查方法和解决方案。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---
若发现/tmp分区突然饱满，且临时文件频繁出现和消失，通常是MySQL产生的临时数据。MySQL在执行排序等大查询操作时会在临时目录生成数据文件，默认存放在/tmp。可通过lsof命令确认是mysqld进程产生。

解决方法是在my.cnf中为MySQL指定专用的临时文件目录：

```ini
[mysqld]
tmpdir=/data1/mysqldata/tmp
```

这样可避免/tmp分区被MySQL临时数据撑满的问题。
