---
title: grep遇到 recursive directory loop的问题解决方法
date: '2014-10-24'
description: >-
  遇到无限循环错误的原因是因为含有符号连接,所以grep中需要排除符号连接,即-il eg: grep -R --include='\.sh'
  --include='\.conf' --include='\.py' --include='\.yaml' --include='\.php' -E
category: linux
tags:
  - php
draft: false
source: evernote-local-db
lang: zh
---
遇到无限循环错误的原因是因为含有符号连接,所以grep中需要排除符号连接,即-il

eg:

grep -R --include='\*.sh' --include='\*.conf' --include='\*.py' --include='\*.yaml' --include='\*.php' -E '172.24.6.71' /data1/resource/ -il| grep -vP '\[^:\]+:\\s\*#'
