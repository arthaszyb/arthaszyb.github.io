---
title: nginx出现413 Request Entity Too Large错误
date: '2014-10-09'
description: nginx 413 错误的原因和解决方法。通过修改 client_max_body_size 配置允许更大的请求体，同时需要与后端 PHP 配置保持一致。
category: web-infra
tags:
  - nginx
  - php
draft: false
source: evernote-local-db
lang: zh
---

## 问题

nginx 出现 413 Request Entity Too Large 错误，通常发生在文件上传场景。原因是请求体的大小超过了服务器限制。

## 解决方法

打开 nginx 主配置文件 `nginx.conf`（通常位于 `/usr/local/nginx/conf/`），在 `http {}` 块中添加或修改：

```nginx
client_max_body_size 2m;
```

然后重启 nginx：

```bash
sudo /etc/init.d/nginx reload
```

## 与 PHP 配置的协调

如果后端运行 PHP，还需要在 `php.ini` 中确保相关配置不小于 nginx 的设置：

```ini
post_max_size = 2M
upload_max_filesize = 2M
```

这样可以保证请求数据大小的限制在整个链路上保持一致，避免某个环节拒绝请求。

## 重启 nginx 的正确方法

```bash
kill -HUP `cat /usr/local/nginx/nginx.pid`
```

或使用：

```bash
/etc/init.d/nginx reload
```
