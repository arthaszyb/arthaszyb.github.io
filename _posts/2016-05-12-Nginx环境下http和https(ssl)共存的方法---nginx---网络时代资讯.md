---
title: "Nginx环境下http和https(ssl)共存的方法 - nginx - 网络时代资讯"
date: 2016-05-12 00:11:18 +0000
categories: ["Apache"]
tags: []
description: "给nginx配置SSL证书之后，https可以正常访问，http访问显示400错误，nginx的配置如下： server { listen 80 default backlog= 2048 ; listen 443 ; server_name linuxyan.com; root /var/www/html; ssl "
source: "evernote-local-db"
---

给nginx配置SSL证书之后，https可以正常访问，http访问显示400错误，nginx的配置如下：
server { listen
80
default backlog=
2048
; listen
443
; server_name linuxyan.com; root /var/www/html; ssl on; ssl_certificate /usr/local/Tengine/sslcrt/linuxyan.com.crt; ssl_certificate_key /usr/local/Tengine/sslcrt/linuxyan.com.key; }
http访问的时候，报错如下：
400
Bad Request The plain HTTP requset was sent to HTTPS port. Sorry
for
the inconvenience. Please report this message
and
include the following information to us. Thank you very much!
说是http的请求被发送到https的端口上去了，所以才会出现这样的问题。
server { listen
80
default backlog=
2048
; listen
443
ssl; server_name linuxyan.com; root /var/www/html; ssl_certificate /usr/local/Tengine/sslcrt/linuxyan.com.crt; ssl_certificate_key /usr/local/Tengine/sslcrt/linuxyan.com.key; }
把ssl on；这行去掉，ssl写在443端口后面。这样http和https的链接都可以用，完美解决。
