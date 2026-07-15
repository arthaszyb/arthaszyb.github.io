---
title: 使用 Google Cloud Platform (GCP) 安装 SSR+BBR
date: '2017-12-28'
description: 在 GCP 上创建虚拟机实例并配置 SSR 和 BBR 加速的完整步骤。
category: network
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
origin_url: https://suiyuanjian.com/124.html
---

## 一、注册GCP

进入 https://cloud.google.com/free/ ，单击 **Try it Free**，接受条款——同意并继续。必须要有一张信用卡，并填入相关信息。

跳转后，如果你能看到页面顶部有一个"礼物"的小图标，或者说你收到了相应的邮件，说明试用金已到账。

## 二、创建实例

在左侧的菜单中找到 计算引擎 – VM 实例，通过"创建实例"或者单击加号来创建一个虚拟机：
- 名称：随意输入
- 地区：建议asia-east1-c
- 机器类型：小型（建议）/微型
- 启动磁盘单击更改 – Ubuntu 16.04 LTS
- 防火墙：允许HTTP流量，允许HTTPS流量

## 三、初步配置

左侧导航 – 计算 – 网络：
- 外部IP地址 – 选择一个ip – 类型调整为静态
- 防火墙规则 – 创建防火墙规则（未提及的全部默认）：流量方向入站、来源ip地址0.0.0.0/0、协议和端口全部允许
- 防火墙规则 – 创建防火墙规则（未提及的全部默认）：流量方向出站、来源ip地址0.0.0.0/0、协议和端口全部允许

（注意要创建两次防火墙规则，一次出站，一次入站）

## 四、配置SS以及BBR

进入实例控制台 – SSH – 在浏览器窗口中打开，获取root权限：

```bash
sudo su
```

安装SS（根据脚本提示来）：

```bash
wget -N --no-check-certificate https://raw.githubusercontent.com/91yun/shadowsocks_install/master/shadowsocksR.sh && bash shadowsocksR.sh
```

默认加密为：chacha20
默认协议为：auth_sha1_v4
默认混淆为：tls1.2_ticket_auth

安装BBR加速：

```bash
wget --no-check-certificate https://github.com/teddysun/across/raw/master/bbr.sh
chmod +x bbr.sh
./bbr.sh
```

重置VM实例，重复第一步和第二步，输入：

```bash
sysctl net.ipv4.tcp_available_congestion_control
```

若出现 `net.ipv4.tcp_available_congestion_control = bbr cubic reno` 类似含有bbr字样即成功。

第三第四步可以合并为一步，通过 ShadowsocksR+BBR加速一键安装包。

## 五、效果

## 六、问题及参考

创建步骤参考自：
- 如何免费打造一个安全稳定超高速的科学上网环境
- GOOGLE COMPUTE ENGINE(GCE)注册开VPS教程
- 拥有一架 Google 的小飞机是一种怎样的体验

SSR/SS相关问题：
- SSR一键脚本

BBR相关问题：
- 一键安装最新内核并开启BBR脚本
