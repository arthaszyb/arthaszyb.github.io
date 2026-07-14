---
title: Windows 7 虚拟 WiFi 热点配置
date: '2013-10-31'
description: Windows 7 虚拟 WiFi（SoftAP）功能配置指南，将电脑变身无线路由器实现网络共享。
category: misc
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
origin_url: https://blog.renren.com/
---

开启 Windows 7 的隐藏功能虚拟 WiFi 和 SoftAP（虚拟无线 AP），可将电脑变身无线路由器。

## 环境

笔记本或装有无线网卡的台式机，操作系统为 Windows 7。

## 配置步骤

### 1. 以管理员身份运行命令提示符

在搜索栏输入”cmd”，右键选择”以管理员身份运行”。

### 2. 启用虚拟 WiFi 网卡

运行命令：

```bash
netsh wlan set hostednetwork mode=allow ssid=wuminPC key=wuminWiFi
```

参数说明：
- `mode=allow`：启用虚拟 WiFi（`disallow` 为禁用）
- `ssid`：无线网络名称（如 wuminPC，可自定义）
- `key`：无线网密码（8 位以上，如 wuminWiFi，可自定义）

在网络连接窗口验证，应出现”Microsoft Virtual WiFi Miniport Adapter”网卡。

### 3. 设置 Internet 连接共享

在”网络连接”窗口中，右键单击已连接的网络连接 → “属性” → “共享”，勾选”允许其他······连接”并选择虚拟 WiFi 网卡。完成后，共享的网卡图标旁会显示”共享的”标志。
