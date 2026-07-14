---
title: TC引起的问题排查
date: '2017-10-19'
description: '使用 tc 命令排查和关闭流量控制限制。'
category: linux
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---
使用 tc（流量控制）命令排查网络问题。

## 查看 tc 状态

```bash
tc -s -d qdisc show dev eth1
```

## 关闭 tc 限制

```bash
tc qdisc del dev eth1 root
```
