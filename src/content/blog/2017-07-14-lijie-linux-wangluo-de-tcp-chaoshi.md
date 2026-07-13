---
title: 'Linux 网络中的 TCP 超时和重传'
date: '2017-07-14'
description: >-
  Linux TCP 协议栈中的超时重传机制：RTT（往返延迟）与 RTO（重传超时）的关系；内核参数 TCP_RTO_MIN（200ms）与 TCP_RTO_MAX（120s）的限制；tcp_retries1、tcp_retries2、tcp_syn_retries 的配置调优。
category: network
tags:
  - linux-admin
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
origin_url: http://xiaorui.cc/2016/06/05/%E7%90%86%E8%A7%A3linux%E7%BD%91%E7%BB%9C%E7%9A%84tcp%E8%B6%85%E6%97%B6%E5%92%8C%E9%87%8B%E4%BC%A0/
---
首选我们需要明确两个TCP概念，一个是rtt，一个是rto.
首先RTT是什么，RTT简单来说，就是我发送一个数据包，然后对端回一个ack，那么当我接到ack之后，就能计算出从我发送出包到接到过了多久，这个时间就是RTT。RTT的计算是很简单的，就是一个时间差。
TCP重传机制Timeout的设置对于重传非常重要。
设长了，重发就慢，丢了老半天才重发，没有效率，性能差
设短了，会导致可能并没有丢就重发。于是重发的就快，会增加网络拥塞，导致更多的超时，更多的超时导致更多的重发。
而RTO呢，RTO也就是tcp在发送一个数据包之后，会启动一个重传定时器，而RTO就是这个定时器的重传时间。 在通俗的讲就是，我一开始预先算个定时器时间，如果你回复了ack那正好，如果没有回复给我ack，然后RTO定时器的时间又到了，那么我就重传。 那么这个时候，就有问题了，由于RTO是指的这次发送当前数据包所预估超时时间,那么RTO就需要一个很好的算法来统计，来更好的预测这次的超时时间。 RTO不是固定写死的配置，而是经过RTT计算出来的。
有了RTT才能计算出RTO，但可以确定的是RTO肯定要比RTT的时间大，当然这是废话。
这个计算方法你可以自己搜搜相关的资料，有些头疼。
其实大家大可不必深究学习RTO的计算的算法，多数情况RTT都是比较小的，当RTT 小于 RTO MIN时，那么RTO初始值可以理解为RTO的那个最小200ms值。 当然如果超过RTO最小值，那这个时间就要斟酌了，最坏单次不会超过RTO MAX 。 中国的环境还是可以的，一般丢包还是比较少的，省事直接上个BGP完事。
## 超时重传的触发条件

什么时候会引起超时重传？
1. 我给你发了，但过程有点悲催，丢包了。
2. 数据到你那边了，你没有回复ack。
3. 数据到你那边了，你也回复ack了，但回复的路中丢包了。
总的来说，作为发送端我只要是没有收到ack，我就会重发， 我们这里主要是讨论什么时候重试发包，另外需要发几次，每次的间隔时间。
下面是内核关于RTO定时器的最长时间，最短时间限制。
Python
1
2
3
4
5
6
7
8
9
10
11
```bash
#xiaorui.cc
#define TCP_RTO_MAX ((unsigned)(120*HZ)) // 120秒
#define TCP_RTO_MIN ((unsigned)(HZ/5)) //0.2s
#define TCP_TIMEOUT_INIT ((unsigned)(1*HZ)) /* RFC2988bis initial RTO value */
#define TCP_TIMEOUT_FALLBACK ((unsigned)(3*HZ)) /* RFC 1122 initial RTO value, now
```
*
used
as
a fallback RTO
for
the
*
initial data transmission
if
no
*
valid RTT sample has been
acquired
,
*
most likely due to retrans
in
3WHS.
*/
这些宏定义都是以HZ为单位的, linux 2.6.18之后默认HZ是1000个时钟,每个时钟为一个TICK，加起来是1秒，因此我这边RTO为1000/5 = 200ms，在这里需要强调一下，RTO重传间隔是指数增加的，根据重传次数的增多，这消耗的时间也是指数增长, 200*2ms，200*4ms，200*8ms , 200 * 16ms。。。一定要注意，RTO的时间是翻翻增长的，最长不会超过TCP_RTO_MAX的限制，也就是两分钟。
Python
1
2
3
4
5
6
7
#xiaorui.cc
[
root
@
xiaorui
.
cc
~
]
```bash
# grep CONFIG_HZ /boot/config-2.6.32-358.el6.x86_64
# CONFIG_HZ_100 is not set
# CONFIG_HZ_250 is not set
# CONFIG_HZ_300 is not set
```
CONFIG_HZ_1000
=
y
CONFIG_HZ
=
1000
下面是内核的tcp重传次数，这些都是可以改的。
Python
1
2
3
4
5
6
[
root
@
xiaorui
.
cc
~
]
# cat /proc/sys
et/ipv4/tcp_syn_retries
3
[
root
@
xiaorui
.
cc
~
]
# cat /proc/sys
et/ipv4/tcp_retries2
5
[
root
@
xiaorui
.
cc
~
]
# cat /proc/sys
et/ipv4/tcp_retries1
5
http://xiaorui.cc/2016/06/05/%E7%90%86%E8%A7%A3linux%E7%BD%91%E7%BB%9C%E7%9A%84tcp%E8%B6%85%E6%97%B6%E5%92%8C%E9%87%8D%E4%BC%A0/
>
