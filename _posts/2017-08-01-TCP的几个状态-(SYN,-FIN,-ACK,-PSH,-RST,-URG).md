---
title: "TCP的几个状态 (SYN, FIN, ACK, PSH, RST, URG)"
date: 2017-08-01 03:20:49 +0000
categories: ["网络"]
tags: ["Pages"]
description: "TCP 的几个状态 (SYN, FIN, ACK, PSH, RST, URG) 2017 年 8 月 1 日 11:20 TCP 的几个状态 (SYN, FIN, ACK, PSH, RST, URG) 发布时间 : 2012-03-17 00:20 文章来源 : 网络 文章作者 : 佚名 点击次数 : 次 分享到："
source: "evernote-local-db"
---

TCP
的几个状态

(SYN, FIN, ACK, PSH, RST, URG)
2017
年
8
月
1
日
11:20
TCP
的几个状态

(SYN, FIN, ACK, PSH, RST, URG)
发布时间
:
2012-03-17 00:20
文章来源
:
网络
文章作者
:
佚名
点击次数
:

次
分享到：
QQ
空间

QQ
微博

新浪微博

开心网

人人网
摘要：在
TCP
层，有个
FLAGS
字段，这个字段有以下几个标识：
SYN, FIN, ACK, PSH, RST, URG.

其中，对于我们日常的分析有用的就是前面的五个字段。 它们的含义是：

SYN
表示建立连接，

FIN
表示关闭连接，

ACK
表示响应，

PSH
表示有

DATA
数据传输，

RST
表示连接重置。 其
...
在
TCP
层，有个
FLAGS
字段，这个字段有以下几个标识：
SYN, FIN, ACK, PSH, RST, URG.

其中，对于我们日常的分析有用的就是前面的五个字段。

它们的含义是：

SYN
表示建立连接，

FIN
表示关闭连接，

ACK
表示响应，

PSH
表示有

DATA
数据传输，

RST
表示连接重置。

其中，
ACK
是可能与
SYN
，
FIN
等同时使用的，比如
SYN
和
ACK
可能同时为
1
，它表示的就是建立连接之后的响应，

如果只是单个的一个
SYN
，它表示的只是建立连接。

TCP
的几次握手就是通过这样的
ACK
表现出来的。

但
SYN
与
FIN
是不会同时为
1
的，因为前者表示的是建立连接，而后者表示的是断开连接。

RST
一般是在
FIN
之后才会出现为
1
的情况，表示的是连接重置。

一般地，当出现
FIN
包或
RST
包时，我们便认为客户端与
服务器
端断开了连接；而当出现
SYN
和
SYN
＋
ACK
包时，我们认为客户端与服务器建立了一个连接。

PSH
为
1
的情况，一般只出现在

DATA
内容不为
0
的包中，也就是说
PSH
为
1
表示的是有真正的
TCP
数据包内容被传递。

TCP
的连接建立和连接关闭，都是通过请求－响应的模式完成的。

概念补充
-TCP
三次握手：

TCP(Transmission Control Protocol)
传输控制协议

TCP
是主机对主机层的传输控制协议，提供可靠的连接服务，采用三次握手确认建立一个连接：

位码即
tcp
标志位，有
6
种标示：
SYN(synchronous
建立联机
) ACK(acknowledgement

确认
) PSH(push
传送
) FIN(finish
结束
) RST(reset
重置
) URG(urgent
紧急
)Sequence number(
顺序号码
) Acknowledge number(
确认号码
)

第一次握手：主机
A
发送位码为
syn
＝
1
，随机产生
seq number=1234567
的数据包到服务器，主机
B
由
SYN=1
知道，
A
要求建立联机；

第二次握手：主机
B
收到请求后要确认联机信息，向
A
发送
ack number=(
主机
A
的
seq+1)
，
syn=1
，
ack=1
，随机产生
seq=7654321
的包；

第三次握手：主机
A
收到后检查
ack number
是否正确，即第一次发送的
seq number+1
，以及位码
ack
是否为
1
，若正确，主机
A
会再发送
ack number=(
主机
B
的
seq+1)
，
ack=1
，主机
B
收到后确认
seq
值与
ack=1
则连接建立成功。

完成三次握手，主机
A
与主机
B
开始传送数据。

在
TCP/IP
协议中，
TCP
协议提供可靠的连接服务，采用三次握手建立一个连接。
第一次握手：建立连接时，客户端发送
syn
包
(syn=j)
到服务器，并进入
SYN_SEND
状态，等待服务器确认；
第二次握手：服务器收到
syn
包，必须确认客户的
SYN
（
ack=j+1
），同时自己也发送一个
SYN
包（
syn=k
），即
SYN+ACK
包，此时服务器进入
SYN_RECV
状态；

第三次握手：客户端收到服务器的
SYN
＋
ACK
包，向服务器发送确认包
ACK(ack=k+1)
，此包发送完毕，客户端和服务器进入
ESTABLISHED
状态，完成三次握手。完成三次握手，客户端与服务器开始传送数据
.

来自

<
http://www.yunsec.net/a/school/wlcs/agreement/2012/0317/10262.html
>

已使用 Microsoft OneNote 2016 创建。
