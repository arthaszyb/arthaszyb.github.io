---
title: Windows+Apache2.x+PHP5.3+fcgid fastcgi运行配置
date: '2014-11-14'
description: Windows 环境下 Apache 和 PHP 以 FastCGI 方式运行的完整配置流程。mod_fcgid 是比 mod_fastcgi 更先进的 Apache 模块。
category: web-infra
tags:
  - apache
  - php
draft: false
source: evernote-local-db
lang: zh
---

## mod_fcgid 概述

mod_fcgid 是与 mod_fastcgi 二进制兼容的 Apache 模块，具有以下优势：

- **进程管理**：原来的 mod_fastcgi 可能会创建过多不必要的进程，mod_fcgid 使用共享内存精确控制进程数量
- **故障处理**：每个 fastcgi 进程使用不同的管道文件，通讯失败时能快速定位哪个进程出问题
- **兼容性**：二进制兼容，原 fastcgi 程序无需重新编译即可运行
- **PHP 支持**：直接支持 FastCGI 方式运行的 PHP，解决多线程模式下的不兼容问题

## 安装步骤

### 1. 下载和复制模块

从 http://www.apachelounge.com/download/ 下载 `mod_fcgid-2.3.5-win32-x86.zip`，将解压的 `mod_fcgid.so` 复制到 Apache 的 `modules` 目录。

### 2. 修改 httpd.conf

在文件末尾添加：

```apache
LoadModule fcgid_module modules/mod_fcgid.so

<IfModule mod_fcgid.c>
    AddHandler fcgid-script .fcgi .php
    
    # php.ini 的存放目录
    FcgidInitialEnv PHPRC "c:/xampp/php"
    
    # 设置 PHP_FCGI_MAX_REQUESTS >= FcgidMaxRequestsPerProcess
    # 防止 php-cgi 进程在处理完所有请求前退出
    FcgidInitialEnv PHP_FCGI_MAX_REQUESTS 1000
    
    # php-cgi 每个进程的最大请求数
    FcgidMaxRequestsPerProcess 1000
    
    # php-cgi 最大的进程数
    FcgidMaxProcesses 5
    
    # 最大执行时间（秒）
    FcgidIOTimeout 120
    FcgidIdleTimeout 120
    
    # php-cgi 的路径
    FcgidWrapper "c:/xampp/php/php-cgi.exe" .php
    AddType application/x-httpd-php .php
</IfModule>
```

### 3. 配置虚拟主机

```apache
<Directory "C:/www">
    Options FollowSymLinks ExecCGI
    Order allow,deny
    Allow from all
    AllowOverride All
</Directory>
```

### 4. 重启 Apache

```bash
apachectl restart
```

若安装正确，应该能看到 PHP 运行的输出。

## 配置说明

| 参数 | 说明 |
|------|------|
| FcgidInitialEnv PHPRC | PHP 配置文件目录 |
| FcgidMaxProcesses | PHP-CGI 进程池大小，应根据服务器内存调整 |
| FcgidIOTimeout | I/O 超时时间，调试时可调大 |
| FcgidIdleTimeout | 空闲进程超时时间 |
| FcgidMaxRequestsPerProcess | 每个进程最大请求数，达到后进程重启（防止内存泄露） |

## 优点

- PHP 出错时不会影响 Apache 本身
- FastCGI 模式性能比 ISAPI 模式更好
- 可以同时运行 PHP5 和 PHP4（通过不同虚拟主机配置）
- 在生产环境中表现稳定

## 缺点

- 不适合开发调试环境（Zend Studio 调试时会超时报 500 错误）
- Windows 环境下有潜在安全性问题
