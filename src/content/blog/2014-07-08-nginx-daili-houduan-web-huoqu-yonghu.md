---
title: nginx代理后端web获取用户真实IP
date: '2014-07-08'
description: nginx 反向代理场景下后端 web 服务器获取客户端真实 IP 的配置方法。通过 X-Real-IP 和 X-Forwarded-For 头传递真实 IP 信息。
category: web-infra
tags:
  - nginx
draft: false
source: evernote-local-db
lang: zh
---

在后台 nginx 服务器的日志中记录真实客户端 IP，需要配置 `log_format`：

```nginx
log_format main '$http_x_forwarded_for - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent"';
```

同时取消注释 `access_log` 指令。

在前端代理服务器上，需要在转发请求时添加真实 IP 信息头：

```nginx
server {
    listen 10.12.23.67;
    server_name filestore.tr.com;
    
    location / {
        proxy_set_header Host $host;
        proxy_pass http://myproject;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_redirect off;
    }
}
```

`X-Real-IP` 保存直接连接到代理的客户端地址，`X-Forwarded-For` 保存整条代理链的客户端地址列表。后端应用根据需要选择使用其中一个头的值。
