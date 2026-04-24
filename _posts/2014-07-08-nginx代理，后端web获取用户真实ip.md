---
title: "nginx代理，后端web获取用户真实ip"
date: 2014-07-08 17:06:26 +0000
categories: ["Nginx [2]"]
tags: ["Pages"]
description: "Tuesday, July 8, 2014 5:06 PM 后台nginx服务器 log_format main '$http_x_forwarded_for - $remote_user [$time_local] \"$request\" ' '$status $body_bytes_sent \"$http_refer"
source: "evernote-local-db"
---

nginx代理，后端web获取用户真实ip
Tuesday, July 8, 2014
5:06 PM
后台nginx服务器

log_format main '$http_x_forwarded_for - $remote_user [$time_local] "$request" ' '$status $body_bytes_sent "$http_referer" ' '"$http_user_agent"';
取消注释access_log

前段代理服务器：
server {

listen 10.12.23.67;

server_name filestore.tr.com;

location /

{

proxy_set_header Host $host;

proxy_pass
http://myproject
;

proxy_set_header X-Real-IP $remote_addr;

proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

proxy_redirect off;
}
}

已使用 Microsoft OneNote 2016 创建。
