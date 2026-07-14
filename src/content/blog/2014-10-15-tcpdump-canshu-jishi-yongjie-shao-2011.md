---
title: tcpdump参数及使用介绍
date: '2014-10-15'
description: "tcpdump是网络包嗅探工具，用来捕获和分析网络流量。支持多种参数控制过滤条件、输出格式、协议类型等，常用于网络故障排查和安全分析。"
category: linux
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---

## tcpdump 参数

- `-a`：将网络地址和广播地址转变成名字
- `-d`：将匹配信息包的代码以汇编格式给出
- `-dd`：将匹配信息包的代码以 C 语言程序段格式给出
- `-ddd`：将匹配信息包的代码以十进制形式给出
- `-e`：在输出行打印出数据链路层的头部信息
- `-f`：将外部 Internet 地址以数字形式打印
- `-l`：使标准输出变为缓冲行形式
- `-n`：不把网络地址转换成名字
- `-t`：在输出的每一行不打印时间戳
- `-v`：输出稍微详细的信息（包括 TTL、服务类型等）
- `-vv`：输出详细的报文信息
- `-c 数字`：收到指定数目的包后停止
- `-F 文件`：从指定文件中读取表达式
- `-i 接口`：指定监听的网络接口
- `-r 文件`：从指定的文件中读取包
- `-w 文件`：直接将包写入文件，不分析和打印
- `-T 类型`：将包直接解释为指定类型（rpc、snmp 等）
- `-p 协议`：指定协议（tcp、udp、icmp、arp）
- `-s 字节数`：指定捕获数包的大小（默认 96，最大 65536）

## 过滤表达式

**关键字**：
- 协议：`tcp`, `udp`, `icmp`, `arp`
- 数据包方向：`dst`, `src`, `port`, `dst port`, `src port`, `host`
- 运算符：`or`, `and`, `not` (或 `!`)

**例子**：

```bash
# 多条件（需要用括号和转义）
dst (172.16.1.1 or 172.16.1.13)
```

## TCP 包输出格式

```
src.port > dst.port: flags data-Seq ack win urgent options
```

- `src.port > dst.port`：源地址.源端口 到 目的地址.目的端口
- `flags`：TCP 包中的标志信息
  - `S`：SYN 标志
  - `F`：FIN（结束）
  - `P`：PUSH（传送）
  - `R`：RST（重置）
  - `.`：没有标记
- `data-Seq`：数据包中的 Sequence number
- `ack`：Acknowledge number
- `window`：接收缓存的窗口大小
- `urgent`：数据包中是否有紧急指针

TCP 标志位：
- `SYN`：synchronous（建立联机）
- `ACK`：acknowledgement（确认）
- `PSH`：push（传送）
- `FIN`：finish（结束）
- `RST`：reset（重置）
- `URG`：urgent（紧急）

## 常用例子

查看 ICMP 包：

```bash
tcpdump -i eth0 -p icmp (and src 192.168.1.xxx)
```

查看广播包：

```bash
tcpdump -i eth0 -p broadcast
```

查看 ARP 包：

```bash
tcpdump -i eth0 -p arp
```

嗅探 21 端口数据并解包：

```bash
tcpdump -X -i eth0 -p tcp port 21
```

获取 FTP 密码：

```bash
tcpdump -X -i eth0 -p tcp port 21 > 21.log &
cat 21.log | grep "USER"
cat 21.log | grep "PASS"
```

更精确的嗅探（从 172.16.1.1 到 172.16.1.2 端口为 21）：

```bash
tcpdump -i eth0 -X -tnn -p tcp and src 172.16.1.1 and dst 172.16.1.2 and port 21
```

嗅探 80 端口数据：

```bash
tcpdump -X -n -p tcp dst port 80
```

指定主机：

```bash
tcpdump -i eth0 host 202.96.128.68
```

嗅探从 172.16.1.2 到 172.16.1.1 或 172.16.1.13 的数据包：

```bash
tcpdump -i eth0 -tnn src 172.16.1.2 and dst (172.16.1.1 or 172.16.1.13)
```

统计 1000 个数据包中的 IP 连接量（按从多到少排序，列出前 3 名）：

```bash
tcpdump -i eth0 -tnn -c 1000 | awk -F "." '{print $1"."$2"."$3"."$4}' | sort | uniq -c | sort -nr | head -n 3
```

嗅探所有 TCP、UDP、ICMP 消息（不转换网络名称以加快速度）：

```bash
tcpdump -i eth0 -tnn host 192.168.1.100 and (-p tcp or -p udp or -p icmp)
```

嗅探 DHCP 服务器（捕获非法 DHCP Server）：

```bash
tcpdump -i eth0 -tnn port 67
```

然后用 dhclient 进行 DHCP 请求：

```bash
dhclient eth0
cat /var/messages | grep "DHCPACK from"
```
