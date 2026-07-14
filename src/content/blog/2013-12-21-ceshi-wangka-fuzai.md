---
title: 测试网卡负载
date: '2013-12-21'
description: 监测网卡流量和数据包速率的 shell 脚本，支持自定义网卡名称。每秒采样一次，输出进出流量和丢包率。
category: shell
tags:
  - shell-scripting
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---

修改 eth2 为要测试的网卡即可：

```bash
#! /bin/bash
# Write by Neil.xu qq:37391319 email: xurongzhong@gmail.com
# 2008-8-19 we need to monitor streams of LTS channels, so write this script
typeset in in_old dif_in dif_in1 dif_out1 packet_old packet dif_pack
typeset out out_old dif_out
in_old=$(cat /proc/net/dev | grep eth2 | sed 's=^.*:==' | awk '{ print $1 }' )
out_old=$(cat /proc/net/dev | grep eth2 | sed 's=^.*:==' | awk '{ print $9 }')
packet_old=$(cat /proc/net/dev | grep eth2 | sed 's=^.*:==' | awk '{ print $2 }')
while true
do
sleep 1
in=$(cat /proc/net/dev | grep eth2 | sed 's=^.*:==' | awk '{ print $1 }')
out=$(cat /proc/net/dev | grep eth2 | sed 's=^.*:==' | awk '{ print $9 }')
packet=$(cat /proc/net/dev | grep eth2 | sed 's=^.*:==' | awk '{ print $2 }')
dif_in=$((in-in_old))
dif_in1=$((dif_in * 8 / 1024 / 1024 ))
dif_out=$((out-out_old))
dif_in2=$((dif_in / 1024 ))
dif_out2=$((dif_out / 1024 ))
dif_out1=$((dif_out * 8 / 1024 / 1024 ))
dif_pack=$((packet-packet_old))
echo "`date` IN: ${dif_in2} KB OUT: ${dif_out2} KB " "| IN: ${dif_in1} mbps OUT: ${dif_out1} mbps" "| Packet IN: $dif_pack /s"
in_old=${in}
out_old=${out}
packet_old=${packet}
done
```
