---
title: 查看每个网卡的流量情况
date: '2016-06-07'
description: '使用 sar 命令实时监控每个网卡的流量统计。'
category: linux
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---
使用 sar 命令查看网卡流量，每 2 秒采样一次，共采样 10 次：

```bash
sar -n DEV 2 10
```

参数说明：
- `-n DEV`：显示网络设备统计
- `2`：采样间隔（秒）
- `10`：采样次数
