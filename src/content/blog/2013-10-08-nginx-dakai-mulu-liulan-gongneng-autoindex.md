---
title: Nginx打开目录浏览功能(autoindex)
date: '2013-10-08'
description: 在 nginx 配置中启用 autoindex 参数实现目录列表浏览，支持文件大小和修改时间的显示选项。
category: web-infra
tags:
  - nginx
draft: false
source: evernote-local-db
lang: zh
---

Nginx 默认不允许列出整个目录。在 nginx.conf 中，在 location、server 或 http 段加入以下配置：

## 基本配置

```nginx
autoindex on;
```

## 扩展参数

```nginx
autoindex_exact_size off;
```

- 默认为 on，显示文件的确切大小（单位：bytes）
- 改为 off 后，显示文件的大概大小（单位：KB、MB、GB）

```nginx
autoindex_localtime on;
```

- 默认为 off，显示文件时间为 GMT 时间
- 改为 on 后，显示文件的服务器本地时间

## 配置示例

```nginx
location /images {
  root /var/www/html;
  autoindex on;
  autoindex_exact_size off;
  autoindex_localtime on;
}
```
