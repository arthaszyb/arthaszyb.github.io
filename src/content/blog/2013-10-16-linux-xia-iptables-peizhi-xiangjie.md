---
title: Linux iptables 配置详解
date: '2013-10-16'
description: iptables 防火墙的实操配置笔记，包括 filter 表、NAT 表的规则设置、端口开放、状态匹配等
category: linux
tags:
  - iptables
  - linux-admin
origin_url: http://www.cnblogs.com/JemBai/archive/2009/03/19/1416364.html
draft: false
source: evernote-local-db
lang: zh
---

## Filter 表防火墙配置

**1. 查看当前规则**

```bash
iptables -L -n
```

**2. 清除原有规则**

```bash
iptables -F
iptables -X
```

**3. 设定预设规则**

```bash
iptables -p INPUT DROP
iptables -p OUTPUT ACCEPT
iptables -p FORWARD DROP
```

INPUT 和 FORWARD 链默认 DROP，OUTPUT 链默认 ACCEPT（流入流出数据包分别按允许/禁止原则处理）。

**4. 添加 INPUT 链规则**

开启 SSH（22 端口）：

```bash
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A OUTPUT -p tcp --sport 22 -j ACCEPT
```

WEB 服务（80 端口）：

```bash
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A OUTPUT -p tcp --sport 80 -j ACCEPT
```

邮件服务（25、110 端口）：

```bash
iptables -A INPUT -p tcp --dport 25 -j ACCEPT
iptables -A INPUT -p tcp --dport 110 -j ACCEPT
```

FTP 服务（20、21 端口）：

```bash
iptables -A INPUT -p tcp --dport 20 -j ACCEPT
iptables -A INPUT -p tcp --dport 21 -j ACCEPT
```

DNS 服务（53 端口）：

```bash
iptables -A INPUT -p tcp --dport 53 -j ACCEPT
```

ICMP（ping）：

```bash
iptables -A INPUT -p icmp -j ACCEPT
iptables -A OUTPUT -p icmp -j ACCEPT
```

loopback：

```bash
iptables -A INPUT -i lo -p all -j ACCEPT
iptables -A OUTPUT -o lo -p all -j ACCEPT
```

**5. 添加 OUTPUT 链规则**

禁止不安全端口（31337-31340）：

```bash
iptables -A OUTPUT -p tcp --sport 31337 -j DROP
iptables -A OUTPUT -p tcp --dport 31337 -j DROP
```

其他应禁止端口：31335、27444、27665、20034（NetBus）、9704、137-139（SMB）、2049（NFS）

**6. 限制特定 IP 访问**

仅允许 192.168.0.3 的 SSH 连接：

```bash
iptables -A INPUT -s 192.168.0.3 -p tcp --dport 22 -j ACCEPT
```

允许 192.168.0.0/24 网段：

```bash
iptables -A INPUT -s 192.168.0.0/24 -p tcp --dport 22 -j ACCEPT
```

排除特定 IP（!192.168.0.3 表示除外）。

删除规则：

```bash
iptables -D INPUT -p tcp --dport 22 -j ACCEPT
```

**7. 添加 FORWARD 链规则**

转发已建立和相关连接：

```bash
iptables -A FORWARD -i eth0 -o eth1 -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i eth1 -o eth0 -j ACCEPT
```

丢弃非 SYN 的新连接（防异常 TCP 包）：

```bash
iptables -A FORWARD -p TCP ! --syn -m state --state NEW -j DROP
```

限制 IP 碎片（防攻击）：

```bash
iptables -A FORWARD -f -m limit --limit 100/s --limit-burst 100 -j ACCEPT
```

限制 ICMP 包（防 ping 泛洪）：

```bash
iptables -A FORWARD -p icmp -m limit --limit 1/s --limit-burst 10 -j ACCEPT
```

## NAT 表防火墙配置

**1. 查看 NAT 配置**

```bash
iptables -t nat -L
```

**2. 清除 NAT 规则**

```bash
iptables -F -t nat
iptables -X -t nat
iptables -Z -t nat
```

**3. 防止外网用内网 IP 欺骗**

```bash
iptables -t nat -A PREROUTING -i eth0 -s 10.0.0.0/8 -j DROP
iptables -t nat -A PREROUTING -i eth0 -s 172.16.0.0/12 -j DROP
iptables -t nat -A PREROUTING -i eth0 -s 192.168.0.0/16 -j DROP
```

**4. 禁止指定地址连接**

禁止与 211.101.46.253 的所有连接：

```bash
iptables -t nat -A PREROUTING -d 211.101.46.253 -j DROP
```

**5. 禁止指定端口**

禁用全局 FTP（21 端口）：

```bash
iptables -t nat -A PREROUTING -p tcp --dport 21 -j DROP
```

仅禁用 211.101.46.253 地址的 FTP：

```bash
iptables -t nat -A PREROUTING -p tcp --dport 21 -d 211.101.46.253 -j DROP
```

## 最终规则

状态追踪（drop 非法连接、允许已建立连接）：

```bash
iptables -A INPUT -m state --state INVALID -j DROP
iptables -A OUTPUT -m state --state INVALID -j DROP
iptables -A FORWARD -m state --state INVALID -j DROP
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
```

## 保存配置

```bash
/etc/rc.d/init.d/iptables save
service iptables restart
```
