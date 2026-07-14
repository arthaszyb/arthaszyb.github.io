---
title: nmap 扫描网段内的所有 IP
date: '2018-08-31'
description: "使用 nmap 扫描内网网段，发现所有在线主机 IP 地址。"
category: linux
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---

使用 nmap 发现网段内所有在线的 IP：

```bash
sudo nmap -sP -PI -PT 192.168.1.0/24
```

参数说明：
- `-sP`：ping 扫描，仅检测在线主机
- `-PI`：使用 ICMP 请求
- `-PT`：使用 TCP 请求
- `192.168.1.0/24`：扫描范围（子网掩码 /24 表示 192.168.1.1 - 192.168.1.254）
