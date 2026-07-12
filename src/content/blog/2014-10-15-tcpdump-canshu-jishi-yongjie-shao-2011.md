---
title: 'tcpdump参数及使用介绍2011-02-10 14:07:40'
date: '2014-10-15'
description: >-
  tcpdump参数及使用介绍 2011-02-10 14:07:40 标签：tcpdump 休闲 职场 tcpdump的参数介绍 -a
  将网络地址和广播地址转变成名字； -d 将匹配信息包的代码以人们能够理解的汇编格式给出； -dd 将匹配信息包的代码以c语言程序段的格式给出； -ddd
category: linux
tags:
  - tcpdump
  - dhcp
  - ftp
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---
tcpdump参数及使用介绍

2011-02-10 14:07:40

标签：[tcpdump](http://blog.51cto.com/tag-tcpdump.html) [休闲](http://blog.51cto.com/tag-%E4%BC%91%E9%97%B2.html) [职场](http://blog.51cto.com/tag-%E8%81%8C%E5%9C%BA.html)

tcpdump的参数介绍

　　　-a 　　　将网络地址和广播地址转变成名字；

　　　-d 　　　将匹配信息包的代码以人们能够理解的汇编格式给出；

　　　-dd 　　　将匹配信息包的代码以c语言程序段的格式给出；

　　　-ddd 　　　将匹配信息包的代码以十进制的形式给出；

　　　-e 　　　在输出行打印出数据链路层的头部信息；

　　　-f 　　　将外部的Internet地址以数字的形式打印出来；

　　　-l 　　　使标准输出变为缓冲行形式；

　　　-n 　　　不把网络地址转换成名字；

　　　-t 　　　在输出的每一行不打印时间戳；

　　　-v 　　　输出一个稍微详细的信息，例如在ip包中可以包括ttl和服务类型的信息；

　　　-vv 　　　输出详细的报文信息；

　　　-c 　　　在收到指定的包的数目后，tcpdump就会停止；

　　　-F 　　　从指定的文件中读取表达式,忽略其它的表达式；

　　　-i 　　　指定监听的网络接口；

　　　-r 　　　从指定的文件中读取包(这些包一般通过-w选项产生)；

　　　-w 　　　直接将包写入文件中，并不分析和打印出来；

　　　-T 　　　将监听到的包直接解释为指定的类型的报文，常见的类型有rpc(远程过程调用)和snmp(简单网络管理协议)

-p 指定协议tcp,udp,icmp,arp

-s 指定捕获数包字的大小,单位byte，默认96最大65536

可使用关键字:

协议,-p tcp,udp,icmp,arp等

数据包:dst,src,port,dst port,src port,host

运算符:or and not(!)

多条件:dst \\(172.16.1.1 or 172.16.1.13 \\) 用括号及\\转义

在进行嗅探的时候，必须置于混杂模式才能嗅探，系统会有日志记录

grep "promiscuous" /var/log/messages //混杂模式

用TCPDUMP捕获的TCP包的一般输出信息是：

　　src.port > dst.port: flags data-Seq ack win urgent options

　　src.port > dst.port: 源地址.源端口 到 目的地址.目的端口

flags: TCP包中的标志信息,S 是SYN标志, F (FIN), P (PUSH)

R (RST) "." (没有标记)

data-Seq: 是数据包中Sequence number(顺序号码)

ack: Acknowledge number(确认号码)

window是接收缓存的窗口大小,

urgent表明数据包中是否有紧急指针.

注tcp标志位:

SYN(synchronous建立联机) ACK(acknowledgement 确认)

PSH(push传送) FIN(finish结束) RST(reset重置) URG(urgent紧急)

查看icmp包：

1,tcpdump -i eth0 -p icmp (and src 192.168.1.xxx)

查看广播包：

2,tcpdump -i eth0 -p broadcast

查看arp包

3,tcpdump -i eth0 -p arp

4,tcpdump -X -i eth0 -p tcp port 21 //嗅探21端口数据并解包

获取ftp密码实例:

tcpdump -X -i eth0 -p tcp port 21 > 21.log &

cat 21.log | grep "USER\\."

cat 21.log | grep "PASS\\."

更精确的嗅探:

嗅探从172.16.1.1到172.16.1.2端口为21的数据包:

tcpdump -i eth0 -X -tnn -p tcp and src 172.16.1.1 and dst 172.16.1.2 and port 21

5.tcpdump -X -n -p tcp dst port 80 //嗅探80端口数据,并解包 (加-t就不显示时间)

6.tcpdump -i eth0 host 202.96.128.68 //指定主机

7,//嗅探从172.16.1.2到172.16.1.1 或者172.16.1.13的数据包

tcpdump -i eth0 -tnn src 172.16.1.2 and dst \\(172.16.1.1 or 172.16.1.13 \\)

8,利用tcpdump统计各类数据包:

//统计1000个数据包中的ip连接量,并按从多到少的顺序排序，列出前3名

tcpdump -i ethp -tnn -c 1000 | awk -F "." "{print $1"."$2"."$3"."$4}' | sort | uniq -c |sort -nr | head -n 3//按从大到小的顺

序排序并列出并三名

tcpdump -i ethp -tnn -c 1000 | awk -F "." "{print $1"."$2"."$3"."$4}' | sort | uniq -c | awk '$1 > 100'//显示大于100数据包

sort:排序 -nr 从大到小 -rn　从小到大

uniq -c:过滤重复并在前面打印重复的行数

awk '$1 > 100':如果$1参数(数字)大于100

head -n 3:显示头3行

9,tcpdump -i eth0 -tnn host 192.168.1.100 and -p tcp or udp or icmp //嗅探所有 tcp,udp,icmp消息所不转换网络名称(加快速度)

10,嗅探dhcp服务器的ip(捕获非法DHCP Server):

tcpdump -i eth0 -tnn port 67

然后用dhclient eth0进行dhcp请求，捉dhcp server的ip地址

或者直接看日志啦cat /var/messages | grep "DHCPACK from"
