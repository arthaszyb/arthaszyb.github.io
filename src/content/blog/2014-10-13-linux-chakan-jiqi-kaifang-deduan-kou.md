---
title: Linux查看机器开放的端口
date: '2014-10-13'
description: "使用nmap扫描机器开放的端口，了解自己服务器开放了哪些服务。nmap可跨平台使用，支持ping扫描、端口扫描、操作系统推断等功能。"
category: linux
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---

## nmap 简介

nmap 是跨平台的端口扫描工具，在 Linux、FreeBSD、UNIX、Windows 下都有可用版本。

主要功能：
- 测试一组主机是否在线
- 扫描主机端口，嗅探所提供的网络服务
- 推断主机所用的操作系统

## 常用命令

检查网段中活跃的主机：

```bash
nmap -sP 192.168.32.0/24
```

检查本地机器开放的端口：

```bash
nmap -sTU localhost
```

输出示例：

```text
Interesting ports on localhost.localdomain (127.0.0.1):
Not shown: 3156 closed ports

PORT     STATE SERVICE
25/tcp   open  smtp
53/tcp   open  domain
80/tcp   open  http
111/tcp  open  rpcbind
631/tcp  open  ipp
953/tcp  open  rndc
3306/tcp open  mysql
53/udp   open|filtered domain
```

## 扫描类型

- **SYN 扫描** `-sS`：半开放扫描，不打开完全的 TCP 连接，执行很快
  ```bash
  nmap -sS 192.168.32.0/24
  ```

- **TCP Connect 扫描** `-sT`：打开完全的 TCP 连接，是默认的 TCP 扫描
  ```bash
  nmap -sT 192.168.32.0/24
  ```

- **UDP 扫描** `-sU`：发送空的 UDP 报头到每个目标端口
  ```bash
  nmap -sU 192.168.32.0/24
  ```

根据实际需要，用防火墙来屏蔽不需要的端口访问。
