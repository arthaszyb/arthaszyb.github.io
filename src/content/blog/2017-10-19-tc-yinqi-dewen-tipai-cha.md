---
title: TC引起的问题排查
date: '2017-10-19'
description: >-
  2017年10月19日 17:59 错误 tc的状态检查： tc -s -d qdisc show dev eth1 关闭tc限制 tc qdisc del
  dev eth1 root
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
2017年10月19日

17:59

错误

![](/images/legacy/legacy-cbef8d7943.png)

tc的状态检查：

tc -s -d qdisc show dev eth1

![](/images/legacy/legacy-5e31f0bbdb.png)

关闭tc限制

tc qdisc del dev eth1 root
