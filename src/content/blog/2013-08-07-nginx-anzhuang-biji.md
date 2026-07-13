---
title: nginx安装笔记
date: '2013-08-07'
description: 解决 nginx 编译时 OpenSSL 配置错误导致的 make 失败问题。
category: web-infra
tags:
  - nginx
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
---

## 问题

nginx 编译时 OpenSSL 相关错误：

```text
[root@jowei nginx-0.8.9]# make
make -f objs/Makefile
make[1]: Entering directory `/jowei/nginx-0.8.9'
cd /usr/include/openssl/ && make clean && ./config --prefix=/usr/include/openssl//openssl no-shared no-threads && make && make install
make[2]: Entering directory `/usr/include/openssl'
make[2]: *** No rule to make target `clean'. Stop.
make[2]: Leaving directory `/usr/include/openssl'
make[1]: *** [/usr/include/openssl//openssl/include/openssl/ssl.h] Error 2
make[1]: Leaving directory `/jowei/nginx-0.8.9'
make: *** [build] Error 2
```

## 原因与解决

问题在于 nginx 编译参数 `--with-openssl` 指定的路径错误。该选项需要指向 **openssl 源代码目录**，而不是安装后的目录。

## 参数说明

- `--with-openssl`、`--with-zlib`、`--with-md5`、`--with-sha1`：都指定源代码目录，不是安装目录
- `--with-pcre`：同样指定 pcre 源代码目录。如果系统已安装 pcre 库（可找到 lib 和 include），此选项可省略

## 要点

编译 nginx 时，这些库的编译选项指定的是源代码路径，nginx 会在编译时把这些源代码编译进去，而不是链接已安装的库文件。
