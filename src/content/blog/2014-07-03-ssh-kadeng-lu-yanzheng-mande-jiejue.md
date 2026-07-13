---
title: SSH 卡登陆，验证慢的解决方法
date: '2014-07-03'
description: SSH 连接验证缓慢的根本原因是 sshd_config 中 GSSAPIAuthentication 参数导致的 DNS PTR 反向解析卡住；改为 no 即可解决。
category: linux
tags:
  - ssh
draft: false
source: evernote-local-db
origin_url: http://www.weiyan.me/
lang: zh
---

## 问题现象

SSH 连接速度慢，输入 `ssh xxx.xxx.xxx.xxx` 后，要经过很长时间的无响应过程才能连接。

## 根本原因

SSH 的配置文件 `sshd_config` 中有一个参数：

```bash
GSSAPIAuthentication yes
```

官方说明（翻译）：
> 是否允许用户基于 GSSAPI 的验证。默认是 'yes'。此选项仅适用于 SSH-2 协议版本。

**实际含义**：这个 GSSAPI 认证在用户登录时，客户端要对服务器端的 IP 地址进行反向解析。如果服务器的 IP 地址没有配置 PTR 记录（反向 DNS），那么解析会被卡住，等待很长一段时间后才能继续连接。

## 解决方案

将参数改为 `no`：

```bash
GSSAPIAuthentication no
```

修改 `/etc/ssh/sshd_config` 文件后重启 SSH 服务，连接速度即可恢复正常。

## 备注

很多时候大家在使用 SSH 工具连接某个服务器时，如果遇到卡在验证阶段，基本上都是在这个配置上卡住了。改了即可。
