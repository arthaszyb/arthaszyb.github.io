---
title: php无法显示错误日志的问题
date: '2014-05-16'
description: >-
  修改: /usr/local/php/etc/php.ini 打开error log: logerrors = On
  errorreportting打开编译错误日志: errorreporting = EERROR | EPARSE
category: web-infra
tags:
  - php
draft: false
source: evernote-local-db
lang: zh
---
修改: /usr/local/php/etc/php.ini
1. 打开error log:
log_errors = On
2. error_reportting打开编译错误日志:
error_reporting = E_ERROR | E_PARSE
