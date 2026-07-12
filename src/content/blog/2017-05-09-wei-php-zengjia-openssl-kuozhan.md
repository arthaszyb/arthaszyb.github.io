---
title: 为PHP增加OpenSSL扩展
date: '2017-05-09'
description: >-
  2017年5月9日 11:42 为PHP增加OpenSSL扩展 2014-05-26 23:32:26
  以前的php不带openssl模块，而这次的程序要使用苹果apple的apns推送服务，需要openssl的支持。 
  所以就给原来的php增加了openssl模块。
category: php
tags:
  - apache
  - mysql
  - php
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
---
2017年5月9日

11:42

**为PHP增加OpenSSL扩展**

2014-05-26 23:32:26

以前的php不带openssl模块，而这次的程序要使用苹果apple的apns推送服务，需要openssl的支持。 所以就给原来的php增加了openssl模块。

近日，将一个web程序上传到服务器，这个程序有一个苹果apns推送服务的模块，

结果在推送消息的时候出现如下的错误信息：

unable to connect to ssl://gateway.sandbox.push.apple.com:2195

(Unable to find the socket transport ssl -

did you forget to enable it when you configured PHP?

错误消息很明确了，说是程序不支持SSL，可能是php没有开启openssl扩展。

服务器是一台较老的服务器，centos系统，

1、首先看一下是不是php没有开启openssl扩展

有两种方式，一种是通过 phpinfo() 函数，看看是否有openssl模块

如果有openssl模块的话，通常会看到如下图所示的信息

![](/images/legacy/legacy-80e531ede7.jpg)

另外一种方式是，在服务器上直接通过php命令查看，php有个参数 -m ，就是显示php已经编译过的所有的模块，

\[hutuseng@web101 bin\]$ ./php -m|grep openssl

openssl

2、下载相应版本的php源码

首先，看看php是什么版本的，我们好去找相应版本的php源代码，当然如果你服务器上已经有源码了，就不用重新下载。下载之前，先确定一下php的版本，方法同上，可以通过phpinfo()查看，也可以通过 php -v命令查看

\[hutuseng@web101 bin\]$ ./php -v

PHP 5.3.6 (cli) (built: May 13 2011 02:06:43)

Copyright (c) 1997-2011 The PHP Group

Zend Engine v2.3.0, Copyright (c) 1998-2011 Zend Technologies

with eAccelerator v0.9.6.1, Copyright (c) 2004-2010 eAccelerator, by eAccelerator

确定了版本，就可以到网上下载相应版本的源码了

wget [http://museum.php.net/php5/php-5.3.6.tar.gz](http://museum.php.net/php5/php-5.3.6.tar.gz)

解压到某个目录中

tar zxvf php-5.3.6.tar.gz

3、重新把openssl扩展编译到php中

wget [http://museum.php.net/php5/php-5.3.6.tar.gz](http://museum.php.net/php5/php-5.3.6.tar.gz)

tar zxvf php-5.3.6.tar.gz

cd php-5.3.6

cd ext/

cd openssl/

cp config0.m4 config.m4

/usr/local/php/bin/phpize

./configure --with-php-config=/usr/local/php/bin/php-config --with-openssl

make

make install

vi /usr/local/php/lib/php.ini

在php.ini中增加 openssl.so的扩展

; Directory in which the loadable extensions (modules) reside.

; [http://php.net/extension-dir](http://php.net/extension-dir)

; extension\_dir = "./"

; On windows:

; extension\_dir = "ext"

extension\_dir = "/usr/local/php/lib/php/extensions/no-debug-non-zts-20090626/"

extension = "pdo\_mysql.so"

extension = "openssl.so"

重启apache服务

/usr/local/apache/bin/apachectl -k restart

PHP添加扩展的步骤都差不多，可以参考以前的一篇文章《[为PHP添加PDO-mysql驱动](http://www.hutuseng.com/article/php-install-pdo-mysql-driver)》

来自 <[http://www.hutuseng.com/article/php-install-openssl-module](http://www.hutuseng.com/article/php-install-openssl-module)\>
