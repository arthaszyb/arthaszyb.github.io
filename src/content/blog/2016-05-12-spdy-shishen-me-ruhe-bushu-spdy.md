---
title: SPDY 是什么？如何部署 SPDY？
date: '2016-05-12'
description: "SPDY 是 Google 开发的应用层协议，通过多路复用、头压缩和服务器推送优化 HTTP 性能。本文介绍 SPDY 原理和 Apache mod_spdy 部署步骤。"
category: web-infra
tags:
  - nginx
  - apache
draft: false
source: evernote-local-db
lang: zh
origin_url: https://geekpark.net
---

## SPDY 简介

SPDY 是 Google 开发的基于 TCP 的应用层协议，旨在通过压缩、多路复用和优先级来缩短网页加载时间。SPDY 在 SSL 之上增加会话层实现，保持 HTTP GET/POST 消息格式不变，无需服务端应用修改。

## 相比 HTTP 的改进

**HTTP 的不足**：单路连接请求低效（每个 TCP 连接仅一个 HTTP 请求）；服务端无法主动推送；HTTP 头信息冗余。

**SPDY 的优点**：
- 多路复用：一个 TCP 连接承载多个并行请求，可设置优先级，避免关键资源被阻塞
- 服务器推送：支持预加载
- 头压缩：舍弃不必要的头信息
- 强制 SSL 加密

## Apache 部署 mod_spdy

**部署要求**：
- Apache 2.2 (≥2.2.4)
- mod_ssl 模块开启
- SPDY 运行在 HTTPS 上

**部署步骤**：

1. 下载对应系统的 mod_spdy 安装包

2. 安装模块

Debian/Ubuntu：
```bash
dpkg -i mod-spdy-*.deb
apt-get -f install
```

CentOS/Fedora：
```bash
yum install at
rpm -U mod-spdy-*.rpm
```

3. 重启 Apache

```bash
sudo /etc/init.d/apache2 restart
```

4. 验证部署

打开 Chrome 浏览器，前往 `chrome://net-internals/#spdy`，查看主机名称是否出现在标识栏中。未出现则检查服务器 error.log。

## 浏览器和服务器支持

**浏览器**：Chrome、Chromium、Firefox 13+、Amazon Silk 原生支持 SPDY。

**服务器**：Apache、Nginx、Netty、Jetty、Varnish、Erlang、Hightide、node.js 应用服务器均已宣布支持。
