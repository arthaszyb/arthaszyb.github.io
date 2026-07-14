---
title: Linux内核Socket参数调优
date: '2016-05-18'
description: '通过 sysctl 和 /proc 文件系统调优 TCP/IP 内核参数，包括缓冲区大小、连接管理、超时设置等，提升网络性能。'
category: linux
tags:
  - 网络排查
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

可调优的内核变量存在两种主要接口：sysctl命令和/proc文件系统，proc中与进程无关的所有信息都被移植到sysfs中。IPV4协议栈的sysctl参数主要是sysctl.net.core、sysctl.net.ipv4，对应的/proc文件系统是/proc/sys/net/ipv4和/proc/sys/net/core。只有内核在编译时包含了特定的属性，该参数才会出现在内核中。

对于内核参数应该谨慎调节，这些参数通常会影响到系统的整体性能。内核在启动时会根据系统的资源情况来初始化特定的变量，这种初始化的调节一般会满足通常的性能需求。

应用程序通过socket系统调用和远程主机进行通讯，每一个socket都有一个读写缓冲区。读缓冲区保存了远程主机发送过来的数据，如果缓冲区已满，则数据会被丢弃，写缓冲期保存了要发送到远程主机的数据，如果写缓冲区已慢，则系统的应用程序在写入数据时会阻塞。可知，缓冲区是有大小的。

**socket缓冲区默认大小**：

/proc/sys/net/core/rmem\_default 对应net.core.rmem\_default

/proc/sys/net/core/wmem\_default 对应net.core.wmem\_default

上面是各种类型socket的默认读写缓冲区大小，然而对于特定类型的socket则可以设置独立的值覆盖默认值大小。例如tcp类型的socket就可以用/proc/sys/net/ipv4/tcp\_rmem和tcp\_wmem来覆盖。

**socket缓冲区最大值：**

**/proc/sys/net/core/rmem\_max 对应net.core.rmem\_max**

**/proc/sys/net/core/wmem\_max 对应net.core.wmem\_max**

/proc/sys/net/core/netdev\_max\_backlog 对应 net.core.netdev\_max\_backlog

该参数定义了当接口收到包的速率大于内核处理包的速率时，设备的输入队列中的最大报文数。

/proc/sys/net/core/somaxconn 对应 net.core.somaxconn

通过listen系统调用可以指定的最大accept队列backlog，当排队的请求连接大于该值时，后续进来的请求连接会被丢弃。

/proc/sys/net/core/optmem\_max 对应 net.core.optmem\_max

每个socket的副缓冲区大小。

**TCP/IPV4内核参数：**

**在创建socket的时候会指定socke协议和地址类型。TCP socket缓冲区大小是他自己控制而不是由core内核缓冲区控制。**

**/proc/sys/net/ipv4/tcp\_rmem 对应net.ipv4.tcp\_rmem**

**/proc/sys/net/ipv4/tcp\_wmem 对应net.ipv4.tcp\_wmem**

**以上是TCP socket的读写缓冲区的设置，每一项里面都有三个值，第一个值是缓冲区最小值，中间值是缓冲区的默认值，最后一个是缓冲区的最大值，虽然缓冲区的值不受core缓冲区的值的限制，但是缓冲区的最大值仍旧受限于core的最大值。**

/proc/sys/net/ipv4/tcp\_mem

该内核参数也是包括三个值，用来定义内存管理的范围，第一个值的意思是当page数低于该值时，TCP并不认为他为内存压力，第二个值是进入内存的压力区域时所达到的页数，第三个值是所有TCP sockets所允许使用的最大page数，超过该值后，会丢弃后续报文。page是以页面为单位的，为系统中socket全局分配的内存容量。

socket的结构如下图：

![](/images/legacy/legacy-47fed7fe5f.png)

/proc/sys/net/ipv4/tcp\_window\_scaling 对应net.ipv4.tcp\_window\_scaling

管理TCP的窗口缩放特性，因为在tcp头部中声明接收缓冲区的长度为26位，因此窗口不能大于64K，如果大于64K，就要打开窗口缩放。

/proc/sys/net/ipv4/tcp\_sack 对应net.ipv4.tcp\_sack

管理TCP的选择性应答，允许接收端向发送端传递关于字节流中丢失的序列号，减少了段丢失时需要重传的段数目，当段丢失频繁时，sack是很有益的。

/proc/sys/net/ipv4/tcp\_dsack 对应net.ipv4.tcp\_dsack

是对sack的改进，能够检测不必要的重传。

/proc/sys/net/ipv4/tcp\_fack 对应net.ipv4.tcp\_fack

对sack协议加以完善，改进tcp的拥塞控制机制。

**TCP的连接管理：**

**/proc/sys/net/ipv4/tcp\_max\_syn\_backlog 对应net.ipv4.tcp\_max\_syn\_backlog**

**每一个连接请求(SYN报文)都需要排队，直至本地服务器接收，该变量就是控制每个端口的 TCP SYN队列长度的。如果连接请求多余该值，则请求会被丢弃。**

/proc/sys/net/ipv4/tcp\_syn\_retries 对应net.ipv4.tcp\_syn\_retries

控制内核向某个输入的SYN/ACK段重新发送相应的次数，低值可以更好的检测到远程主机的连接失败。可以修改为3

/proc/sys/net/ipv4/tcp\_retries1 对应net.ipv4.tcp\_retries1

该变量设置放弃回应一个tcp连接请求前，需要进行多少次重试。

/proc/sys/net/ipv4/tcp\_retries2 对应net.ipv4.tcp\_retries2

控制内核向已经建立连接的远程主机重新发送数据的次数，低值可以更早的检测到与远程主机失效的连接，因此服务器可以更快的释放该连接，可以修改为5

**TCP连接的保持：**

**/proc/sys/net/ipv4/tcp\_keepalive\_time 对应net.ipv4.tcp\_keepalive\_time**

**如果在该参数指定的秒数内连接始终处于空闲状态，则内核向客户端发起对该主机的探测**

/proc/sys/net/ipv4/tcp\_keepalive\_intvl 对应net.ipv4.tcp\_keepalive\_intvl

该参数以秒为单位，规定内核向远程主机发送探测指针的时间间隔

/proc/sys/net/ipv4/tcp\_keepalive\_probes 对应net.ipv4.tcp\_keepalive\_probes

该参数规定内核为了检测远程主机的存活而发送的探测指针的数量，如果探测指针的数量已经使用完毕仍旧没有得到客户端的响应，即断定客户端不可达，关闭与该客户端的连接，释放相关资源。

/proc/sys/net/ipv4/ip\_local\_port\_range 对应net.ipv4.ip\_local\_port\_range

规定了tcp/udp可用的本地端口的范围。

**TCP连接的回收：**

**/proc/sys/net/ipv4/tcp\_max\_tw\_buckets 对应net.ipv4.tcp\_max\_tw\_buckets**

**该参数设置系统的TIME\_WAIT的数量，如果超过默认值则会被立即清除。**

/proc/sys/net/ipv4/tcp\_tw\_reuse 对应net.ipv4.tcp\_tw\_reuse

该参数设置TIME\_WAIT重用，可以让处于TIME\_WAIT的连接用于新的tcp连接

/proc/sys/net/ipv4/tcp\_tw\_recycle 对应net.ipv4.tcp\_tw\_recycle

该参数设置tcp连接中TIME\_WAIT的快速回收。

/proc/sys/net/ipv4/tcp\_fin\_timeout 对应net.ipv4.tcp\_fin\_timeout

设置TIME\_WAIT2进入CLOSED的等待时间。

/proc/sys/net/ipv4/route/max\_size

内核所允许的最大路由数目。

/proc/sys/net/ipv4/ip\_forward

接口间转发报文

/proc/sys/net/ipv4/ip\_default\_ttl

报文可以经过的最大跳数

**虚拟内存参数：**

**/proc/sys/vm/**

**在linux kernel 2.6.25之前通过ulimit -n(setrlimit(RLIMIT\_NOFILE))设置每个进程的最大打开文件句柄数不能超过NR\_OPEN(1024\*1024),也就是100多w(除非重新编译内核)，而在25之后，内核导出了一个sys接口可以修改这个最大值/proc/sys/fs/nr\_open。shell里不能直接更改，是因为登录的时候pam已经从limits.conf中设置了上限，ulimit命令只能在低于上限的范围内发挥了。**

**Linux中查看socket状态：**

**cat /proc/net/sockstat #（这个是ipv4的）**

**sockets: used 137**

**TCP: inuse 49 orphan 0 tw 3272 alloc 52 mem 46**

**UDP: inuse 1 mem 0**

**RAW: inuse 0**

**FRAG: inuse 0 memory 0**

**说明：**

**sockets: used：已使用的所有协议套接字总量**

**TCP: inuse：正在使用（正在侦听）的TCP套接字数量。其值≤ netstat –lnt | grep ^tcp | wc –l**

**TCP: orphan：无主（不属于任何进程）的TCP连接数（无用、待销毁的TCP socket数）**

**TCP: tw：等待关闭的TCP连接数。其值等于netstat –ant | grep TIME\_WAIT | wc –l**

**TCP：alloc(allocated)：已分配（已建立、已申请到sk\_buff）的TCP套接字数量。其值等于netstat –ant | grep ^tcp | wc –l**

**TCP：mem：套接字缓冲区使用量（单位不详。用scp实测，速度在4803.9kB/s时：其值=11，netstat –ant 中相应的22端口的Recv-Q＝0，Send-Q≈400）**

**UDP：inuse：正在使用的UDP套接字数量**

**RAW：**

FRAG：使用的IP段数量
