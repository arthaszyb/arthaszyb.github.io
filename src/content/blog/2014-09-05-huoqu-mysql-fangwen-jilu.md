---
title: 获取mysql访问记录
date: '2014-09-05'
description: >-
  1.打开全日志 my.cnf的[mysqld]增加三行 log-output=FILE general-log
  general-logfile=/data1/mysqldata/general.log 1.5.
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---
1.打开全日志
my.cnf的[mysqld]增加三行
log-output=FILE
general-log
general-log_file=/data1/mysqldata/general.log
1.5. 重启mysql
2.获取访问IP和访问次数
grep " Connect" /data1/mysqldata/general.log|grep -o '[0-9.]\{4,\}'|grep '\.'|sort -n|uniq -c
