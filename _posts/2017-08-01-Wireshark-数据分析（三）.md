---
title: "Wireshark 数据分析（三）"
date: 2017-08-01 02:51:50 +0000
categories: ["网络"]
tags: ["Pages"]
description: "Wireshark 数据分析（三） 2017 年 8 月 1 日 10:51 TCP层分析 传输控制协议，为数据提供可靠的端到端传输，处理数据的顺序和错误恢复，保证数据能够到达其应到达的地方 1. Transmission Control Protocol, Src Port: 52745 (52745), Dst P"
source: "evernote-local-db"
---

Wireshark

数据分析（三）
2017
年
8
月
1
日
10:51
TCP层分析
传输控制协议，为数据提供可靠的端到端传输，处理数据的顺序和错误恢复，保证数据能够到达其应到达的地方
1. Transmission Control Protocol, Src Port: 52745 (52745), Dst Port: 80 (80), Seq: 1, Ack: 1, Len: 202

总信息，源端口52745, 目的端口80 ( HTTP ) , 序号1, ACK 设置1，长度为202
2. Source Port: 52745 (52745)
—— 用来传输数据包的端口
3. Destination Port: http (80)
—— 数据包将要被发送到的端口
1~1023：标准端口组，特定服务会用到标准端口
1024~65535：临时端口组，操作系统会随机地选择一个源端口让某个通信单独使用
传输层的复用和分用功能都要通过端口才能实现
4. Stream index: 0

流端口号为0根据src.ip src.port dst.ip dst.port生成的一个索引号 Sequence number: 0
5. TCP Segment Len: 202 ( Next sequence – Sequence ) number

显示（0x50）TCP 携带数据的长度
6. Sequence number: 2186017225 显示为该包序列号的空际值
Sequence number: 1 (relative sequence number)，显示为该包序列号的相对值，这个数字用来表示一个TCP片段。这个域用来保证数据流中的部分没有流失（随机生成）
7. Next sequence number: 2186017427
Next sequence number: 203 (relative sequence number)

分析同上，下一个序列号（在实际传输中并未有此数据，是Wireshark 提供的，= Sequence number + TCP Segment Len）
8. Acknowledgment number: 1090536281
Acknowledgment number: 1 (relative ack number)
确认号为1: 这个数字式通信中希望从另外一个设备得到的下一个数据包的序号
9. Header Length: 20 bytes
数据偏移（即首部长度）显示（0x50）但实际为 (0x50
&
&
0XF0) / 4 = 20 ，剩下的0x50中的0 用于下面的

Reserverd 和Nonce. 它指出 TCP 报文段的数据起始处距离 TCP 报文段的起始处有多远
10. …. 0000 0001 1000 = Flags: 0x018 (PSH, ACK)
很重要，根据括号里的标志值(URG, ACK, PSH. RST, SYN, FIN)判断不同的TCP数据包的类型
Reserved: Not set —— 保留字段——占 6 位，保留为今后使用
Nonce: Not set 设置为0

随机数(Nonce)是任意的或非重复的值，它包括在经过一个协议的数据交换中，通常为保证活跃度以及避免受重复攻击
Congestion Window Reduced (CWR): Not set —— 没啥用
ECN-Echo: Not set
Urgent: Not set —— （基本此处无设置）

当 URG=1 时，表明紧急指针字段有效。它告诉系统此报文段中有紧急数据，应尽快传送(相当于高优先级的数据)
Acknowledgment: Set 1

（确认序号有效位）只有当 ACK=1 时确认号字段才有效。当ACK=0 时，确认号无效
Push: Set 1
——（通知接收端立即将数据提交上层，释放内存）

接收 TCP 收到 PSH=1 的报文段，就尽快地交付接收应用进程，而不再等到整个缓存都填满了后再向上交付
Reset: Not set

请求重新建立TCP连接，当 RST=1 时，表明 TCP 连接中出现严重差错（如由于主机崩溃或其他原因），必须释放连接，然后再重新建立运输连接
Syn: Not set

同步 SYN = 1 表示这是一个连接请求或连接接受报文
Fin: Not set

请求断开连接，用来释放一个连接。FIN 1 表明此报文段的发送端的数据已发送完毕，并要求释放运输连接。
11. Window size value: 64800
窗口大小，TCP接收者缓冲的字节大小
12. Calculated window size: 64800
计算窗口大小为64800
13. Window size scaling factor: -1 (unknown) 窗口大小换算系数
这里为 -1(unknown)是因为Wireshark所捕获的pacp中并未含有TCP三次握手信息，所以Wireshark

不知道正在使用的窗大小是否正在使用，就算使用，Wireshark 也不知道换算系数是多少
故Wireshark就简单地报道窗大小的值（可能包含真正窗大小）并标识上述-1 (unknown) 的信息
14. Checksum: 0xb4ca [validation disabled] //验证禁止
Good Checksum: False Bad Checksum: False

校验和：用来保证TCP头和数据的内容在抵达目的时的完整性
Urgent pointer: 0

如果设置了URG位，这个域将被检查作为额外的指令，告诉CPU从数据包的哪里开始读取数据
15. 选项（Options）
：各种可选的域，可以再TCP数据包中进行指定。但是几乎每一个SYN报文段中都含有TCP选项字段
16. SEQ/ACK analysis
Wireshark对序列/ACK的分析（不在实际数据流中）当且仅当数据中含有ACK时，才有此项！
Bytes in flight: 202 —— 网络中传输的字节为202

TCP 原理
Note: TCP的选项是可选的。
下面将详细讲解：
实际抓包中 SYN和SYN ACK包的TCP头部是32字节，有的时候是28字节，多了12或8字节的选项和填充字段。而ACK和FIN ACK包的TCP头部都是20字节。SYN中多出的12字节有什么作用？从wireshark里可以看到，options里面是诸如maximum segment，windows scale，NOP，SACK permitted等的字段，28字节的头部比32字节的少了3字节的windows scale选项及其之前的一个NOP

TCP有两种类型的选项：单字节和多字节。每一个选项有同样的结构：Kind + Length + Data，其中Lenght表示Kind、Lenght、Data三者的总长度，单字节的选项只有Kind
关于这些选项，就+有如下规则：
KIND（8bit）+LENGTH（8bit，NOP没有LENGTH部分）+内容（如果有的话）
Kind=0表示选项结束——1字节
Kind=1表示无操作，主要是用来占位从而达到字节对齐的目的——-1字节
Kind=2表示MSS选项——4字节
Kind=3表示窗口大小（窗口扩大因子）——3字节
Kind=4表示SACK-Permitted——-2字节
Kind=5表示一个SACK包—–可变长度
Kind=8表示时间戳—–10字节
类型2，表示MSS选项，长度length = 4 Bytes, Data(MSS Value = 1440)
类型1，表示无操作
类型3，表示窗口大小（窗口扩大因子）为2，长度为3
类型4，表示SACK-Permitted，长度为2，可以提高效率，详细见附录中——可选项参数分析

TCP的标志与三次握手
TCP 标志

TCP的三次握手
在 Wireshark 中设置TCP数据包序列号显示方式:
Edit -> Preference -> Protocols -> TCP 勾上后TCP数据包的序列号替换为相对值，如之前TCP端口截图中的序号0、1
1. 第一次握手：
2. 第二次握手：
3. 第三次握手：

TCP四次断开

1. 第一次断开：
2. 第二次断开：
3. 第三次断开：
4. 第四次断开：

TCP 重置异常终止（reset报文）
当TCP连接中途突然断掉，使用RST标志位指出连接被异常中止或拒绝连接请求

TCP的异常终止是相对于正常释放TCP连接的过程而言的，我们都知道，TCP连接的建立是通过三次握手完成的，而TCP正常释放连接是通过四次挥手来完成，但是有些情况下，TCP在交互的过程中会出现一些意想不到的情况，导致TCP无法按照正常的四次挥手来释放连接，如果此时不通过其他的方式来释放TCP连接的话，这个TCP连接将会一直存在，占用系统的部分资源。在这种情况下，我们就需要有一种能够释放TCP连接的机制，这种机制就是TCP的reset报文。reset报文是指TCP报头的标志字段中的reset位置一的报文，如下图所示：
server端不会考虑client的reset。例如HTTP server是不会考虑client的reset，它收到第一个reset就认为是client放弃链接了。server端只是被动端，尽量减少状态交互，不应该对reset发起主动的动作。
一般只有client要考虑server的reset，这种问题就是看你要是不是要“我死都要连”或者是“我收到reset就玻璃心不连了”
也就是说，client要根据reset的上下文或者应用本身的工作状态来判断接下来怎么办

TCP异常终止的常见情形
我们在实际的工作环境中，导致某一方发送reset报文的情形主要有以下几种：
1.客户端尝试与服务器未对外提供服务的端口建立TCP连接，服务器将会直接向客户端发送reset报文
2. 客户端和服务器的某一方在交互的过程中发生异常（如程序崩溃等），该方系统将向对端发送TCP reset报文，告之对方释放相关的TCP连接，如下图所示：
3. 接收端收到TCP报文，但是发现该TCP的报文，并不在其已建立的TCP连接列表内，则其直接向对端发送reset报文，如下图所示：
4. 在交互的双方中的某一方长期未收到来自对方的确认报文，则其在超出一定的重传次数或时间后，会主动向对端发送reset报文释放该TCP连接，如下图所示：
5，有些应用开发者在设计应用系统时，会利用reset报文快速释放已经完成数据交互的TCP连接，以提高业务交互的效率，如下图所示：

TCP 参数描述
在TCP层，有个FLAGS字段，这个字段有以下几个标识：SYN, FIN, ACK, PSH, RST, URG
SYN(synchronous建立联机) 表示建立连接
ACK(acknowledgement 确认) 表示响应
PSH(push传送) 表示有 DATA数据传输
FIN(finish结束) 表示关闭连接
RST(reset重置) 表示连接重置
URG(urgent紧急)
Sequence number(顺序号码) Acknowledge number(确认号码)
其中，ACK是可能与SYN，FIN等同时使用的，比如SYN和ACK可能同时为1，它表示的就是建立连接之后的响应，如果只是单个的一个SYN，它表示的只是建立连接
TCP的几次握手就是通过这样的ACK表现出来的， 但SYN与FIN是不会同时为1的，因为前者表示的是建立连接，而后者表示的是断开连接
RST一般是在FIN之后才会出现为1的情况，表示的是连接重置
一般地，当出现FIN包或RST包时，我们便认为客户端与服务器端断开了连接；而当出现SYN和SYN＋ACK包时，我们认为客户端与服务器建立了一个连接
PSH为1的情况，一般只出现在 DATA内容不为0的包中，也就是说PSH为1表示的是有真正的TCP数据包内容被传递
TCP的连接建立和连接关闭，都是通过请求－响应的模式完成的
Sequence Number是针对自身的，所在数据段(数据包)的。表示所在数据段的第一个数据字节的序列号, syn（这一步是初始化发送端的ISN( Initial Sequence Number )。理论上，它的数据字段没有任何值，消耗的是一个虚字节）

TCP初始化序列号ISN
TCP初始化序列号不能设置为一个固定值，因为这样容易被攻击者猜出后续序列号，从而遭到攻击
RFC1948中提出了一个较好的初始化序列号ISN随机生成
算法
ISN = M + F(localhost, localport, remotehost, remoteport)
M是一个计时器，这个计时器每隔4毫秒加1
F是一个Hash算法，根据源IP、目的IP、源端口、目的端口生成一个随机数值。要保证hash算法不能被外部轻易推算得出，用MD5算法是一个比较好的选择。

Seq和Ack的关系（重点）
1. Seq即Sequence Number，为源端（source）的发送序列号；Ack即Acknowledgment Number，为目的端（destination）的接收确认序列号
2. 在Wireshark Display Filter中，可使用tcp.seq或tcp.ack过滤
3. 在Packet1中，C:5672向S:80发送SYN握手包，Seq=0(relative sequence number)；在Packet2中，S:80向C:5672发送ACK握手回应包，Ack=1(relative sequence number)，同时发送SYN握手包，Seq=0(relative sequence number)；在Packet3中，C:5672向S:80发送ACK握手回应包，Seq=1，Ack=1。（C：Client S : Server）
4. 至此，Seq=1为C的ISN（Initial Sequence Number），后期某一时刻的Seq=ISN+累计发送量(cumulative sent)；Ack=1为C的IAN（Initial Acknowledge Number），后期某一时刻的Ack=IAN+累计接收量(cumulative received)。对于S而言，Seq和Ack情同此理
例：Next sequence number: 733 (relative sequence number) ，
假如我现在的sequence number =1 , 那么这个 733 = 1 + 732 ， 732 正好是我应用的报文大小。 后面的发送报文，假如我的sequence number不是733 ，wireshark就会提示 out of order .
A–>B Sequenace number =1, Next Sequence Number = 733, Acknowledgement number=1
B–>A …..
A–>B Sequence number =733 这里，sequence number必须为733 ，否则wireshark 报out of order, Next Sequence number= 926 Acknowledge number = 23

附录
可选项参数分析
1. 窗口扩大因子TCP Window Scale Option (WSopt)
TCP窗口缩放选项是用来增加TCP接收窗口的大小而超过65536字节
①

启用窗口扩大选项，通讯双方必须在各自的
SYN
报文中发送这个选项。主动建立连接的一方在
SYN
报文中发送这个选项；而被动建立连接的一方只有在收到带窗口扩大选项的
SYN
报文之后才能发送这个选项
②

这个选项只在一个
SYN
报文中有意义
SYN
或
SYN, ACK
，包含窗口扩大选项的报文如果没有SYN位，则会被忽略掉。当连接建立起来后，在每个方向的扩大因子是固定的。注意：在SYN报文本身的窗口字段始终不做任何的扩大。
③

在启用窗口扩大选项的情况下，若发送一个窗口通告，要将实际窗口大小右移
shift.cnt
位，然后赋给
TCP
首部中的
16bit
窗口值；而当接收到一个窗口通告时，则将
TCP
首部中的
16bit
窗口值左移
shift.cnt
位，以获得实际的通告窗口大小
④

shift.cnt
取值范围为
0~14
，即最大
TCP
序号限定为
2^16 * 2^ 14 = 2^30
<
2^31
。该限制用于防止字节序列号溢出
2. window size value: 8192 与window scale: 2 (multiply by 4) 的关系是：
window size value指的是滑动窗口缓冲大小，在TCP头中已经定义过。但是实际中，该窗的大小却更大，所以实际的窗口大小为：8192 * 4 = 32768
3. SACK选择确认选项
TCP通信时，如果发送序列中间某个数据包丢失，TCP会通过重传最后确认的包开始的后续包，这样原先已经正确传输的包也可能重复发送，急剧降低了

TCP 性能
为改善这种情况，发展出SACK(Selective Acknowledgment, 选择性确认)技术，使TCP只重新发送丢失的包，不用发送后续所有的包，而且提供相应机制使接收方能告诉发送方哪些数据丢失，哪些数据重发了，哪些数据已经提前收到等
SACK信息是通过TCP头的选项部分提供的，信息分两种，一种标识是否支持SACK(类型4)，是在TCP握手时发送；另一种是具体的SACK信息(类型5)
SACK允许选项 ，该选项只允许在有SYN标志的TCP包中，也即TCP握手的前两个包中，分别表示各自是否支持SACK
SACK选项 ，选项长度: 可变。实际最多不超过4组边界值
４. MSS: Maxitum Segment Size 最大分段大小
最大报文段长度（MSS）表示TCP传往另一端的最大块数据的长度。当建立一个连接时，每一方都有用于通告它期望接收的 MSS选项（M S S选项只能出现在S Y N报文段中）
通过MSS，应用数据被分割成TCP认为最适合发送的数据块，由TCP传递给IP的信息单位称为报文段或段(segment)
我们不难联想到，跟最大报文段长度最为相关的一个参数是网络设备接口的MTU，以太网的MTU是1500，基本IP首部长度为20，TCP首部是20，所以MSS的值可达1460(MSS不包括协议首部，只包含应用数据)
MSS是可以通过SYN段进行协商的但它并不是任何条件下都可以协商的，如果一方不接受来自另一方的MSS值（不带MMS选项即代表不接受），则MSS就定为默认值536字节
Timestamp时间戳选项

时间戳选项使发送方在每个报文段中放置一个时间戳值。接收方在确认中返回这个数值，从而允许发送方为每一个收到的 A C K计算RT T（我们必须说“每一个收到的 A C K”而不是“每一个报文段”，是因为T C P通常用一个A C K来确认多个报文段）。我们提到过目前许多实现为每一个窗口只计算一个 RT T，对于包含8个报文段的窗口而言这是正确的。然而，较大的窗口大小则需要进行更好的RT T计算。 时间戳是一个单调递增的值。由于接收方只需要回显收到的内容，因此不需要关注时间戳单元是什么。这个选项不需要在两个主机之间进行任何形式的时钟同步。

来自

<
http://blog.csdn.net/u011414200/article/details/47948401
>

已使用 Microsoft OneNote 2016 创建。
