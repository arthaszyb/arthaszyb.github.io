---
title: "$request_time & $upstream_response_time"
date: 2014-07-08 18:39:37 +0000
categories: ["Nginx [2]"]
tags: ["Pages"]
description: "$request_time & $upstream_response_time Tuesday, July 8, 2014 6:39 PM ||| $request_time| request processing time in seconds with a milliseconds resolution; time"
source: "evernote-local-db"
---

$request_time
&
$upstream_response_time
Tuesday, July 8, 2014
6:39 PM

|||
$request_time|

request processing time in seconds with a milliseconds resolution;

time elapsed between the first bytes were read from the client and

the log write after the last bytes were sent to the client

|
$request_time
指的就是从接受用户请求数据到发送完回复数据的时间。
|

http:/
ginx.org/en/docs/http
gx_http_upstream_module.html#variables

|||
$upstream_response_time|

keeps servers response times in seconds with a milliseconds

resolution. Several responses are also separated by commas and colons.

|
$upstream_response_time
说的有点模糊，它指的是从
Nginx
向后端建立连接开始

到接受完数据然后关闭连接为

止的时间。
||
因为会有重试，
||
它可能有多个时间

段。一般来说，
||$upstream_response_time

会比
||$request_time
时间短。
|

对于
HTTP POST
的请求，两者相差特别大。因为
Nginx
会把
HTTP request body
缓存

住，接受完毕后才会把数据一起发给后端。

On 2012/5/30 15:22,

燕子

wrote:

>

您

好：

>

最近在做
nginx
日志分析时发现
$request_time

>

和
$upstream_response_time

这两个时间值相差特别大，
nginx
里面配置了负载

>

均衡，后端服务器是
resin
，请问这两个时间点的具体含义是什么？相差很大的

>

原

因是什么？是
nginx
做了什么处理吗？

>

谢谢
~~~

已使用 Microsoft OneNote 2016 创建。
