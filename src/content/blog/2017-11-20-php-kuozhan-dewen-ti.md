---
title: php扩展的问题
date: '2017-11-20'
description: >-
  2017年11月20日 14:50 一般添加扩展步骤：
  进入php源码目录（非程序目录哈，与程序版本一致）下的ext目录下的对应的扩展目录,如pgsql，执行phpize命令用于生成该目录下的configure文件，这个命令是要用程序目录的路径的，如/usr/local/app/php/bin/phpize
category: php
tags:
  - php
draft: false
source: evernote-local-db
lang: zh
---
2017年11月20日

14:50

一般添加扩展步骤：

1. 进入php源码目录（非程序目录哈，与程序版本一致）下的ext目录下的对应的扩展目录,如pgsql，执行phpize命令用于生成该目录下的configure文件，这个命令是要用程序目录的路径的，如/usr/local/app/php/bin/phpize

2. 继续在该目录下./configure \--with-php-config=/usr/local/app/php/bin/php-config \--with-pgsql=/usr/local/app/pcmgr\_enterprise/tools/pgsql

3. 执行Make 。会在该目录的module/下生成.so文件。这时cp到php的so目录中。就不用make install了。（我make install了，不知道会不会有其他问题。）

4. 到php.ini中添加扩展配置。完成。

注意：有可能你在完成以上步骤后php -m发现模块仍未加载，也没有任何报错信息，so文件也都存在。那么这个问题的原因其实是你的php.ini与系统默认的路径不一致引起的。php -c xxxx/php.ini -m就好了。其他相关php执行脚本都需要指定-c的配置路径。

Bin/php-config可以看php的一些配置，包括安装配置。
