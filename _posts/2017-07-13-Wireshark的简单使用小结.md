---
title: "Wireshark的简单使用小结"
date: 2017-07-13 03:51:31 +0000
categories: ["网络"]
tags: ["Pages"]
description: "2017 年 7 月 13 日 11:51 Wireshark 的简单使用小结 Wireshark （前称 Ethereal ）是一个网络封包分析软件。网络封包分析软件的功能是截取网络封包，并尽可能显示出最为详细的网络封包资料。在过去，网络封包分析软件是非常昂贵，或是专门属于营利用的软件， Wireshark 的出现改"
source: "evernote-local-db"
---

2017
年
7
月
13
日
11:51
Wireshark
的简单使用小结

Wireshark
（前称
Ethereal
）是一个网络封包分析软件。网络封包分析软件的功能是截取网络封包，并尽可能显示出最为详细的网络封包资料。在过去，网络封包分析软件是非常昂贵，或是专门属于营利用的软件，
Wireshark
的出现改变了这一切。在
GNU GPL
通用许可证的保障范围底下，使用者可以以免费的代价取得软件与其程式码，并拥有针对其源代码修改及客制化的权利。
Wireshark
是目前全世界最广泛的网络封包分析软件之一。

Wireshark
的主要应用包括：（
1
）网络管理员使用
Wireshark
来检测网络问题；（
2
）网络安全工程师使用
Wireshark
来检查资讯安全相关问题；（
3
）开发者使用
Wireshark
来为新的通讯协定除错；（
4
）普通使用者使用
Wireshark
来学习网络协定的相关知识。
我安装了
Wireshark 1.6.5
（各种版本可至官网下载
http://www.wireshark.org/download.html
），下面是启动后的主窗口界面：

（一）开始
/
结束抓包
首先开始抓包，开始的方法有很多，最快的可以单击
（“
List the available capture interfaces...
”），出现下图窗口，单击“
Start
”；

此时抓包工作边开始，
Packet List
面板将出现大量的包信息了。

默认显示的信息包括：
（
1
）
No.
：包的编号；
（
2
）
Time
：包的时间戳，可以通过“
View>>Time Display Format”
设置时间显示格式；
（
3
）
Source
：包的源地址；
（
4
）
Destination
：包的目标地址；
（
5
）
Protocol
：包的协议类型，针对不同的协议类型，可以显示不同的颜色，也可关闭这一功能（“
View>>Colorize Packet List”
）；
（
6
）
Length
：包的长度（单位为
bytes
）；
（
7
）
Info
：包内容的附加信息。
快捷键“
Ctrl+I
”可以再一次呼出“
Capture Interfaces
”窗口，单击“
Stop
”结束抓包。
（二）分析（解剖）包
对已抓取的包选择其中的一个进行分析。

从
Packet List
面板中可以知道，这是我抓到的第一个包，相对时间
0.000000
，源地址为
192.168.0.101
（我使用的是寝室路由器搭建的局域网，此为我的室友
IP
，此时他正在魔兽
ing
），数据包发往
113.89.208.228
（应该是魔兽的服务器了，
google
后这个
IP
好像在广州
...
），使用
UDP
协议（游戏嘛，资源消耗少，处理速度快），
1094
字节长，附加信息是用户数据报协议。
更多的信息，我们可以查看下面的
Packet Details
窗口和
Packet Byte
窗口。
（
1
）
Packet Details
面板：

该面板主要以树状方式显示包列表面板选中包的协议及协议字段，可以方便地展开或折叠它们。点击其中一行，即可在
Packet Byte
面板中高亮显示相应内容。
其中，各行信息分别为：

i.

“
Frame 1
”包括基本信息
;

ii.

“
Ethernet II
，
Src
”来自数据链路层
;

iii.

“
Internet Protocol Version 4
，
Src
”来自网络层，包括
IP
协议，

iv.

“
User Datagram Protocol
，
Src Port
”为传输层信息，此包使用了
UDP
协议，

v.

“
Data
”即包中数据内容。
（
2
）
Packet Byte
面板：

该面板中信息以十六进制显示，第一列为包数据偏移量，第二列为十六进制数据内容，第三列为对应的
ASCII
码字符。例如：该数据包中的
IP
协议中便包涵了源地址
IP
和目标地址
IP
，

其中，最后
16
位（十六进制）分别表示了这两个
IP
。
"c0 a8 01 65
（
192.168.1.101
）
"
是源地址，“
71 59 d0 e4
（
113.89.208.228
）”是目标地址。

这是我初步学习和使用
Wireshark
的总结。今后我会继续深入掌握其他的使用用途（合并、过滤、校验、重组等），并进一步完善日志内容。

参考：
Wireshark -

维基百科
（
http://zh.wikipedia.org/wiki/Wireshark
）

Wireshark
用户手册
（
http://man.lupaworld.com/content
etwork/wireshark/index.html
）

来自

<
http://www.cnblogs.com/RenQilei/archive/2012/02/26/2368849.html
>

已使用 Microsoft OneNote 2016 创建。
