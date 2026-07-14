---
title: Windows+nginx+php-cgi的多进程问题
date: '2015-10-30'
description: Windows 环境下 nginx+php-cgi 无法自动创建多进程的解决方案，手工配置多个 php-cgi 实例实现并行处理。
category: php
tags:
  - nginx
  - php
draft: false
source: evernote-local-db
lang: zh
origin_url: http://bbs.csdn.net/topics/390803643/close
---

## 问题

Windows 下 PHP_FCGI_CHILDREN 环境变量被忽略，php-cgi 无法自动 fork 子进程，导致只有一个 php-cgi 进程，多个 PHP 请求会串行处理。

## 解决方案

手工启动多个 php-cgi 实例，分别监听不同端口。

启动脚本（batch）：

```batch
start "fcgi服务" /MIN /D "%batDir%php" php-cgi.exe -b 127.0.0.1:9000 -c "%batDir%php/php.ini"
start "fcgi服务" /MIN /D "%batDir%php" php-cgi.exe -b 127.0.0.1:9001 -c "%batDir%php/php.ini"
start "fcgi服务" /MIN /D "%batDir%php" php-cgi.exe -b 127.0.0.1:9002 -c "%batDir%php/php.ini"
start "fcgi服务" /MIN /D "%batDir%php" php-cgi.exe -b 127.0.0.1:9003 -c "%batDir%php/php.ini"
start "nginx服务" /MIN /D "%batDir%nginx" nginx.exe
```

配置 nginx 上游负载均衡：

```nginx
http {
  upstream fastcgi_backend {
    server 127.0.0.1:9000;
    server 127.0.0.1:9001;
    server 127.0.0.1:9002;
    server 127.0.0.1:9003;
  }

  server {
    listen 80;
    server_name example.com;
    access_log log/access.log;
    root d:/web/www;

    location ~ \.php$ {
      fastcgi_pass fastcgi_backend;
    }
  }
}
```

启动多个 php-cgi 后可实现并行处理，但进程数受限（4 个进程需启动 4 个实例）。
