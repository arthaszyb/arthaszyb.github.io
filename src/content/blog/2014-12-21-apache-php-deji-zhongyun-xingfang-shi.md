---
title: Apache和PHP的几种运行方式
date: '2014-12-21'
description: Apache 和 PHP 的三种主要集成方式（CGI、Apache 模块、FastCGI）的工作原理、性能对比和适用场景。
category: web-infra
tags:
  - apache
  - nginx
  - php
draft: false
source: evernote-local-db
lang: zh
---

## PHP 请求处理流程

当用户访问 PHP 页面时，处理流程如下：

1. 用户在浏览器输入 URL 触发 PHP 请求，传送到 Web 服务器
2. Web 服务器接受请求，根据文件后缀判断为 PHP，从磁盘或内存取出应用程序
3. Web 服务器将程序转发给 PHP 引擎
4. PHP 引擎扫描文件、执行命令、读取处理数据，动态生成 HTML
5. PHP 引擎返回生成的 HTML 给 Web 服务器
6. Web 服务器将 HTML 返回给客户端

## Apache 请求处理的 11 个阶段

Post-Read-Request → URI Translation → Header Parsing → Access Control → Authentication → Authorization → MIME Type Checking → FixUp → Response → Logging → CleanUp

## LAMP 架构的集成关系

- **L（Linux）**：操作系统基础，相当于国家
- **A（Apache）**：Web 服务器，主席/领导角色，负责指导和分发
- **M（MySQL）**：数据库，数据存储场所，相当于银行
- **P（PHP）**：执行层，相当于具体干事的人

PHP 是 Apache 的一个外挂程序，必须依靠 Web 服务器才能运行。整个流程的优化就是减少从客户端请求到生成响应的时间。

## Apache 中 PHP 的三种运行方式

### 1. CGI 模式

**原理**：Web 服务器每次收到 PHP 请求都调用 `php.exe`（或 `php-cgi.exe`）进程去解释文件。

**配置**（Apache 2.0）：

```apache
ScriptAlias /php/ "c:/php/"
AddType application/x-httpd-php .php
# PHP 4
Action application/x-httpd-php "/php/php.exe"
# PHP 5
Action application/x-httpd-php "/php/php-cgi.exe"
```

**性能**：最慢。每次请求都要：调用 `php.exe` → 解析 `php.ini` → 加载 DLL → 初始化数据结构 → 执行 → 退出。

### 2. Apache 模块模式（mod_php）

**原理**：PHP 作为 Apache 的一个模块在 Web 服务器启动时被加载，与 Apache 运行在同一进程。

**配置**（Apache 2.0）：

```apache
# PHP 4
LoadModule php4_module "c:/php/php4apache2.dll"
AddType application/x-httpd-php .php

# PHP 5
LoadModule php5_module "c:/php/php5apache2.dll"
AddType application/x-httpd-php .php
PHPIniDir "C:/php"
```

**性能**：最快。PHP 在启动时被加载到内存，请求到达时直接执行，无需创建新进程。

**安全性**：Apache 默认方式。PHP 与 Apache 运行在同一进程，一个请求出问题会直接影响 Apache。

### 3. FastCGI 模式

**原理**：Web 服务器启动时加载 FastCGI 进程管理器，预先启动多个 PHP-CGI 进程。请求到达时，FastCGI 管理器选择一个空闲进程处理，处理完后进程保活继续等待下一个请求。

**配置**：

```apache
LoadModule fastcgi_module modules/mod_fastcgi-2.4.2-AP13.dll
ScriptAlias /fcgi-php5/ "d:/usr/local/php-5.0.4/"
FastCgiServer "d:/usr/local/php-5.0.4/php-cgi.exe" -processes 3

ScriptAlias /fcgi-php4/ "d:/usr/local/php-4.3.11/"
FastCgiServer "d:/usr/local/php-4.3.11/php.exe"

Listen 80
NameVirtualHost *:80

<VirtualHost *:80>
    DocumentRoot d:/www
    ServerName php5.localhost
    AddType application/x-httpd-fastphp5 .php
    Action application/x-httpd-fastphp5 "/fcgi-php5/php-cgi.exe"
</VirtualHost>

Listen 8080
NameVirtualHost *:8080

<VirtualHost *:8080>
    DocumentRoot d:/www
    ServerName php4.localhost
    AddType application/x-httpd-fastphp4 .php
    Action application/x-httpd-fastphp4 "/fcgi-php4/php.exe"
</VirtualHost>
```

访问 `http://localhost/` 使用 PHP5，`http://localhost:8080/` 使用 PHP4。

**性能对比**：
- 比 CGI 快得多（每个请求无需启动新进程）
- 有测试表明 FastCGI 约为 mod_php 性能的 63-80%
- 但提供更好的隔离和灵活性

**FastCGI 优点**：
- PHP 崩溃时不会影响 Apache（自动重启进程）
- 可以同时运行多个 PHP 版本
- 适合虚拟主机场景（隔离，防止恶意程序）
- 适合高并发场景

**FastCGI 缺点**：
- 开发调试时不适合（Zend Studio 调试会超时报 500 错误）
- Windows 平台有潜在安全问题

## Nginx 中 PHP 的运行方式

Nginx 默认不支持 CGI 模式，必须使用 FastCGI 方式。通常的组合：

- `nginx + spawn-fcgi`
- `nginx + PHP-FPM`（推荐，性能更优）

PHP-FPM 相比 spawn-fcgi 的优势：
- 作为 PHP 的补丁编译到 PHP core 中，性能优秀
- 处理高并发能力强，不会自动重启
- 更稳定、更灵活

由于 Nginx 的轻量级和灵活性，`nginx + PHP-FPM` 组合在高并发场景下性能可达 Apache + mod_php 的 5-10 倍。

## 运行方式总结对比

| 方式 | 性能 | 内存 | 安全性 | 适用 |
|------|------|------|--------|------|
| CGI | 最低 | 低 | 高 | 极少使用 |
| Apache 模块 | 最高 | 高 | 中 | 小型站点 |
| FastCGI | 中等 | 中 | 高 | 虚拟主机、高并发 |

**建议**：
- 自己的服务器，追求最高性能：Apache + mod_php
- 虚拟主机或高并发场景：Nginx + PHP-FPM 或 Apache + FastCGI
- 开发环境：Apache + mod_php（易于调试）
