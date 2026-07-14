---
title: TCP 的那些事儿（下）
date: '2017-03-06'
description: "TCP 协议深入讲解：RTT 与 RTO 动态计算、TCP 滑动窗口与流控、Zero Window 问题、Silly Window Syndrome、拥塞控制算法（Slow Start、Congestion Avoidance、Fast Recovery、FACK）和多种优化算法（Vegas、HSTCP、BIC、Westwood）。"
category: linux
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
origin_url: http://coolshell.cn/articles/11609.html
---

TCP 协议下篇，重点介绍 TCP 的流迭、拥塞处理等高级机制。这些内容涉及多个算法演进，是理解现代 TCP 的关键。

## TCP 的 RTT 算法

Timeout（RTO）设置是重传机制的核心：
- 设过长：重发慢，丢包后久才重发，性能差
- 设过短：未丢包就重发，增加网络拥塞，导致更多超时和重发

因此必须动态计算。TCP 采用 RTT（Round Trip Time）来估计网络延迟。

### 经典算法（RFC 793）

采样多个 RTT 值，计算平滑 RTT（SRTT）：

```
SRTT = (α * SRTT) + ((1 - α) * RTT)
```

其中 α ∈ [0.8, 0.9]（加权移动平均）。

计算 RTO：

```
RTO = min[UBOUND, max[LBOUND, (β * SRTT)]]
```

其中 UBOUND 是上限，LBOUND 是下限，β ∈ [1.3, 2.0]。

### Karn / Partridge 算法

经典算法有个问题：重传时，应该用第一次发送时间还是重传时间计算 RTT？两种方式都不准确。

Karn 算法的关键思想：**忽略重传，不采样重传的 RTT**。

但新问题：若网络突然变慢导致大量重传，RTO 无法更新（灾难）。

解决方案：只要发生重传，立即将 RTO 翻倍（指数退避）。但这种死规矩对精确 RTT 估计仍不靠谱。

### Jacobson / Karels 算法（RFC 6289）

引入 RTT 偏差（DevRTT）来捕捉网络抖动：

```
SRTT = SRTT + α(RTT – SRTT)          // 平滑 RTT
DevRTT = (1-β)*DevRTT + β*|RTT-SRTT| // 偏差
RTO = μ*SRTT + ∂*DevRTT              // 综合公式
```

Linux 参数：α=0.125, β=0.25, μ=1, ∂=4

这是现代 TCP 标准算法，见 Linux 源码 `tcp_rtt_estimator`。

## TCP 滑动窗口

**TCP 必须解决可靠传输和包乱序问题**，因此需了解网络带宽和处理速度，避免拥塞和丢包。

TCP 头中的 **Window 字段**表示接收端的可用缓冲区，发送端据此调整发送速率。

### 缓冲区视角

- **接收端**：
  - LastByteRead：应用已读位置
  - NextByteExpected：期望收到的连续包末位
  - LastByteRcvd：实际收到的最后位置
  - AdvertisedWindow = MaxRcvBuffer – LastByteRcvd – 1

- **发送端**：
  - LastByteAcked：被确认的位置
  - LastByteSent：已发但未确认的最后位置
  - LastByteWritten：应用正写入的位置

### 发送端滑动窗口分段

1. 已确认数据
2. 已发送但未确认
3. 在窗口内但未发送（接收端有空间）
4. 窗口外数据（接收端无空间）

### Zero Window 问题

若接收端处理缓慢，Window 降至 0，发送端停止发送。接收端恢复空间后如何通知？

**Zero Window Probe（ZWP）**：发送端定期（通常 3 次，间隔 30-60s）发探针，询问接收端 Window 尺寸。若 3 次后仍为 0，某些 TCP 实现会 RST 断开连接。

**安全隐患**：攻击者可持续设置 Window=0，导致服务器等待 ZWP，耗尽资源（SockStress 攻击）。

### Silly Window Syndrome（"糊涂窗口综合症"）

接收端处理慢→Window 缩小→发送端为了几字节发送（包头 40 字节开销不值得）。

**MSS（Max Segment Size）**：去掉 TCP/IP 头 40 字节后的实际数据，以太网通常 1460 字节。RFC 默认 536 字节。

**解决方案**：

- **接收端（Clark 方案）**：若 Window < 某值，直接 ACK(0) 关闭窗口，阻止发送。待处理了足够数据且 Window ≥ MSS 或缓冲 50% 空闲，再打开。

- **发送端（Nagle 算法）**：延迟发送小包：
  1. 等到 Window ≥ MSS 或数据量 ≥ MSS
  2. 收到前一包的 ACK

Nagle 算法默认启用，对 SSH、Telnet（交互式）性能影响大。可设置 `TCP_NODELAY` 关闭：

```c
setsockopt(sock_fd, IPPROTO_TCP, TCP_NODELAY, (char *)&value, sizeof(int));
```

**注意**：`TCP_CORK` 不是关闭 Nagle，而是更激进的禁小包发送。两者不应同时设置。

## TCP 拥塞处理（Congestion Control）

Sliding Window 仅控制接收端处理能力。但网络中间也可能拥塞，导致丢包延迟。

**问题**：若发送端盲目重传，会加重网络负担→更多超时→更多重发→恶性循环→"网络风暴"。

**TCP 设计理念**：TCP 不是自私协议。拥塞发生时，要"自我牺牲"，主动让路，而非继续抢占。

参考论文：《Congestion Avoidance and Control》(PDF)

### 拥塞控制四大算法

1. **慢启动（Slow Start）**
2. **拥塞避免（Congestion Avoidance）**
3. **拥塞发生（Congestion Occurs）**
4. **快速恢复（Fast Recovery）**

演进历史：
- 1988：TCP-Tahoe（1、2、3）
- 1990：TCP Reno（增加 4）

### 慢启动（Slow Start）

新连接一点点提速，不要一上来就占满路。

算法（cwnd = Congestion Window）：

1. 初始化 cwnd = 1（一个 MSS）
2. 每收到一个 ACK，cwnd++ 线性增长
3. 每过一个 RTT，cwnd *= 2 指数增长
4. 当 cwnd ≥ ssthresh 时，进入拥塞避免

**初始化优化**：
- Google 论文建议（Linux 3.0+）：cwnd = 10 * MSS
- RFC 3390（Linux 2.6）：根据 MSS 值，cwnd 为 2-4

### 拥塞避免（Congestion Avoidance）

cwnd ≥ ssthresh 后，线性增长：

```
收到 ACK：cwnd = cwnd + 1/cwnd
每过 RTT：cwnd = cwnd + 1
```

缓慢调整到网络最佳值。

### 拥塞发生

有两种丢包信号：

**1. RTO 超时**：网络太糟糕

```
ssthresh = cwnd / 2
cwnd = 1
进入慢启动
```

**2. 快速重传（3 个重复 ACK）**：网络还可以

- TCP Tahoe：同 RTO
- TCP Reno：
  ```
  cwnd = cwnd / 2
  ssthresh = cwnd
  进入快速恢复
  ```

### 快速恢复（Fast Recovery）

进入前，cwnd 和 ssthresh 已更新（如上）。

算法：

```
cwnd = ssthresh + 3 * MSS         // 3 表示 3 个重复 ACK
重传指定数据包
若再收重复 ACK：cwnd = cwnd + 1
若收到新 ACK：cwnd = ssthresh，进入拥塞避免
```

**问题**：算法依赖 3 个重复 ACK，但不知道丢了几个包，可能只重传一个而剩余包要等 RTO。

### TCP New Reno（RFC 6582，1995）

改进 Fast Recovery，在无 SACK 支持下处理多包丢失：

1. 收到 3 个重复 ACK，进入 Fast Retransmit，重传指示包
2. 若只丢一包，回来的 ACK 会确认所有已发数据
3. 若未确认全部，说明多包丢失（Partial ACK），继续重传滑动窗口的第一个未 ACK 包
4. 直到不再收到 Partial ACK，结束 Fast Recovery

### FACK 算法（Forward Acknowledgment）

基于 SACK，更精确地追踪网络中的数据。

论文：《Forward Acknowledgement: Refining TCP Congestion Control》

关键变量：

- `snd.fack`：SACK 中最大 Sequence Number
- `awnd = snd.nxt – snd.fack`：网络中的实际数据量
- 重传时：`awnd = snd.nxt – snd.fack + retran_data`

触发重传条件：`(snd.fack – snd.una > 3*MSS) || (dupacks == 3)`

优势：不用等 3 个重复 ACK，快速检测。重传过程中 cwnd 不变，直到旧包全确认才进入拥塞避免。

**问题**：在 reordering 网络中表现差。

## 其他拥塞控制算法简介

### TCP Vegas（1994）

关键思想：**用 RTT 值影响 cwnd，而非通过丢包**。

- 监控基准 RTT
- 根据实际带宽与期望对比，线性增减 cwnd
- RTT 超过 Timeout 后立即重传（不等超时触发）

论文对比表明 Vegas 比 New Reno 表现好。

### HSTCP（High Speed TCP，RFC 3649）

改造基础算法，让 cwnd 涨得快、降得慢：

```
拥塞避免增长：cwnd = cwnd + α(cwnd) / cwnd
丢包下降：cwnd = (1 - β(cwnd)) * cwnd
```

其中 α 和 β 都是 cwnd 的函数（标准 TCP 时 α=1, β=0.5）。

### TCP BIC（2004）

关键创新：用**二分查找**找最优 cwnd。

- 为各种 cwnd 找平衡点
- Linux 2.6.8+ 默认算法
- 实现见 Linux 源码 `tcp_bic.c`

### TCP Westwood

采用 Reno 的慢启动和拥塞避免，主要改进在**发送端带宽估计**：

```
带宽估计 = 单个 RTT 内被 ACK 的字节数
ssthresh = est_bandwidth * min_RTT
```

丢包时：
- Duplicate ACK：若 cwnd > ssthresh，则 cwnd = ssthresh
- RTO：cwnd = 1，进入慢启动

## 后记

TCP 演进 30+ 年，内容丰富足以写本书。本文目的是介绍经典基础知识，希望能激发学习底层技术的兴趣。

更多算法参考：[Wikipedia - TCP Congestion Avoidance Algorithm](http://en.wikipedia.org/wiki/TCP_congestion-avoidance_algorithm)

深度参考：
- 论文集：Congestion Avoidance and Control、Vegas、HSTCP、BIC、Forward Acknowledgment 等
- Linux 源码：`/net/ipv4/tcp_*.c`
