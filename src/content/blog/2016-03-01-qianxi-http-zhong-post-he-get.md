---
title: HTTP 中 POST 和 GET 的区别
date: '2016-03-01'
description: "HTTP 协议中 POST 和 GET 方法的区别、数据传输方式、安全性及长度限制的对比，附 Python 实现示例。"
category: python
tags:
  - python
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.cnblogs.com/TankXiao/archive/2012/02/13/2342672.html
---

关于 HTTP 协议中 POST 和 GET 方法的整理笔记。

## HTTP 协议基础

HTTP 是应用层协议，允许从 Web 服务器传送超文本到客户端浏览器。HTTP 是无状态协议，由 Cookie 机制维护状态。通常基于 TCP 实现，有时基于 TLS/SSL 实现（即 HTTPS）。

## POST 和 GET 的区别

1. **语义**：GET 用于信息获取（安全、幂等），POST 用于修改服务器资源。

2. **数据位置**：GET 数据附在 URL 之后（以 `?` 分割，参数以 `&` 连接）；POST 数据放在 HTTP 包体中。空格转换为 `+`，中文等特殊字符进行 BASE64 编码。

3. **数据量**：GET 受 URL 长度限制（浏览器和服务器有具体限制，理论上无限制），POST 理论无限制但服务端通常会限制。GET 可提交数据量远小于 POST。

## Python 实现 POST/GET 响应

```python
#!/usr/bin/python
#coding=utf8
import sys
reload(sys)
sys.setdefaultencoding('utf-8')
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from os import curdir, sep
import cgi
import logging
import time

PORT_NUMBER = 8080
RES_FILE_DIR = "."

class myHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.path = "/index_example3.html"
        try:
            sendReply = False
            if self.path.endswith(".html"):
                mimetype = 'text/html'
                sendReply = True
            if self.path.endswith(".jpg"):
                mimetype = 'image/jpg'
                sendReply = True
            if self.path.endswith(".gif"):
                mimetype = 'image/gif'
                sendReply = True
            if self.path.endswith(".js"):
                mimetype = 'application/javascript'
                sendReply = True
            if self.path.endswith(".css"):
                mimetype = 'text/css'
                sendReply = True
            if sendReply == True:
                f = open(curdir + sep + self.path, 'rb')
                self.send_response(200)
                self.send_header('Content-type', mimetype)
                self.end_headers()
                self.wfile.write(f.read())
                f.close()
                return
        except IOError:
            self.send_error(404, 'File Not Found: %s' % self.path)

    def do_POST(self):
        logging.warning(self.headers)
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': self.headers['Content-Type']},
        )
        file_name = self.get_data_string()
        path_name = '%s/%s.log' % (RES_FILE_DIR, file_name)
        fwrite = open(path_name, 'a')
        fwrite.write("name=%s\n" % form.getvalue("name", ""))
        fwrite.write("addr=%s\n" % form.getvalue("addr", ""))
        fwrite.close()
        self.send_response(200)
        self.end_headers()
        self.wfile.write("Thanks for you post")

    def get_data_string(self):
        now = time.time()
        clock_now = time.localtime(now)
        cur_time = list(clock_now)
        date_string = "%d-%d-%d-%d-%d-%d" % (cur_time[0], cur_time[1], cur_time[2], cur_time[3], cur_time[4], cur_time[5])
        return date_string

try:
    server = HTTPServer(('', PORT_NUMBER), myHandler)
    print 'Started httpserver on port ', PORT_NUMBER
    server.serve_forever()
except KeyboardInterrupt:
    print '^C received, shutting down the web server'
    server.socket.close()
```

处理上传文件时，若要读取整个文件内容，使用 `form['userfile'].file` 而非 `getvalue()`：

```python
fileitem = form["userfile"]
if fileitem.file:
    linecount = 0
    while 1:
        line = fileitem.file.readline()
        if not line:
            break
        linecount = linecount + 1
```

## Python 实现 GET 请求

```python
#!/usr/bin/env python
#coding=utf8
import httplib

httpClient = None
try:
    httpClient = httplib.HTTPConnection('localhost', 8080, timeout=30)
    httpClient.request('GET', '/test0.html')
    response = httpClient.getresponse()
    print response.status
    print response.reason
    print response.read()
except Exception, e:
    print e
finally:
    if httpClient:
        httpClient.close()
```

## Python 实现 POST 请求

```python
#!/usr/bin/env python
#coding=utf8
import httplib, urllib

httpClient = None
try:
    params = urllib.urlencode({'name': 'Maximus', 'addr': 'GZ'})
    headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
    httpClient = httplib.HTTPConnection("localhost", 8080, timeout=30)
    httpClient.request("POST", "/test0.html", params, headers)
    response = httpClient.getresponse()
    print response.status
    print response.reason
    print response.read()
    print response.getheaders()
except Exception, e:
    print e
finally:
    if httpClient:
        httpClient.close()
```

## 参考资料

- http://www.cnblogs.com/TankXiao/archive/2012/02/13/2342672.html
- http://www.cnblogs.com/hyddd/archive/2009/03/31/1426026.html
- http://www.acmesystems.it/python_httpserver
- http://georgik.sinusgear.com/2011/01/07/how-to-dump-post-request-with-python/
- http://www.01happy.com/python-httplib-get-and-post/
