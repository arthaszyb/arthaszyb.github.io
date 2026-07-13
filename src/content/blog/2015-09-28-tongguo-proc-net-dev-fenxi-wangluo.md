---
title: 通过 /proc/net 分析网络状态
date: '2015-09-28'
description: 借助 /proc/net/dev 和 /proc/net/snmp 监控网卡收发包与 TCP/UDP 状态，包括每秒新增 TCP 连接数、当前连接数、UDP 收发数据报等指标的计算方法。
category: linux
tags:
  - 网络排查
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
origin_url: http://blog.csdn.net/tenfyguo/article/details/7478584
---
## 一、/proc/net/dev

```text
$ cat /proc/net/dev
Inter-|   Receive                                                |  Transmit
 face | bytes    packets errs drop fifo frame compressed multicast | bytes packets errs drop fifo colls carrier compressed
 eth0:  0        0       0    0    0    0    0          0           0      0       0    0    0    0     0       0
 eth1:  67437819880 552776948 0 0 0 0 0  6                63179118041 486899714 0 0 0 0 0 0
   lo:  2338316682 34154992  0    0    0    0    0          0        2338316682 34154992 0 0 0 0 0 0
```

字段含义：最左边是接口名，Receive 表示收包，Transmit 表示发包；`bytes` 收发字节数、`packets` 收发正确的包量、`errs` 收发错误包量、`drop` 收发丢弃包量。

## 二、/proc/net/snmp

```text
$ cat /proc/net/snmp
Ip: Forwarding DefaultTTL InReceives ...
Ip: 2 64 583571152 0 0 0 0 0 583571152 520325247 ...
Tcp: RtoAlgorithm RtoMin RtoMax MaxConn ActiveOpens PassiveOpens AttemptFails EstabResets CurrEstab InSegs OutSegs RetransSegs InErrs OutRsts
Tcp: 1 200 120000 -1 42226398 41112433 0 407271 84 516490860 453242269 140892 0 1056150
Udp: InDatagrams NoPorts InErrors OutDatagrams
Udp: 57220606 116 0 57223663
```

通过该文件可对 TCP 和 UDP 进行监控：

- **平均每秒新增 TCP 连接数**：取最近 240 秒内 `PassiveOpens` 的增量，除以 240。
- **机器的 TCP 连接数**：读 `CurrEstab`。
- **平均每秒 UDP 接收数据报**：取最近 240 秒内 `InDatagrams` 的增量，除以 240。
- **平均每秒 UDP 发送数据报**：取最近 240 秒内 `OutDatagrams` 的增量，除以 240。
