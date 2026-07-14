---
title: Zabbix Agent Active 主动模式配置
date: '2018-07-03'
description: "Zabbix Server 监控主机过多导致性能问题时，调整 Agent 为主动模式。配置 zabbix_agentd.conf 和修改监控模板以启用主动检查。"
category: monitoring
tags:
  - zabbix
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---

当 Zabbix Server 监控主机过多时，会出现性能问题：Web 界面卡、图表断裂、进程过多等。可通过调整 Agent 为主动模式解决。

## 主动模式流程

1. Agent 向 Server 建立 TCP 连接
2. Agent 请求检测数据列表
3. Server 响应并发送 Items 列表
4. Agent 响应，TCP 连接关闭
5. Agent 开始周期性收集数据

## 配置 zabbix_agentd.conf

编辑 `/etc/zabbix/zabbix_agentd.conf`：

```ini
StartAgents=0
ServerActive=172.16.100.84
Hostname=172.16.100.47
RefreshActiveChecks=120
BufferSize=200
Timeout=3
```

- `StartAgents=0`：关闭被动模式
- `ServerActive`：主动模式的 Server IP
- `Hostname`：客户端主机名
- `RefreshActiveChecks`：获取监控项的周期（秒）
- `BufferSize`：存储监控信息的缓冲大小
- `Timeout`：超时时间（秒）

主动模式 Agent 仅支持 `zabbix agent (active)` 类型的监控项。

## 调整监控模板

1. 克隆 `template os linux` 模板并修改名称
2. 进入模板列表，点击刚创建的模板，选择监控项
3. 全选监控项，点击最下方的批量更新
4. 选择类型为主动式，然后更新
5. 更新自动发现规则的监控项
6. 暂停不支持主动式的监控项

## 硬盘和网卡监控配置

若主动监控模式下未出现硬盘和网卡：

1. 点击模板 → 主动监控模板 → 自动发现规则
2. 点击监控项原型，逐个修改为主动式监控
3. Web 界面会自动应用更新
