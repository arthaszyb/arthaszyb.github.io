---
title: OpenVPN 搭建 VPN 环境
date: '2018-03-08'
description: OpenVPN 服务端和客户端的部署步骤，包括 RPM 安装、Web 管理界面配置、客户端接入。
category: network
tags:
  - vpn
draft: false
source: evernote-local-db
lang: zh
---

## 服务端配置

从 https://openvpn.net 获取 CentOS 对应的 RPM 包，执行安装。

```bash
rpm -Uvh openvpn-xxx.rpm
```

安装完成后，程序位于 `/usr/local/openvpn-as` 目录，Web 管理界面已自动启动。通过 netstat 可验证 443 端口监听。

设置 openvpn 用户密码（用于 Web 登录）：

```bash
passwd openvpn
```

使用 admin 身份登录 https://localhost:443 的管理站点，确认服务运行状态。

## 客户端接入

客户端通过 Web 界面以 connect 身份登录，使用服务端的账号密码。需下载对应操作系统的客户端（Windows 客户端集成在服务端，其他系统需从官网下载）。
