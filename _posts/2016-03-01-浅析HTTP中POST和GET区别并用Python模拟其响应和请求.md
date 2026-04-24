---
title: "浅析HTTP中POST和GET区别并用Python模拟其响应和请求"
date: 2016-03-01 17:15:07 +0000
categories: ["python"]
tags: ["Pages"]
description: "Tuesday, March 1, 2016 5:15 PM 标签： python http 协议 http 服务器 post get 2014-09-25 20:05 2607 人阅读 评论 (0) 收藏 举报 分类： Python 版权声明：本文为博主原创文章，未经博主允许不得转载。 最近在几周在做手游崩溃信息收集"
source: "evernote-local-db"
---

浅析HTTP中POST和GET区别并用Python模拟其响应和请求
Tuesday, March 1, 2016
5:15 PM

浅析HTTP中POST和GET区别并用Python模拟其响应和请求
标签：

python
http
协议
http
服务器
post
get
2014-09-25 20:05 2607
人阅读

评论
(0)
收藏

举报
分类：

Python
版权声明：本文为博主原创文章，未经博主允许不得转载。
最近在几周在做手游崩溃信息收集和上传，拿到崩溃信息后，使用的是HTTP的POST方法上传到公司共用的服务器的，因此做简单总结。本文首先简单介绍了HTTP协议，主要说明了POST方法和GET方法的区别；然后用Python实现了 对POST方法和GET方法的响应；最后用Python模拟了POST方法和GET方法的请求。
HTTP
协议简介

HTTP
是
Hyper Text Transfer Protocol
（超文本传输协议）的缩写，简单来说它是一个应用层的协议，它允许将超文本标记语言
(HTML)
文档从
Web
服务器传送到客户端的浏览器。
HTTP
是一个无状态的协议，即同一个客户端的这次请求和上次请求是没有对应关系，对
http
服务器来说，它并不知道这两个请求来自同一个客户端，为了解决这个问题，
Web
程序引入了
Cookie
机制来维护状态。

HTTP
协议通常基于
TCP
协议来实现的，有时也基于于
TLS
或
SSL
协议（这个两个协议也是基于
TCP
协议来说实现）来实现，这个时候，就成了我们常说的
HTTPS
，每次
HTTP
操作都至少有下面几个过程：首先客户端与服务端建立连接；建立建立后，客户端按照协议格式发送请求；服务端接到请求后，同样按照某个格式返回响应数据；最后客户端与服务端断开连接。

通常我们打开一个网页，需要浏览器发送多次请求，因为一个网页中可能引用了其他文件，比如图片等文件，这时候浏览器会自动再次发送请求去获取图片等数据，直到网页上的数据被完全显示出来。
POST
和
GET
区别

HTTP
协议定义了很多与服务器交互的方法，最基本的有
4
种，分别是
GET,POST,PUT,DELETE.

一个
URL
地址用于描述一个网络上的资源，而
HTTP
中的
GET, POST, PUT, DELETE
就对应着对这个资源的查，改，增，删
4
个操作，其中最常见请求方式是
GET
和
POST
，并且现在浏览器一般只支持
GET
和
POST
方法。
GET
一般用于获取
/
查询资源信息，而
POST
一般用于更新资源信息，他们之间主要区别如下：

1
）根据
HTTP
规范，
GET
用于信息获取，而且应该是安全的和幂等的，这里安全是指该操作用于获取信息而非修改信息，幂等是指对同一
URL
的多个请求应该返回同样的结果（这一点在实质实现时，可能并不满足）；

POST
表示可能修改变服务器上的资源的请求。

2
）
GET
请求的数据会附在
URL
之后（就是把数据放置在
HTTP
协议头中），以
?
分割
URL
和传输数据，参数之间以
&
相连，如果数据是英文字母
/
数字，原样发送，如果是空格，转换为
+
，如果是中文
/
其他字符，

则直接把字符串用
BASE64
编码；
POST
把提交的数据则放置在是
HTTP
包的包体中。

3
）因为
GET
是通过
URL
提交数据，那么
GET
可提交的数据量就跟
URL
的长度有直接关系，理论上
URL
长度是没有限制的，即
HTTP
协议没有规定
URL
的长度，但在实质中，特定的浏览器可能对这个长度做了限制；理论上
POST
也是没有大小限制的，
HTTP
协议规范也没有进行大小限制，但在服务端通常会对这个大小做一个限制，当然这个限制比
GET
宽松的多，即使用
POST
可以提交的数据量比
GET
大得多。

最后，网上有人说，
POST
的安全性要比
GET
的安全性高，实质上
POST
跟
GET
都是明文传输，这可以通过类似
WireShark
工具看到。总之，
Get
是向服务器发索取数据的一种请求，而
Post
是向服务器提交数据的一种请求。

POST
和
GET
方法响应
Python
实现

下面代码实现对
POST
方法和
GET
方法的响应：

[python]

view plain

copy

#!/usr/bin/python

#coding=utf8

"""

import sys

reload(sys)

sys.setdefaultencoding('utf-8')

"""

from
BaseHTTPServer
import
BaseHTTPRequestHandler,HTTPServer
from
os
import
curdir, sep
import
cgi
import
logging
import
time

PORT_NUMBER = 8080
RES_FILE_DIR =
"."

class
myHandler(BaseHTTPRequestHandler):

def
do_GET(self):

if
self.path==
"/"
:
self.path=
"/index_example3.html"

try
:

#
根据请求的文件扩展名，设置正确的
mime
类型

sendReply = False

if
self.path.endswith(
".html"
):
mimetype=
'text/html'

sendReply = True

if
self.path.endswith(
".jpg"
):
mimetype=
'image/jpg'

sendReply = True

if
self.path.endswith(
".gif"
):
mimetype=
'image/gif'

sendReply = True

if
self.path.endswith(
".js"
):
mimetype=
'application/javascript'

sendReply = True

if
self.path.endswith(
".css"
):
mimetype=
'text/css'

sendReply = True

if
sendReply == True:

#
读取相应的静态资源文件，并发送它

f = open(curdir + sep + self.path,
'rb'
)
self.send_response(200)
self.send_header(
'Content-type'
,mimetype)
self.end_headers()
self.wfile.write(f.read())
f.close()

return

except
IOError:
self.send_error(404,
'File Not Found: %s'
% self.path)

def
do_POST(self):
logging.warning(self.headers)
form = cgi.FieldStorage(
fp=self.rfile,
headers=self.headers,
environ={
'REQUEST_METHOD'
:
'POST'
,

'CONTENT_TYPE'
:self.headers[
'Content-Type'
],
})

file_name = self.get_data_string()
path_name =
'%s/%s.log'
% (RES_FILE_DIR,file_name)
fwrite = open(path_name,
'a'
)

fwrite.write(
"name=%s\n"
% form.getvalue(
"name"
,""))
fwrite.write(
"addr=%s\n"
% form.getvalue(
"addr"
,""))
fwrite.close()

self.send_response(200)
self.end_headers()
self.wfile.write(
"Thanks for you post"
)

def
get_data_string(self):
now = time.time()
clock_now = time.localtime(now)
cur_time = list(clock_now)
date_string =
"%d-%d-%d-%d-%d-%d"
% (cur_time[0],
cur_time[1],cur_time[2],cur_time[3],cur_time[4],cur_time[5])

return
date_string
try
:
server = HTTPServer((
''
, PORT_NUMBER), myHandler)

print

'Started httpserver on port '
, PORT_NUMBER

server.serve_forever()

except
KeyboardInterrupt:

print

'^C received, shutting down the web server'

server.socket.close()
对于上面POST响应实现，值得一提的是，若客户端发送过来一个文件，则方法getvalue()会把整个文件内容读入内存，这可能不是我们想要的，这时可以使用form的属性file或filename，比如下面代码，计算上传代码的行数：
[python]

view plain

copy

fileitem = form[
"userfile"
]
if
fileitem.file:
linecount = 0

while
1:
line = fileitem.file.readline()

if

not
line:
break

linecount = linecount + 1
POST
和
GET
方法请求
Python
实现

下面代码实现了
GET
方法的请求：
[python]

view plain

copy

#!/usr/bin/env python

#coding=utf8

import
httplib

httpClient = None

try
:
httpClient = httplib.HTTPConnection(
'localhost'
, 8080, timeout=30)
httpClient.request(
'GET'
,
'/test0.html'
)

#response
是
HTTPResponse
对象

response = httpClient.getresponse()

print
response.status

print
response.reason

print
response.read()
except
Exception, e:

print
e
finally
:

if
httpClient:
httpClient.close()

下面代码实现了
POST
方法的请求：

[python]

view plain

copy

#!/usr/bin/env python

#coding=utf8

import
httplib, urllib

httpClient = None
try
:
params = urllib.urlencode({
'name'
:
'Maximus'
,
'addr'
:
"GZ"
})
headers = {
"Content-type"
:
"application/x-www-form-urlencoded"

,
"Accept"
:
"text/plain"
}

httpClient = httplib.HTTPConnection(
"localhost"
, 8080, timeout=30)
httpClient.request(
"POST"
,
"/test0.html"
, params, headers)

response = httpClient.getresponse()

print
response.status

print
response.reason

print
response.read()

print
response.getheaders()
#
获取头信息

except
Exception, e:

print
e
finally
:

if
httpClient:
httpClient.close()
参考资料

http://www.cnblogs.com/TankXiao/archive/2012/02/13/2342672.html

http://www.cnblogs.com/hyddd/archive/2009/03/31/1426026.html

http://www.acmesystems.it/python_httpserver

http://georgik.sinusgear.com/2011/01/07/how-to-dump-post-request-with-python/
http://www.01happy.com/python-httplib-get-and-post/

已使用 Microsoft OneNote 2016 创建。
