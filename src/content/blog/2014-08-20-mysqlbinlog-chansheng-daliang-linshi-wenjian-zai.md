---
title: mysqlbinlog 产生大量临时文件在/tmp
date: '2014-08-20'
description: "mysqlbinlog命令默认在/tmp生成临时文件，可通过--local-load参数指定自定义临时目录避免分区饱满。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---
mysqlbinlog命令默认会在/tmp中生成临时文件，若/tmp分区空间不足可能导致处理失败。可通过--local-load参数指定专用的临时目录：

```bash
mysqlbinlog /data1/mysql5022_3306/binlog/mysql-log.000986 /data1/mysql5022_3306/binlog/mysql-log.000987 --local-load=/data/mysql5022_3306/tmp/ /tmp/zz1
```

使用此方法可将临时文件存储在指定位置，避免/tmp饱满问题。
