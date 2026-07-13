---
title: Linux 网络状态工具 ss 命令
date: '2015-07-15'
description: ss 是查看 socket 统计信息的工具，在高并发下统计连接数的效率远胜 netstat，本文整理其常用命令与输出示例。
category: linux
tags:
  - 网络排查
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.ttlsa.com/linux/
---
`ss` 用于查看 socket 统计信息，可显示所有 TCP/UDP sockets、各类持久连接、连接到 X server 的本地进程，并支持按 state（connected、SYN-RECV、SYN-SENT、TIME-WAIT 等）、地址、端口过滤。很多监控工具已用 ss 替代 netstat。

## 与 netstat 的效率对比

在有大量连接的服务器上统计并发连接数：

```bash
# time netstat -ant | grep EST | wc -l
3100
real 0m12.960s
user 0m0.334s
sys  0m12.561s

# time ss -o state established | wc -l
3204
real 0m0.030s
user 0m0.005s
sys  0m0.026s
```

netstat 耗时约 13 秒，ss 仅 0.03 秒——统计并发连接数时 ss 完胜。

## 常用命令

```bash
ss -l                 # 显示本地打开的所有端口
ss -pl                # 显示每个进程具体打开的 socket
ss -t -a              # 显示所有 tcp socket
ss -u -a              # 显示所有 udp socket
ss -o state established '( dport = :smtp or sport = :smtp )'   # 已建立的 SMTP 连接
ss -o state established '( dport = :http or sport = :http )'   # 已建立的 HTTP 连接
ss -x src /tmp/.X11-unix/*    # 找出所有连接 X 服务器的进程
ss -s                 # 列出当前 socket 详细统计信息
```

## 输出示例

`ss -s` 汇总当前已连接、关闭、等待的 TCP 连接：

```text
# ss -s
Total: 3519 (kernel 3691)
TCP:   26557 (estab 3163, closed 23182, orphaned 194, synrecv 0, timewait 23182/0), ports 1452

Transport Total     IP        IPv6
*         3691      -         -
RAW       2         2         0
UDP       10        7         3
TCP       3375      3368      7
INET      3387      3377      10
FRAG      0         0         0
```

`ss -l` 列出当前监听端口：

```text
# ss -l
Recv-Q Send-Q Local Address:Port  Peer Address:Port
0      10     :::5989             :::*
0      5      *:rsync             *:*
0      128    :::sunrpc           :::*
0      511    *:http              *:*
0      128    :::ssh              :::*
0      511    *:https             *:*
```
