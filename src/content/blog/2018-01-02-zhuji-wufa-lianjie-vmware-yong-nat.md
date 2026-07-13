---
title: VMware NAT 模式子机无法被主机连接的解决方案
date: '2018-01-02'
description: VMware NAT 模式网络连接故障排查。子机无法被主机访问的原因分析和解决方法，涉及虚拟网卡配置（vmnet1 vs vmnet8）。
category: container-virt
tags:
  - vmware
draft: false
source: evernote-local-db
lang: zh
---

## 问题现象

- 子机可以访问宿主机，但反向访问不通
- ping 不通子机
- 看到 vmnet1 网卡，网段与子机不同
- 改为相同网段后仍无法连接

## 问题原因

看到的 vmnet1 实际是 VMware 创建的**主机模式**下的虚拟网卡，不是 NAT 模式的网卡。

## 解决方案

进入 VMware 虚拟网络编辑器激活 NAT 模式网卡：

1. **打开虚拟网络编辑器**：VMware → 编辑 → 虚拟网络编辑器
2. **激活 NAT 模式**：如果主机状态为空，勾选下方的启用项
3. **验证网卡**：完成后应看到 vmnet8 网卡，此时可连接子机
