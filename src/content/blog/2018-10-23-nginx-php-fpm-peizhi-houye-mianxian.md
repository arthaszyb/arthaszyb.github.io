---
title: nginx+php-fpm配置后页面空白的解决
date: '2018-10-23'
description: nginx 无法正确将 PHP 文件路径传递给 php-fpm 导致页面空白的问题，修改 fastcgi_params 配置解决。
category: php
tags:
  - nginx
  - php
draft: false
source: evernote-local-db
lang: zh
---

## 问题现象

Ubuntu 15.04 环境下，静态 .html 页面正常访问，但 .php 文件虽返回 200 状态码，页面却显示空白。

## 原因

nginx 无法正确将 .php 文件的地址传递给 php-fpm，导致 php-fpm 接收到的是错误的文件路径。

## 解决方案

修改 nginx 的 fastcgi_params 配置文件：

```bash
vi /etc/nginx/fastcgi_params
```

在文件末尾添加两行：

```nginx
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
fastcgi_param PATH_INFO $fastcgi_script_name;
```

然后重新加载配置：

```bash
service php5-fpm reload
service nginx reload
```
