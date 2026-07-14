---
title: Linux iptables NAT 透明代理教程
date: '2014-07-09'
description: “用iptables实现NAT端口映射和透明代理，通过PREROUTING做目标地址转换，POSTROUTING实现源地址伪装，配合ip_forward启用路由转发，可将外网端口映射到内网服务器。”
category: linux
tags:
  - iptables
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.yimiju.com/articles/508.html
---

## 应用场景

在具备外网和内网访问条件的接口服务器上部署 iptables 端口映射，将外网端口转发到内网服务器。

假设：
- 接口服务器的内网 IP：192.168.1.2，外网 IP：8.8.8.8
- 内网服务器 IP：192.168.1.3，端口：1234

## 核心命令

DNAT（目标地址转换）：

```bash
iptables -t nat -I PREROUTING -p tcp --dport 1234 -j DNAT --to 192.168.1.3:1234
```

MASQUERADE（源地址伪装，实现透明代理）：

```bash
iptables -t nat -I POSTROUTING -p tcp --dport 1234 -j MASQUERADE
```

查看 nat 表：

```bash
iptables -t nat -L
```

删除 nat 表配置：

```bash
iptables -t nat -F
```

启用 Linux 路由转发：

```bash
echo 1 > /proc/sys/net/ipv4/ip_forward
```

## 持久化配置

iptables 设置在服务器重启后失效，需要写入 `/etc/rc.local`。示例 rc.local：

```bash
#!/bin/sh
#
# rc.local
#

iptables -t nat -I PREROUTING -p tcp --dport 1234 -j DNAT --to 192.168.1.3:1234
iptables -t nat -I POSTROUTING -p tcp --dport 1234 -j MASQUERADE

iptables -t nat -I PREROUTING -p tcp --dport 5678 -j DNAT --to 192.168.1.4:5678
iptables -t nat -I POSTROUTING -p tcp --dport 2222 -j MASQUERADE

iptables -t nat -I PREROUTING -p tcp --dport 80 -j DNAT --to 192.168.1.5:80
iptables -t nat -I POSTROUTING -p tcp --dport 80 -j MASQUERADE

echo 1 > /proc/sys/net/ipv4/ip_forward

exit 0
```
