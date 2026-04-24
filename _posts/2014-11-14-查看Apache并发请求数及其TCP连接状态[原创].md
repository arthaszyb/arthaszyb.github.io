---
title: "查看Apache并发请求数及其TCP连接状态[原创]"
date: 2014-11-14 15:16:28 +0000
categories: ["Apache"]
tags: []
description: "大 | 中 | 小 [ 2007-7-20 18:30 | by 张宴 ] [文章作者：张宴 本文版本：v1.1 最后修改：2007.07.27 转载请注明出处： http://blog.zyan.cc ] 这两天搭建了一组Apache服务器，每台服务器4G内存，采用的是prefork模式，一开始设置的连接数太少了，需"
source: "evernote-local-db"
---

查看Apache并发请求数及其TCP连接状态[原创]

大
|
中
|
小

[
2007-7-20 18:30 | by
张宴
]
[文章作者：张宴 本文版本：v1.1 最后修改：2007.07.27 转载请注明出处：
http://blog.zyan.cc
]
这两天搭建了一组Apache服务器，每台服务器4G内存，采用的是prefork模式，一开始设置的连接数太少了，需要较长的时间去响应用户的请求，后来修改了一下Apache 2.0.59的配置文件httpd.conf：
引用
# prefork MPM
# StartServers: number of server processes to start
# MinSpareServers: minimum number of server processes which are kept spare
# MaxSpareServers: maximum number of server processes which are kept spare
# MaxClients: maximum number of server processes allowed to start
# MaxRequestsPerChild: maximum number of requests a server process serves
StartServers 10
MinSpareServers 10
MaxSpareServers 15
ServerLimit 2000
MaxClients 2000
MaxRequestsPerChild 10000
查看httpd进程数（即prefork模式下Apache能够处理的并发请求数）：
Linux命令：
引用
ps -ef | grep httpd | wc -l
返回结果示例：
1388
表示Apache能够处理1388个并发请求，这个值Apache可根据负载情况自动调整，我这组服务器中每台的峰值曾达到过2002。
查看Apache的并发请求数及其TCP连接状态：
Linux命令：
引用
netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
（这条语句是从
新浪互动社区事业部技术总监王老大那儿获得的，非常不错）
返回结果示例：
LAST_ACK 5
SYN_RECV 30
ESTABLISHED 1597
FIN_WAIT1 51
FIN_WAIT2 504
TIME_WAIT 1057
其中的SYN_RECV表示正在等待处理的请求数；ESTABLISHED表示正常数据传输状态；TIME_WAIT表示处理完毕，等待超时结束的请求数。
关于TCP状态的变迁，可以从下图形象地看出：

状态：描述
CLOSED：无连接是活动的或正在进行
LISTEN：服务器在等待进入呼叫
SYN_RECV：一个连接请求已经到达，等待确认
SYN_SENT：应用已经开始，打开一个连接
ESTABLISHED：正常数据传输状态
FIN_WAIT1：应用说它已经完成
FIN_WAIT2：另一边已同意释放
ITMED_WAIT：等待所有分组死掉
CLOSING：两边同时尝试关闭
TIME_WAIT：另一边已初始化一个释放
LAST_ACK：等待所有分组死掉
