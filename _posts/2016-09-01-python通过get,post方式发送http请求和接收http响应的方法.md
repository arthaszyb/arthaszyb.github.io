---
title: "python通过get,post方式发送http请求和接收http响应的方法"
date: 2016-09-01 02:25:02 +0000
categories: ["python"]
tags: ["Pages"]
description: "2016 年 9 月 1 日 10:25 作者：无影 这篇文章主要介绍了python通过get,post方式发送http请求和接收http响应的方法,涉及Python使用urllib模块与urllib2模块实现get与post发送数据的相关技巧,需要的朋友可以参考下 本文实例讲述了python通过get,post方式发"
source: "evernote-local-db"
---

2016
年
9
月
1
日
10:25
python通过get,post方式发送http请求和接收http响应的方法
作者：无影
这篇文章主要介绍了python通过get,post方式发送http请求和接收http响应的方法,涉及Python使用urllib模块与urllib2模块实现get与post发送数据的相关技巧,需要的朋友可以参考下
本文实例讲述了python通过get,post方式发送http请求和接收http响应的方法。分享给大家供大家参考。具体如下：
测试用CGI,名字为test.py，放在apache的cgi-bin目录下:
#!/usr/bin/python

import cgi

def main():

print "Content-type: text/html\n"

form = cgi.FieldStorage()

if form.has_key("ServiceCode") and form["ServiceCode"].value != "":

print "
<
h1> Hello",form["ServiceCode"].value,"
<
/h1>"

else:

print "
<
h1> Error! Please enter first name.
<
/h1>"

main()
python发送post和get请求
get请求：
使用get方式时，请求数据直接放在url中。
方法一、
import urllib

import urllib2

url = "
http://192.168.81.16/cgi-bin/python_test/test.py?ServiceCode=aaaa
"

req = urllib2.Request(url)

print req

res_data = urllib2.urlopen(req)

res = res_data.read()

print res
方法二、
import httplib

url = "
http://192.168.81.16/cgi-bin/python_test/test.py?ServiceCode=aaaa
"

conn = httplib.HTTPConnection("192.168.81.16")

conn.request(method="GET",url=url)

response = conn.getresponse()

res= response.read()

print res
post请求：
使用post方式时，数据放在data或者body中，不能放在url中，放在url中将被忽略。
方法一、
import urllib

import urllib2

test_data = {'ServiceCode':'aaaa','b':'bbbbb'}

test_data_urlencode = urllib.urlencode(test_data)

requrl = "
http://192.168.81.16/cgi-bin/python_test/test.py
"

req = urllib2.Request(url = requrl,data =test_data_urlencode)

print req

res_data = urllib2.urlopen(req)

res = res_data.read()

print res
方法二、
import urllib

import httplib

test_data = {'ServiceCode':'aaaa','b':'bbbbb'}

test_data_urlencode = urllib.urlencode(test_data)

requrl = "
http://192.168.81.16/cgi-bin/python_test/test.py
"

headerdata = {"Host":"192.168.81.16"}

conn = httplib.HTTPConnection("192.168.81.16")

conn.request(method="POST",url=requrl,body=test_data_urlencode,headers = headerdata)

response = conn.getresponse()

res= response.read()

print res
对python中json的使用不清楚，所以临时使用了urllib.urlencode(test_data)方法;
模块urllib,urllib2,httplib的区别
httplib实现了http和https的客户端协议，但是在python中，模块urllib和urllib2对httplib进行了更上层的封装。
介绍下例子中用到的函数：
1、HTTPConnection函数
httplib.HTTPConnection(host[,port[,stict[,timeout]]])
这个是构造函数，表示一次与服务器之间的交互，即请求/响应
host 标识服务器主机(服务器IP或域名)
port 默认值是80
strict 模式是False，表示无法解析服务器返回的状态行时，是否抛出BadStatusLine异常
例如:
conn = httplib.HTTPConnection("192.168.81.16"，80) 与服务器建立链接。
2、HTTPConnection.request(method,url[,body[,header]])函数
这个是向服务器发送请求
method 请求的方式，一般是post或者get，
例如：
method="POST"或method="Get"
url 请求的资源，请求的资源(页面或者CGI,我们这里是CGI)
例如：
url="http://192.168.81.16/cgi-bin/python_test/test.py" 请求CGI
或者
url="http://192.168.81.16/python_test/test.html" 请求页面
body 需要提交到服务器的数据，可以用json，也可以用上面的格式，json需要调用json模块
headers 请求的http头headerdata = {"Host":"192.168.81.16"}
例如:
test_data = {'ServiceCode':'aaaa','b':'bbbbb'}

test_data_urlencode = urllib.urlencode(test_data)

requrl = "
http://192.168.81.16/cgi-bin/python_test/test.py
"

headerdata = {"Host":"192.168.81.16"}

conn = httplib.HTTPConnection("192.168.81.16"，80)

conn.request(method="POST",url=requrl,body=test_data_urlencode,headers = headerdata)
conn在使用完毕后，应该关闭，conn.close()
3、HTTPConnection.getresponse()函数
这个是获取http响应，返回的对象是HTTPResponse的实例。
4、HTTPResponse介绍：
HTTPResponse的属性如下：
read([amt]) 获取响应消息体，amt表示从响应流中读取指定字节的数据，没有指定时，将全部数据读出；
getheader(name[,default]) 获得响应的header，name是表示头域名，在没有头域名的时候，default用来指定返回值
getheaders() 以列表的形式获得header
例如：
date=response.getheader('date');

print date

resheader=''

resheader=response.getheaders();

print resheader
列形式的响应头部信息:
[('content-length', '295'), ('accept-ranges', 'bytes'), ('server', 'Apache'), ('last-modified', 'Sat, 31 Mar 2012 10:07:02 GMT'), ('connection', 'close'), ('etag', '"e8744-127-4bc871e4fdd80"'), ('date', 'Mon, 03 Sep 2012 10:01:47 GMT'), ('content-type', 'text/html')]

date=response.getheader('date');

print date
取出响应头部的date的值。
希望本文所述对大家的Python程序设计有所帮助。

来自

<
http://m.jb51.net/article/66763.htm
>

已使用 Microsoft OneNote 2016 创建。
