---
title: 通过/proc/net/dev分析网络包量，流量，错包，丢包
date: '2015-09-28'
description: >-
  分类： linux研究2012-04-19 18:29 12080人阅读 评论(0) 收藏 举报 网络tcp 一，/proc/net/dev
  user\00@xxxx64:~ cat /proc/net/dev Inter- | Receive | Transmit face | bytes
  packets errs
category: linux
tags:
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---
# [通过/proc/net/dev分析网络包量，流量，错包，丢包](http://blog.csdn.net/tenfyguo/article/details/7478584)

分类： [linux](http://blog.csdn.net/tenfyguo/article/category/1054590)[研究](http://blog.csdn.net/tenfyguo/article/category/1054590)2012-04-19 18:29 12080人阅读 [评论](http://blog.csdn.net/tenfyguo/article/details/7478584#comments)(0) 收藏 [举报](http://blog.csdn.net/tenfyguo/article/details/7478584#report)

[网络](http://www.csdn.net/tag/%e7%bd%91%e7%bb%9c)[tcp](http://www.csdn.net/tag/tcp)

**一，/proc/net/dev**

user\_00@xxxx64:~> cat /proc/net/dev

Inter- | Receive | Transmit

face | bytes packets errs drop fifo frame compressed multicast | bytes packets errs drop fifo colls carrier compressed

eth0: 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0

eth1: 67437819880 552776948 0 0 0 0 0 6 63179118041 486899714 0 0 0 0 0 0

lo: 2338316682 34154992 0 0 0 0 0 0 2338316682 34154992 0 0 0 0 0 0

tunl0: 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0

sit0: 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0

ip6tnl0: 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0

最左边的表示接口的名字，Receive表示收包，Transmit表示收包；

bytes表示收发的字节数；

packets表示收发正确的包量；

errs表示收发错误的包量；

drop表示收发丢弃的包量；

**二，/proc/net/snmp**

user\_00@xxxxx64:~> cat /proc/net/snmp

Ip: Forwarding DefaultTTL InReceives InHdrErrors InAddrErrors ForwDatagrams InUnknownProtos InDiscards InDelivers OutRequests OutDiscards OutNoRoutes ReasmTimeout ReasmReqds ReasmOKs ReasmFails FragOKs FragFails FragCreates

Ip: 2 64 583571152 0 0 0 0 0 583571152 520325247 0 0 0 0 0 0 0 0 0

Icmp: InMsgs InErrors InDestUnreachs InTimeExcds InParmProbs InSrcQuenchs InRedirects InEchos InEchoReps InTimestamps InTimestampReps InAddrMasks InAddrMaskReps OutMsgs OutErrors OutDestUnreachs OutTimeExcds OutParmProbs OutSrcQuenchs OutRedirects OutEchos OutEchoReps OutTimestamps OutTimestampReps OutAddrMasks OutAddrMaskReps

Icmp: 9859518 193 316 0 0 0 0 9859190 5 1 0 5 0 9859310 0 119 0 0 0 0 0 9859190 0 1 0 0

Tcp: RtoAlgorithm RtoMin RtoMax MaxConn ActiveOpens PassiveOpens AttemptFails EstabResets CurrEstab InSegs OutSegs RetransSegs InErrs OutRsts

Tcp: 1 200 120000 -1 42226398 41112433 0 407271 84 516490860 453242269 140892 0 1056150

Udp: InDatagrams NoPorts InErrors OutDatagrams

Udp: 57220606 116 0 57223663

通过访问该文件系统，可以对TCP和UDP进行监控：

<table><tbody><tr><td><div><span style="font-family: "Microsoft YaHei";"><span>平均每秒新增TCP连接数</span></span></div></td><td></td><td><div><span style="font-family: "Microsoft YaHei";"><span>通过/proc/net/snmp文件得到最近240秒内PassiveOpens的增量，除以240得到每秒的平均增量 </span></span></div></td></tr><tr><td><div><span style="font-family: "Microsoft YaHei";"><span>机器的TCP连接数</span></span></div></td><td></td><td><div><span style="font-family: "Microsoft YaHei";"><span>通过/proc/net/snmp文件的CurrEstab得到TCP连接数</span></span></div></td></tr><tr><td><div><span style="font-family: "Microsoft YaHei";"><span>平均每秒的UDP接收数据报</span></span></div></td><td></td><td><div><span style="font-family: "Microsoft YaHei";"><span>通过/proc/net/snmp文件得到最近240秒内InDatagrams的增量，除以240得到平均每秒的UDP接收数据报。</span></span></div></td></tr><tr><td><div><span style="font-family: "Microsoft YaHei";"><span>平均每秒的UDP发送数据报</span></span></div></td><td></td><td><div><span style="font-family: "Microsoft YaHei";"><span>通过/proc/net/snmp文件得到最近240秒内OutDatagrams的增量，除以240得到平均每秒的UDP发送数据报。</span></span></div></td></tr></tbody></table>
