---
title: 安装 docker-ce 的问题
date: '2018-01-16'
description: 使用 yum 安装 docker-ce 时遇到的 HTTPS 证书验证问题及解决方案。
category: container-virt
tags:
  - docker
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
---

## 问题

使用 yum 安装 docker-ce 时出现 HTTPS 证书验证问题。

## 原因与解决

手动通过 `curl -Iv` 访问远程包库时发现访问正常，表明网络连接和证书本身没问题。对比 curl 使用的证书和 `/etc/yum.conf` 中配置的证书发现不一致。

## 解决方案

将 yum 配置中的证书改为 curl 所使用的证书，重新执行安装命令即可。

具体操作：
1. 查看 curl 使用的证书位置
2. 修改 `/etc/yum.conf` 中的 `sslcacert` 参数指向该证书路径
3. 重新执行 yum install 命令
