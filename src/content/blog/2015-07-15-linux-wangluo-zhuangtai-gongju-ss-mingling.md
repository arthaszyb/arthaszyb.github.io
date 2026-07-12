---
title: Linux网络状态工具ss命令使用详解
date: '2015-07-15'
description: >-
  ss命令用于显示socket状态.  他可以显示PACKET sockets, TCP sockets, UDP sockets, DCCP
  sockets, RAW sockets, Unix domain sockets等等统计.  它比其他工具展示等多tcp和state信息.
category: linux
tags:
  - ssh
  - ftp
  - rsync
  - ssl-tls
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---
ss命令用于显示socket状态. 他可以显示PACKET sockets, TCP sockets, UDP sockets, DCCP sockets, RAW sockets, Unix domain sockets等等统计. 它比其他工具展示等多tcp和state信息. 它是一个非常实用、快速、有效的跟踪IP连接和sockets的新工具.SS命令可以提供如下信息：

- 所有的TCP sockets

- 所有的UDP sockets

- 所有ssh/ftp/ttp/https持久连接

- 所有连接到Xserver的本地进程

- 使用state（例如：connected, synchronized, SYN-RECV, SYN-SENT,TIME-WAIT）、地址、端口过滤

- 所有的state FIN-WAIT-1 tcpsocket连接以及更多

很多流行的[Linux](http://www.ttlsa.com/linux/)发行版都支持ss以及很多监控工具使用ss命令.熟悉这个工具有助于您更好的发现与解决系统性能问题.本人强烈建议使用ss命令替代netstat部分命令,例如netsat -ant/lnt等.

**展示他之前来做个对比,统计服务器并发连接数**

<table><tbody><tr><td><div><span><span>netstat</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span># time netstat -ant | grep EST | wc -l</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>3100</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>real 0m12.960s</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>user 0m0.334s</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>sys 0m12.561s</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span># time ss -o state established | wc -l</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>3204</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>real 0m0.030s</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>user 0m0.005s</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>sys 0m0.026s</span></span></div></td></tr></tbody></table>

结果很明显ss统计并发连接数效率完败netstat,在ss能搞定的情况下, 你还会在选择netstat吗, 还在犹豫吗, 看以下例子,或者跳转到帮助页面.

**常用ss命令：**

<table><tbody><tr><td><div><span><span>ss -l 显示本地打开的所有端口</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss -pl 显示每个进程具体打开的socket</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss -t -a 显示所有tcp socket</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss -u -a 显示所有的UDP Socekt</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss -o state established</span></span><span><span>'( dport = :smtp or sport = :smtp )'</span></span><span style="font-family: "Microsoft YaHei";"><span>显示所有已建立的</span></span><span><span>SMTP</span></span><span style="font-family: "Microsoft YaHei";"><span>连接</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss -o state established</span></span><span><span>'( dport = :http or sport = :http )'</span></span><span style="font-family: "Microsoft YaHei";"><span>显示所有已建立的</span></span><span><span>HTTP</span></span><span style="font-family: "Microsoft YaHei";"><span>连接</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss -x src /tmp/.X11-unix/* 找出所有连接X服务器的进程</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss -s 列出当前socket详细信息:</span></span></div></td></tr></tbody></table>

**显示sockets简要信息**

**列出当前已经连接，关闭，等待的tcp连接**

<table><tbody><tr><td><div><span><span># ss -s</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>Total: 3519 (kernel 3691)</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>TCP: 26557 (estab 3163, closed 23182, orphaned 194, synrecv 0, timewait 23182/0), ports 1452</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>Transport Total IP IPv6</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>* 3691 - -</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>RAW 2 2 0</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>UDP 10 7 3</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>TCP 3375 3368 7</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>INET 3387 3377 10</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>FRAG 0 0 0</span></span></div></td></tr></tbody></table>

**列出当前监听端口**

<table><tbody><tr><td><div><span><span># ss -l</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>Recv-Q Send-Q Local Address:Port Peer Address:Port</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 10 :::5989 :::*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 5 *:rsync</span></span><span><span>*:*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 128 :::sunrpc :::*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 128 *:sunrpc *:*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 511 *:http *:*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 128 :::ssh</span></span><span><span>:::*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 128 *:ssh</span></span><span><span>*:*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 128 :::35766 :::*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 128 127.0.0.1:ipp *:*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 128 ::1:ipp :::*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 100 ::1:smtp :::*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 100 127.0.0.1:smtp *:*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 511 *:https *:*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 100 :::1311 :::*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 5 *:5666 *:*</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>0 128 *:3044 *:*</span></span></div></td></tr></tbody></table>

**ss列出每个进程名及其监听的端口**

<table><tbody><tr><td><div><span><span># ss -pl</span></span></div></td></tr></tbody></table>

**ss列所有的tcp sockets**

<table><tbody><tr><td><div><span><span># ss -t -a</span></span></div></td></tr></tbody></table>

**ss列出所有udp sockets**

<table><tbody><tr><td><div><span><span># ss -u -a</span></span></div></td></tr></tbody></table>

**ss列出所有http连接中的连接**

<table><tbody><tr><td><div><span><span># ss -o state established '( dport = :http or sport = :http )'</span></span></div></td></tr></tbody></table>

·以上包含对外提供的80，以及访问外部的80

·用以上命令完美的替代netstat获取http并发连接数，监控中常用到

**ss列出本地哪个进程连接到x server**

<table><tbody><tr><td><div><span><span># ss -x src /tmp/.X11-unix/*</span></span></div></td></tr></tbody></table>

**ss列出处在FIN-WAIT-1状态的http、https连接**

<table><tbody><tr><td><div><span><span># ss -o state fin-wait-1 '( sport = :http or sport = :https )'</span></span></div></td></tr></tbody></table>

**ss常用的state状态**：

<table><tbody><tr><td><div><span><span>established</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>syn-sent</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>syn-recv</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>fin-wait-1</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>fin-wait-2</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>time-wait</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>closed</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>close-wait</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>last-ack</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>listen</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>closing</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>all : All of the above states</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>connected : All the states except</span></span><span><span>for</span></span><span><span>listen and closed</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>synchronized : All the connected states except</span></span><span><span>for</span></span><span><span>syn-sent</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>bucket : Show states,</span></span><span><span>which</span></span><span><span>are maintained as minisockets, i.e.</span></span><span><span>time-wait and syn-recv.</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>big : Opposite to bucket state.</span></span></div></td></tr></tbody></table>

**ss使用IP地址筛选**

<table><tbody><tr><td><div><span><span>ss src ADDRESS_PATTERN</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>src：表示来源</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ADDRESS_PATTERN：表示地址规则</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span style="font-family: "Microsoft YaHei";"><span>如下：</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss src 120.33.31.1</span></span><span><span>#</span></span><span style="font-family: "Microsoft YaHei";"><span>列出来之</span></span><span><span>20.33.31.1</span></span><span style="font-family: "Microsoft YaHei";"><span>的连接</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span style="font-family: "Microsoft YaHei";"><span>＃　列出来至120.33.31.1,80端口的连接</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss src 120.33.31.1:http</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss src 120.33.31.1:80</span></span></div></td></tr></tbody></table>

**ss使用端口筛选**

<table><tbody><tr><td><div><span><span>ss dport OP PORT</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>OP:是运算符</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>PORT：表示端口</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>dport：表示过滤目标端口、相反的有sport</span></span></div></td></tr></tbody></table>

OP运算符如下：

<table><tbody><tr><td><div><span><span><= or</span></span><span><span>le</span></span><span><span>:</span></span><span style="font-family: "Microsoft YaHei";"><span>小于等于</span></span><span><span>>= or</span></span><span><span>ge</span></span><span><span>:</span></span><span style="font-family: "Microsoft YaHei";"><span>大于等于</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>== or</span></span><span><span>eq</span></span><span><span>:</span></span><span style="font-family: "Microsoft YaHei";"><span>等于</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>!= or</span></span><span><span>ne</span></span><span><span>:</span></span><span style="font-family: "Microsoft YaHei";"><span>不等于端口</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>< or</span></span><span><span>lt</span></span><span><span>:</span></span><span style="font-family: "Microsoft YaHei";"><span>小于这个端口</span></span><span><span>> or</span></span><span><span>gt</span></span><span><span>:</span></span><span style="font-family: "Microsoft YaHei";"><span>大于端口</span></span></div></td></tr></tbody></table>

OP实例

<table><tbody><tr><td><div><span><span>ss sport = :http 也可以是 ss sport = :80</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss dport = :http</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss dport \> :1024</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss sport \> :1024</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss sport \< :32000</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss sport</span></span><span><span>eq</span></span><span><span>:22</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss dport != :22</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss state connected sport = :http</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss \( sport = :http or sport = :https \)</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>ss -o state fin-wait-1 \( sport = :http or sport = :https \) dst 192.168.1/24</span></span></div></td></tr></tbody></table>

为什么ss比netstat快：

netstat是遍历/proc下面每个PID目录，ss直接读/proc/net下面的统计信息。所以ss执行的时候消耗资源以及消耗的时间都比netstat少很多

**ss命令帮助**

<table><tbody><tr><td><div><span><span># ss -h</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>Usage: ss [ OPTIONS ]</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> ss [ OPTIONS ] [ FILTER ]</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -h, --help this message</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -V, --version output version information</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -n, --numeric don't resolve service names</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -r, --resolve resolve host names</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -a, --all display all sockets</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -l, --listening display listening sockets</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -o, --options show timer information</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -e, --extended show detailed socket information</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -m, --memory show socket memory usage</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -p, --processes show process using socket</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -i, --info show internal TCP information</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -s, --summary show socket usage summary</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -4, --ipv4 display only IP version 4 sockets</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -6, --ipv6 display only IP version 6 sockets</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -0, --packet display PACKET sockets</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -t, --tcp display only TCP sockets</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -u, --udp display only UDP sockets</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -d, --dccp display only DCCP sockets</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -w, --raw display only RAW sockets</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -x, --unix display only Unix domain sockets</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -f, --family=FAMILY display sockets of</span></span><span><span>type</span></span><span><span>FAMILY</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -A, --query=QUERY, --socket=QUERY</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> QUERY := {all|inet|tcp|udp|raw|unix|packet|netlink}[,QUERY]</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -D, --diag=FILE Dump raw information about TCP sockets to FILE</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> -F, --filter=FILE </span></span><span><span>read</span></span><span><span>filter information from FILE</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span> FILTER := [ state TCP-STATE ] [ EXPRESSION ]</span></span></div></td></tr></tbody></table>

参考：http://www.cyberciti.biz/tips/linux-investigate-sockets-network-connections.html
