---
title: 'CS 抓包探测规则'
date: '2017-08-01'
description: >-
  使用 Wireshark 过滤规则进行 CS（某管家）命令字抓包分析；规则涵盖双向流量（源地址和目的地址均包含）；注意 CS 协议为了穿透网络设备采用 HTTP 头封装。
category: network
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---

## 抓包过滤规则

Wireshark 过滤规则（注意双向包）：

```bash
ip.dst == 111.30.135.186 or ip.dst == 123.151.176.26 or ip.dst == 123.151.71.34 or ip.dst == 219.133.60.246 or ip.dst == 183.3.235.42 or ip.src == 111.30.135.186 or ip.src == 123.151.176.26 or ip.src == 123.151.71.34 or ip.src == 219.133.60.246 or ip.src == 183.3.235.42
```
为啥cmd是http协议？因为首先wireshark本身是依据端口来判断http和tcp的；其次管家cs命令字tcp包中确实含有http头，目的是为了可以穿透一些网络设备，有一些网络只开放http协议，其他协议都不能用。

udp失败就会尝试tcp，所有命令字都是这样的。

检查udp是否成功可以通过检查流来看：

长连接抓包：
