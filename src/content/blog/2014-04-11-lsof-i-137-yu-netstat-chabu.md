---
title: 用 lsof 和 netstat 查看端口占用的进程
date: '2014-04-11'
description: 查看某个端口被哪个进程占用。netstat 有时查不出来，可用 lsof 替代或配合使用。
category: shell
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---

netstat 有时查不出端口占用的进程，可以用 lsof 来替代或验证。

用 netstat 查看：

```bash
# netstat -nap | grep 8080
tcp 0 0 0.0.0.0:8080 0.0.0.0:* LISTEN -
```

用 lsof 查看：

```bash
# lsof -i:8080
```

`lsof -i:8080` 找到对应进程号，即可定位占用该端口的进程。相比 netstat，lsof 通常能更可靠地显示进程信息。
