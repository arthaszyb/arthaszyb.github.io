---
title: 获取mysql访问记录
date: '2014-09-05'
description: "启用MySQL通用日志记录所有访问操作的方法，以及通过grep分析连接来源IP及访问频率的脚本。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---
MySQL通用日志可记录所有连接和查询操作，用于审计和故障排查。

**启用通用日志：**

在my.cnf的[mysqld]部分增加配置，然后重启MySQL：

```ini
[mysqld]
log-output=FILE
general-log
general-logfile=/data1/mysqldata/general.log
```

**分析访问来源IP和频率：**

从通用日志中提取连接操作并统计访问IP及次数：

```bash
grep " Connect" /data1/mysqldata/general.log|grep -o '[0-9.]\{4,\}'|grep '\.'|sort -n|uniq -c
```
