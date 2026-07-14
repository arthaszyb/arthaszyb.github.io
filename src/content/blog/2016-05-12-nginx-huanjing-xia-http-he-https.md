---
title: Nginx环境下http和https共存的方法
date: '2016-05-12'
description: >-
  配置 Nginx SSL 后 http 和 https 共存的问题。默认情况下配置不当会导致 http 请求返回 400 错误，解决方案是将 ssl 指令配置在监听端口上。
category: web-infra
tags:
  - nginx
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
---
给 nginx 配置 SSL 证书之后，https 可以正常访问，但 http 访问显示 400 错误。nginx 的配置如下：

```nginx
server {
    listen 80 default backlog=2048;
    listen 443;
    server_name linuxyan.com;
    root /var/www/html;
    ssl on;
    ssl_certificate /usr/local/Tengine/sslcrt/linuxyan.com.crt;
    ssl_certificate_key /usr/local/Tengine/sslcrt/linuxyan.com.key;
}
```

http 访问时报错如下：

```
400 Bad Request
The plain HTTP request was sent to HTTPS port.
Sorry for the inconvenience. Please report this message and include the following information to us. Thank you very much!
```
说是 http 的请求被发送到 https 的端口上去了。解决方法是把 `ssl on` 这行去掉，改为在 443 端口后面写 `ssl`：

```nginx
server {
    listen 80 default backlog=2048;
    listen 443 ssl;
    server_name linuxyan.com;
    root /var/www/html;
    ssl_certificate /usr/local/Tengine/sslcrt/linuxyan.com.crt;
    ssl_certificate_key /usr/local/Tengine/sslcrt/linuxyan.com.key;
}
```

这样 http 和 https 的链接都可以正常使用。
