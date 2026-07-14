---
title: 设备VMnet0上的网络桥接当前未在运行
date: '2017-09-25'
description: VMware 虚拟网络桥接故障排查笔记。问题表现为设备 VMnet0 上的网络桥接未运行，虚拟机无法通信。解决方案是在虚拟网络编辑器中恢复默认设置。
category: python
tags:
  - vmware
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.imooc.com/qadetail/124137
---

## 问题

在 VMware 中收到错误提示：设备 VMnet0 上的网络桥接当前未在运行，虚拟机可能无法与主机或网络上的其他机器进行通信。虚拟设备 Ethernet0 将断开连接。

## 解决方案

在虚拟网络编辑器中恢复默认设置：

1. 打开 VMware 编辑菜单
2. 选择"虚拟网络编辑器"
3. 找到"恢复默认设置"按钮
4. 点击确认

恢复默认设置后网络桥接正常运行。
