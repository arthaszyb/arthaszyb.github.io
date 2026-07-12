---
title: heartbeat监控mysql的脚本
date: '2014-01-17'
description: >-
  #!/bin/bash pid=/var/mysql/data/host002.pid time=date '+%H:%M:%S' Date=date
  '+%Y.%m.%d' if [ -f $pid ];then echo "$time:mysql is running"
category: shell
tags:
  - mysql
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---
#!/bin/bash
pid=/var/mysql/data/host002.pid
time=`date '+%H:%M:%S'`
Date=`date '+%Y.%m.%d'`
if [ -f $pid ];then
echo "$time:mysql is running" >>/tmp/chk_mysql.log_$Date
else
echo "$time:mysql is down!stopping heartbeat..." >>/tmp/chk_mysql.log_$Date
&
&
/etc/init.d/heartbeat stop 2
&
>1 /dev
ull
&
&
echo "$time:heartbeat has stoped." >>/tmp
/chk_mysql.log_$Date
# sleep 100
&
&
echo "$time:restart heartbeat for standby...">>/tmp/chk_mysql.log_$Date
&
&
/etc/init.d/heartbeat start 2>
&
1 /dev
ull
&
&
echo "$time:restart heartbeat
successed.">>/tmp/chk_mysql.log_$Date
