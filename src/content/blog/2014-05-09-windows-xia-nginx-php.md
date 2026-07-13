---
title: Windows 下 nginx + php 配置
date: '2014-05-09'
description: Windows 环境下 nginx 配置 PHP 的关键设置，启用 MySQL 相关扩展。
category: misc
tags:
  - nginx
  - php
draft: false
source: evernote-local-db
lang: zh
---

在 php.ini 配置文件中，需要取消注释以下行启用 PHP 扩展：

```ini
extension_dir = ext
extension=php_mysql
extension=php_mysqli
```
