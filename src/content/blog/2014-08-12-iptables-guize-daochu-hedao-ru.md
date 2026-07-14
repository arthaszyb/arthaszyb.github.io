---
title: iptables规则导出和导入
date: '2014-08-12'
description: "使用iptables-save导出防火墙规则到文件，再用iptables-restore恢复。将恢复命令写入/etc/init.d/boot.local可实现重启后自动加载规则。"
category: linux
tags:
  - iptables
draft: false
source: evernote-local-db
lang: zh
---

## 导出规则

```bash
iptables-save > /root/iptables.save
```

## 恢复规则

```bash
iptables-restore /root/iptables.save
```

## 重启自动加载

编辑 `/etc/init.d/boot.local`，添加恢复命令：

```bash
iptables-restore /root/iptables.save
```

这样系统启动时会自动恢复之前保存的防火墙规则。
