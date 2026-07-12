---
title: mysql临时目录
date: '2014-07-30'
description: >-
  某天突然报警/分区饱满，查到是/tmp下多了很多mysql数据文件： 这些文件过会就消失，然后又产生，通过lsof命令查询与之相关的进程：
  是mysqld进程产生的，遂查询该进程相关活动： 到此就没有头绪了。
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---
某天突然报警/分区饱满，查到是/tmp下多了很多mysql数据文件：
这些文件过会就消失，然后又产生，通过lsof命令查询与之相关的进程：
是mysqld进程产生的，遂查询该进程相关活动：
到此就没有头绪了。请高人指点，
原来是mysql内若有排序等查询操作时，会产生较大量的临时数据，而mysql默认的临时数据存放在/tmp下，若数据太大，则会导致/爆满，因此，在my.cnf下配置好临时文件的目录：
tmpdir=/data1/mysqldata/tmp
即可。
