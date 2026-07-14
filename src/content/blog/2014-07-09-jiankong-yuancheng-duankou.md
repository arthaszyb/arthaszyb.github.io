---
title: 监控远程端口
date: '2014-07-09'
description: "使用nc命令检测远程主机TCP或UDP端口是否可达，可配合&&和||判断连接是否成功，返回true或false。"
category: linux
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---

使用 `nc` 命令检测远程主机端口连接。

TCP 端口检测：

```bash
nc -w 1 127.0.0.1 53 && echo true || echo false
```

UDP 端口检测：

```bash
nc -w 1 -u 127.0.0.1 53 && echo true || echo false
```

参数说明：`-w` 指定超时时间（秒），`-u` 表示 UDP 协议。
