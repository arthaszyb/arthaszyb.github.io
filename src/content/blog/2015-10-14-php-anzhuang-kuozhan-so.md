---
title: php安装扩展so
date: '2015-10-14'
description: >-
  不需要重新编译的方法 1.查询php模块路径 grep 'extension\dir' /usr/local/php/etc/php.ini
  将需要的so文件放到这个目录下,注意需要+x权限.
category: php
tags:
  - php
draft: false
source: evernote-local-db
lang: zh
---
不需要重新编译的方法

1.查询php模块路径

grep 'extension\_dir' /usr/local/php/etc/php.ini

![](/images/legacy/legacy-097e3534a7.png)

1. 将需要的so文件放到这个目录下,注意需要+x权限.

2. php.ini中加上extension=XXX.so

3. 重启php 如果必须root启动php,则/usr/local/php/sbin/php-fpm -R
