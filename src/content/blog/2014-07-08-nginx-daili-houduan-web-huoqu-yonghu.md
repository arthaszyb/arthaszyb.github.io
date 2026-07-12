---
title: nginx代理，后端web获取用户真实ip
date: '2014-07-08'
description: >-
  后台nginx服务器 logformat main '$httpxforwardedfor - $remoteuser [$timelocal]
  "$request" ' '$status $bodybytessent "$httpreferer" ' '"$httpuseragent"';
category: web-infra
tags:
  - nginx
draft: false
source: evernote-local-db
lang: zh
---
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
