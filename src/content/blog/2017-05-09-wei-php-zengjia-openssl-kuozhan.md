---
title: 为PHP增加OpenSSL扩展
date: '2017-05-09'
description: 为已安装的 PHP 添加 OpenSSL 扩展，解决 APNS 推送等需要 SSL 支持的程序错误。
category: php
tags:
  - php
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.hutuseng.com/article/php-install-openssl-module
---

程序需要 OpenSSL 支持时，常见错误：

```
unable to connect to ssl://gateway.sandbox.push.apple.com:2195
(Unable to find the socket transport ssl - did you forget to enable it when you configured PHP?
```

## 检查是否已安装

查看 php 已编译的所有模块：

```bash
php -m | grep openssl
```

或通过 `phpinfo()` 函数查看。

## 安装步骤

1. 确定 PHP 版本

```bash
php -v
```

2. 下载对应版本源码

```bash
wget http://museum.php.net/php5/php-5.3.6.tar.gz
tar zxvf php-5.3.6.tar.gz
```

3. 编译 openssl 扩展

```bash
cd php-5.3.6/ext/openssl/
cp config0.m4 config.m4
/usr/local/php/bin/phpize
./configure --with-php-config=/usr/local/php/bin/php-config --with-openssl
make
make install
```

4. 在 php.ini 中添加扩展

```ini
extension_dir = "/usr/local/php/lib/php/extensions/no-debug-non-zts-20090626/"
extension = "openssl.so"
```

5. 重启 Apache

```bash
/usr/local/apache/bin/apachectl -k restart
```

参考：[为PHP添加PDO-mysql驱动](http://www.hutuseng.com/article/php-install-pdo-mysql-driver)
