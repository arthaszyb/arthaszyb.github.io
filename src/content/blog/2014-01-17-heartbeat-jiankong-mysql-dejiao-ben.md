---
title: heartbeat 监控 MySQL 的脚本
date: '2014-01-17'
description: 监控 MySQL 进程状态的脚本，若进程停止则自动重启 Heartbeat 高可用服务。
category: shell
tags:
  - mysql
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---

```bash
#!/bin/bash
pid=/var/mysql/data/host002.pid
time=`date '+%H:%M:%S'`
Date=`date '+%Y.%m.%d'`
if [ -f $pid ];then
echo "$time:mysql is running" >>/tmp/chk_mysql.log_$Date
else
echo "$time:mysql is down!stopping heartbeat..." >>/tmp/chk_mysql.log_$Date
/etc/init.d/heartbeat stop 2>&1 /dev/null
echo "$time:heartbeat has stoped." >>/tmp/chk_mysql.log_$Date
# sleep 100
echo "$time:restart heartbeat for standby...">>/tmp/chk_mysql.log_$Date
/etc/init.d/heartbeat start 2>&1 /dev/null
echo "$time:restart heartbeat successed.">>/tmp/chk_mysql.log_$Date
fi
```
