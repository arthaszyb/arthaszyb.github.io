---
title: Shadowsocks 搭梯子
date: '2018-03-08'
description: Shadowsocks 服务端一键安装脚本和客户端配置方法。
category: network
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

## 服务端部署

使用一键安装脚本：

```bash
wget --no-check-certificate https://raw.githubusercontent.com/teddysun/shadowsocks_install/master/shadowsocks-go.sh
bash shadowsocks-go.sh
```

脚本执行后自动安装并配置服务。编辑配置文件：

```bash
vi /etc/shadowsocks/config.json
```

## 客户端接入

1. 先测试服务端端口是否可达：

```bash
telnet <server_ip> <port>
```

2. 安装对应操作系统的 Shadowsocks 客户端
3. 配置服务器信息后启用系统代理
4. 浏览器配置代理即可

## 配置示例

`conf.json`：

```json
{
  "server": "0.0.0.0",
  "server_port": 8989,
  "local_port": 1080,
  "password": "anne0608young",
  "method": "aes-256-cfb",
  "timeout": 600
}
```

> 注：原文尾部内嵌了一份完整的 Teddysun `shadowsocks-go.sh` 安装脚本副本，因导入时字符级损坏且与上文「服务端部署」的一键脚本重复，已移除。安装脚本以上文 wget 下载的官方版本为准。
