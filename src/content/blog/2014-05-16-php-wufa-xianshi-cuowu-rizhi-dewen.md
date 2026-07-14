---
title: PHP无法显示错误日志的问题
date: '2014-05-16'
description: 修复 PHP 无法显示错误日志的配置。在 php.ini 中开启 log_errors 和 error_reporting 两项设置。
category: web-infra
tags:
  - php
draft: false
source: evernote-local-db
lang: zh
---

在 PHP 的 php.ini 配置文件中开启错误日志功能，需要修改以下两项设置：

```ini
log_errors = On
error_reporting = E_ERROR | E_PARSE
```

配置文件通常位于 `/usr/local/php/etc/php.ini`。修改后重启 Web 服务器使配置生效。第一项开启错误日志输出，第二项设置记录的错误级别为致命错误和语法错误。
