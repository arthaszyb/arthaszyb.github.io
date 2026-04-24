---
title: "mysqlbinlog 产生大量临时文件在/tmp"
date: 2014-08-20 23:16:49 +0000
categories: ["MySQL [2]"]
tags: ["Pages"]
description: "Wednesday, August 20, 2014 11:16 PM 默认会在/tmp中生成临时文件，可在命令中加上--local-load=指定临时目录。 mysqlbinlog /data1/mysql5022_3306/binlog/mysql-log.000986 /data1/mysql5022_3306/"
source: "evernote-local-db"
---

mysqlbinlog 产生大量临时文件在/tmp
Wednesday, August 20, 2014
11:16 PM
默认会在/tmp中生成临时文件，可在命令中加上--local-load=指定临时目录。
mysqlbinlog /data1/mysql5022_3306/binlog/mysql-log.000986 /data1/mysql5022_3306/binlog/mysql-log.000987 --local-load=/data/mysql5022_3306/tmp/ /tmp/zz1

已使用 Microsoft OneNote 2016 创建。
