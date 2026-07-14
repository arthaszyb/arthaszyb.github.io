---
title: nmap 端口扫描技术
date: '2014-10-29'
description: 整理自 nmap 官方文档的端口扫描类型速查笔记，汇总各 -s 系列扫描选项的用途与适用场景，附常用命令示例。
category: linux
tags:
  - 网络排查
  - nmap
draft: false
source: evernote-local-db
lang: zh
origin_url: http://nmap.org/man/zh/man-port-scanning-techniques.html
---

nmap 官方文档中「端口扫描技术」一节的整理笔记。nmap 支持约十几种扫描类型，一般一次只用一种，其中 UDP 扫描（`-sU`）可与任意一种 TCP 扫描组合使用。扫描类型选项格式为 `-s<C>`，`<C>` 通常是该类型的首字母。多数扫描类型需要 root/administrator 权限（因为要收发原始报文）；非特权用户只能执行 connect() 和 FTP bounce 扫描。

## 扫描类型速查

- **`-sS`（TCP SYN 扫描）**：默认且最常用。只发 SYN 不完成连接（半开放），快速且相对隐蔽，可明确区分 open / closed / filtered，不依赖特定平台。
- **`-sT`（TCP connect() 扫描）**：SYN 扫描不可用时（无原始报文权限或 IPv6）的默认方式。通过操作系统的 connect() 系统调用建立完整连接，速度较慢、更易被目标记录。
- **`-sU`（UDP 扫描）**：检测 UDP 服务（DNS 53、SNMP 161/162、DHCP 67/68 最常见）。发空 UDP 报头：ICMP 端口不可到达（类型 3 代码 3）= closed，其他 ICMP 不可到达 = filtered，收到 UDP 响应 = open，无响应 = open|filtered。因 ICMP 限速（Linux 默认 1 条/秒）扫描很慢，可配合 `--host-timeout` 等加速。
- **`-sN` / `-sF` / `-sX`（Null / FIN / Xmas 扫描）**：利用 RFC 793——关闭端口对不含 SYN/RST/ACK 的报文回 RST，开放端口无响应。能躲过部分无状态防火墙，但不适用于一律回 RST 的系统（Windows、部分 Cisco 设备、BSDI、IBM OS/400）。
- **`-sA`（TCP ACK 扫描）**：用于探测防火墙规则（有状态/无状态、哪些端口被过滤），不能判定 open。
- **`-sW`（TCP 窗口扫描）**：类似 ACK 扫描，额外用返回 RST 报文的 TCP 窗口值区分 open/closed（依赖特定系统实现，不总可靠）。
- **`-sM`（Maimon 扫描）**：探测报文为 FIN/ACK，利用部分 BSD 系统对开放端口丢弃该探测的特性。
- **`--scanflags`（定制 TCP 扫描）**：自由指定 URG/ACK/PSH/RST/SYN/FIN 任意组合，可搭配基本扫描类型决定响应的解释方式。
- **`-sI`（Idle 扫描）**：借助 zombie 主机的 IP 分段 ID 序列做盲扫描，真实 IP 不向目标发包，隐蔽性极高，可探测基于 IP 的信任关系。
- **`-sO`（IP 协议扫描）**：遍历 IP 协议号，确定目标支持哪些协议（TCP/ICMP/IGMP 等）。
- **`-b`（FTP 弹跳扫描）**：利用 FTP 代理连接特性（RFC 959）借第三方 FTP 服务器扫描目标，多数服务器已修复；参数格式 `<username>:<password>@<server>:<port>`。

> 各类型的报文细节、ICMP 代码含义与平台差异较多，完整说明见 origin_url 指向的官方文档。

## 常用命令示例

```bash
# UDP 扫描
nmap -p $port1,$port2 -sU $ip

# TCP connect() 扫描
nmap -p $port -sT $ip

# SYN 扫描
nmap -p $port -sS $ip
```
