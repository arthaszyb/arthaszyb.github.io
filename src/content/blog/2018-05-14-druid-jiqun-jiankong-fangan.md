---
title: Druid 集群监控方案
date: '2018-05-14'
description: "Druid 集群监控使用 Prometheus + druid_exporter 方案。druid_exporter 是 Python 组件，采集 Druid 指标并暴露 HTTP 接口给 Prometheus。"
category: monitoring
tags:
  - druid
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---

使用 Prometheus + druid_exporter 进行 Druid 集群监控。

## 部署 druid_exporter

druid_exporter 是 Python 组件，仅支持 Python 3。安装后启动：

```bash
nohup /usr/local/app/imply/yau-tmp/python3/bin/python3 operations-software-druid_exporter-master/druid_exporter/exporter.py &
```

参考：https://github.com/wikimedia/operations-software-druid_exporter

启动后在 8000 端口提供 HTTP 服务。

## Druid 配置

在 `conf/druid/_common/common.runtime.properties` 中配置：

```properties
# Monitoring
druid.monitoring.monitors=["io.druid.java.util.metrics.JvmMonitor"]
druid.emitter=http
druid.emitter.http.recipientBaseUrl=http://hadoop-master:8000
```

重启 Druid 后生效。查看指标：

```bash
curl http://hadoop-master:8000/metrics
```

## 其他方案

官方推荐的另一个方案：druid-metrics-to-kafka，需要配合 Kafka。
