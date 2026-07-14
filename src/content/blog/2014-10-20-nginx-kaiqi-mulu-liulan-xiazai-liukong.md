---
title: nginx开启目录浏览、下载、流控、访问限制功能
date: '2014-10-20'
description: nginx 服务器目录浏览和文件下载的配置方法。包括开启目录浏览、设置文件大小显示单位、并发限制和下载速度限制、IP 访问控制等功能。
category: web-infra
tags:
  - nginx
draft: false
source: evernote-local-db
lang: zh
origin_url: http://michaelkang.blog.51cto.com/1553154/1136359
---

配置 nginx 服务器让用户能够浏览和下载目录中的文件，同时控制并发连接和下载速度。

## 完整配置示例

```nginx
limit_zone one $binary_remote_addr 32k;

server {
    listen 80;
    server_name dl.ptmind.com;
    access_log /usr/local/nginx/logs/dl.yourdomain.com.log access;

    location / {
        root /samba/pub/download;
        index index.html index.htm;
        
        autoindex on;
        autoindex_exact_size off;
        autoindex_localtime on;
        charset utf-8,gbk;
        
        limit_conn one 8;
        limit_rate 100k;
        
        allow 192.168.1.0/24;
        allow 172.17.0.0/16;
        deny all;
    }
}
```

## 关键配置说明

| 指令 | 说明 |
|------|------|
| `autoindex on;` | 开启目录浏览功能 |
| `autoindex_exact_size off;` | 文件大小用 KB/MB/GB 显示，而非字节 |
| `autoindex_localtime on;` | 显示文件修改时间为服务器本地时间 |
| `charset utf-8,gbk;` | 支持中文文件名显示 |
| `limit_conn one 8;` | 每个 IP 最多允许 8 个并发连接 |
| `limit_rate 100k;` | 单个连接最大下载速度 100KB/s |
| `allow/deny` | 配置 IP 段白名单 |

`limit_zone` 指令定义了一个限流区域，用 `$binary_remote_addr` 作为客户端标识。
