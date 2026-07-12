---
title: TCP 的那些事儿（上）
date: '2017-03-06'
description: "TCP 协议深入讲解：TCP 头格式、状态机、三次握手和四次挥手原理、SYN 超时与 SYN Flood 攻击、ISN 初始化、TIME_WAIT 状态处理、重传机制（超时重传、快速重传、SACK、D-SACK）。"
category: linux
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
origin_url: http://coolshell.cn/articles/11564.html
---

TCP 是一个极其复杂的协议，需要解决网络包乱序、丢包、流控等多个问题。这篇笔记整理 TCP 协议的核心机制。推荐深入学习参考 W.Richard Stevens 的《TCP/IP 详解 卷1：协议》和 RFC793。

## TCP 头格式

TCP 数据单位称为 Segment，它被封装在 IP Packet 中，再封装在以太网 Frame 中。

关键的 TCP 头字段：

- **Sequence Number**：包的序号，用来解决网络包乱序（reordering）问题
- **Acknowledgement Number（ACK）**：用于确认收到，解决丢包问题
- **Window（Advertised-Window）**：滑动窗口，用于解决流控
- **TCP Flag**：包的类型，用于操控 TCP 状态机

一个 TCP 连接由四元组标识：(src_ip, src_port, dst_ip, dst_port)，加上协议号是五元组。

## TCP 的状态机

**网络上的传输是无连接的，TCP 所谓的"连接"只是通讯双方维护的"连接状态"**。因此 TCP 状态转换至关重要。

### 三次握手建立连接

主要是初始化 Sequence Number 的初始值（ISN: Initial Sequence Number）。通信双方互相通知各自的 ISN（SYN），作为后续数据通信的序号基础，保证接收层数据不会乱序。

### 四次挥手断开连接

实际上是两次（发送 FIN 和接收 FIN），因为 TCP 是全双工的，双方都需要发送 Fin 和 Ack。若两边同时断连接，会进入 CLOSING 状态。

## TCP 连接管理的细节

**SYN 超时**：服务端回 SYN-ACK 后若未收到客户端 ACK，会重发 SYN-ACK。Linux 下默认重试 5 次，间隔为 1s, 2s, 4s, 8s, 16s，第 5 次后等 32s，总共 63s 才断开连接。

**SYN Flood 攻击**：攻击者发送 SYN 后下线，服务器等待 63s 才断开，导致 SYN 队列耗尽。

**SYN Cookie 对策**：当 SYN 队列满后，TCP 通过源地址端口、目标地址端口和时间戳生成特殊 Sequence Number（Cookie），正常连接会回复，允许建立连接。注意 **SYN Cookie 是妥协版协议，不应用于正常的大负载连接**。

正常负载应调整以下参数：
- `tcp_synack_retries`：减少重试次数
- `tcp_max_syn_backlog`：增大 SYN 连接队列
- `tcp_abort_on_overflow`：超限直接拒绝连接

**ISN 初始化**：ISN 必须动态初始化，绑定一个虚拟时钟每 4 微秒加一，周期约 4.55 小时。这样保证旧连接的包不会被误认为新连接的包。

**MSL 与 TIME_WAIT**：最大分段生存期（MSL）定义为 2 分钟（Linux 设为 30s）。从 TIME_WAIT 到 CLOSED 的超时是 2*MSL，确保：
1. 对端收到 ACK（若未收到会重发 Fin）
2. 足够时间避免新连接混入旧包

**TIME_WAIT 过多问题**：大并发短连接下 TIME_WAIT 积累，消耗系统资源。常见调优参数 `tcp_tw_reuse` 和 `tcp_tw_recycle`：
- `tcp_tw_reuse`：需配合 `tcp_timestamps=1` 使用，较温和
- `tcp_tw_recycle`：更激进，但在 NAT 网络或 IP 重用场景会出现诡异问题

**警告**：这两个参数会违反 RFC 1122，可能导致 TCP 连接问题，非专家不建议使用。

**解决方案**：设置 HTTP KeepAlive（让浏览器重用一个 TCP 连接处理多个 HTTP 请求），让客户端主动断连接。

## 数据传输中的 Sequence Number

**SeqNum 增加与传输字节数相关**。如发送 1440 字节数据，下一个包的 SeqNum 增加 1440。ACK 回复表示该字节之前的数据已收到。

注意：Wireshark 默认显示 Relative SeqNum（相对序号），可在协议设置中改为 Absolute SeqNum。

## TCP 重传机制

接收端确认只能确认最后一个**连续**的包。发送端收不到某个中间包的 ACK 时，会重传。

### 超时重传

- 选项一：只重传超时的包，节省带宽但慢
- 选项二：重传所有超时后的包，快但浪费带宽

都需要等待 timeout，timeout 可能很长。

### 快速重传（Fast Retransmit）

不以时间驱动，而以数据驱动重传。若包没有连续到达，接收端一直 ACK 最后可能丢失的包。发送方连续收到 3 个相同 ACK，立即重传（无需等 timeout）。

但面临选择：是重传一个包还是重传多个包？发送端不清楚是哪些包触发了重复 ACK。

### 选择确认（SACK - Selective Acknowledgment）

TCP 头增加 SACK 选项，汇报接收到的数据片段。发送端根据 SACK 知道哪些数据到了、哪些没到，优化重传。

需两边都支持。Linux 通过 `tcp_sack` 参数打开（Linux 2.4 后默认打开）。

**接收端 Reneging 风险**：接收方有权丢弃已报告的 SACK 数据（极端情况，如内存紧张）。发送方不能完全依赖 SACK，仍需依赖 ACK 和 Time-Out；若后续 ACK 没有增长，还要重传 SACK 的数据。

**安全隐患**：攻击者可向发送端发大量 SACK 选项，导致发送端耗尽资源。

### 重复确认（D-SACK - Duplicate SACK）

使用 SACK 告诉发送方哪些数据被重复接收。根据 RFC-2883。

**D-SACK 判断**：
- 若 SACK 第一段范围被 ACK 覆盖 → D-SACK
- 若 SACK 第一段范围被 SACK 第二段覆盖 → D-SACK

**D-SACK 的好处**：

1. 知道是发出去的包丢了，还是回来的 ACK 包丢了
2. 判断自己的 timeout 是否太小导致不必要的重传
3. 检测网络 reordering（先发包后到）
4. 检测数据包被复制

Linux 通过 `tcp_dsack` 参数打开（Linux 2.4 后默认打开）。

---

更详细信息参考：
- [RFC 793 - TCP](http://tools.ietf.org/html/rfc793)
- [RFC 1122 - TCP 协议要求](http://tools.ietf.org/html/rfc1122)
- [RFC 2018 - SACK](http://tools.ietf.org/html/rfc2018)
- [RFC 2883 - D-SACK](http://www.ietf.org/rfc/rfc2883.txt)
