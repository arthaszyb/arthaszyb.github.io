---
title: 查看Apache并发请求数及其TCP连接状态
date: '2014-11-14'
description: 监控 Apache 服务器的并发请求处理能力。通过系统命令查看 httpd 进程数和网络连接状态，理解 TCP 连接的各种状态。
category: web-infra
tags:
  - apache
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
origin_url: http://blog.zyan.cc
---

## 查看 httpd 进程数

httpd 进程数对应 prefork 模式下 Apache 能处理的并发请求数：

```bash
ps -ef | grep httpd | wc -l
```

示例输出：
```
1388
```

表示当前 Apache 能处理 1388 个并发请求。这个值会根据负载情况自动调整。

## 查看 Apache 并发请求和连接状态

使用 `netstat` 和 `awk` 统计所有 TCP 连接的状态分布：

```bash
netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
```

示例输出：
```
LAST_ACK 5
SYN_RECV 30
ESTABLISHED 1597
FIN_WAIT1 51
FIN_WAIT2 504
TIME_WAIT 1057
```

## TCP 连接状态说明

| 状态 | 说明 |
|------|------|
| CLOSED | 无连接是活动的或正在进行 |
| LISTEN | 服务器在等待进入呼叫 |
| SYN_RECV | 一个连接请求已到达，等待确认 |
| SYN_SENT | 应用已开始，打开一个连接 |
| ESTABLISHED | 正常数据传输状态，连接已建立 |
| FIN_WAIT1 | 应用说它已完成 |
| FIN_WAIT2 | 另一边已同意释放 |
| TIMED_WAIT | 等待所有分组死掉 |
| CLOSING | 两边同时尝试关闭 |
| TIME_WAIT | 另一边已初始化一个释放 |
| LAST_ACK | 等待所有分组死掉 |

## 性能分析

从输出结果可以判断 Apache 的连接处理情况：

- **SYN_RECV**：正在等待处理的请求数
- **ESTABLISHED**：正常数据传输中的连接数（并发处理的请求）
- **TIME_WAIT**：处理完毕等待超时结束的连接数

如果 ESTABLISHED 连接数接近 MaxClients 限制，说明服务器处于高负荷状态，可能需要调整 Apache 配置来增加并发处理能力。
