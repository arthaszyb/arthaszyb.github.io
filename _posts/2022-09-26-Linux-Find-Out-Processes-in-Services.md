---
layout:     post
title:      Find Out Processes in Services Quickly
subtitle:   快速查询系统运行的服务进程
date:       2022-09-26
author:     Sean
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - Linux
    - Script
---

>Find out running processes by listing all TCP service ports with lsof command. It's usefull while the machine is planning to be shutdown.

# Script
```s
#!/bin/bash
#查看服务进程
allp=$(netstat -nlp|grep -E "tcp|udp"|awk '{print $4}'|cut -d: -f2)
for port in $allp;do
     pid=$(lsof -i:$port|head -n2|grep -v COMMAND|awk '{print $2}')
     ls -l /proc/$pid | grep exe|awk -F'->' '{print $NF}' >>/tmp/ser.txt_tmp
done
grep -v TsysAgent /tmp/ser.txt_tmp|grep -v sshd |grep -v rsync|sort -u >/tmp/ser.txt
rm -rf /tmp/ser.txt_tmp
cat /tmp/ser.txt
```
