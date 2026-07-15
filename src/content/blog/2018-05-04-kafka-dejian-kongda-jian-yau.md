---
title: Kafka 监控搭建
date: '2018-05-04'
description: "Kafka 集群监控使用 Prometheus + Grafana + JMX 方案。通过 jmx_prometheus_javaagent 采集 Kafka JMX 指标，配置 Prometheus 和 Grafana 展示监控面板。"
category: monitoring
tags:
  - kafka
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---

Kafka 监控搭建方案：Prometheus + Grafana + JMX。

## 方案设计

采用 JMX 监控以获取完整的 Kafka 指标，而非 Kafka-specific exporter（如 KafkaOffsetMonitor、Burrow、kafka-monitor、Kafka-Manager），后者仅监控 topic 读写，不能提供集群整体监控信息（分片、延时、内存等）。

使用 `jmx_prometheus_javaagent-0.6.jar` + `kafka-0-8-2.yml`。

## 配置步骤

1. 将两个文件放到 Kafka 主目录下，修改 Kafka 启动方式使用 JVM agent

2. 启动命令：

```bash
KAFKA_OPTS="$KAFKA_OPTS -javaagent:../jmx_prometheus_javaagent-0.6.jar=7071:../kafka-0-8-2.yml" ./kafka-server-start.sh -daemon ../config/server.properties
```

3. 查看监控项：

```bash
curl http://ip:7071/metrics
```

约 1 万多个监控项。

4. Prometheus 配置（`prometheus.yml`）：

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: []

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'druid_exporter'
    static_configs:
      - targets: ['10.165.6.157:8000']

  - job_name: 'kafka_exporter'
    static_configs:
      - targets: ['10.165.23.149:9308']

  - job_name: 'kafka'
    static_configs:
      - targets: ['10.165.23.149:7071', '10.165.23.202:7071', '10.165.23.204:7071']
```

5. 在 Prometheus 页面验证各 job 状态为 `up`
6. 在 Grafana 中建立 Prometheus 数据源
7. 下载并配置 Kafka dashboard 插件
8. 配置 Kafka 自拉起脚本

## Kafka 自拉起脚本

```bash
#!/bin/bash
# Kafka restart script
cd /usr/local/app/kafka/bin

function stop() {
  echo "stop kafka"
  PIDS=$(ps ax | grep -i 'kafka' | grep java | grep -v grep | awk '{print $1}')
  if [ -z "$PIDS" ]; then
    echo "No kafka server to stop"
  else
    kill -9 $PIDS
  fi
}

function start() {
  echo "starting kafka"
  KAFKA_OPTS="$KAFKA_OPTS -javaagent:../jmx_prometheus_javaagent-0.6.jar=7071:../kafka-0-8-2.yml" ./kafka-server-start.sh -daemon ../config/server.properties
}

function moni() {
  echo "monitoring kafka.."
  if ! ps ax | grep -i 'kafka' | grep java | grep -v grep > /dev/null 2>&1; then
    start
  fi
}

case $1 in
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart)
    stop
    sleep 1
    start
    ;;
  moni)
    moni
    ;;
  *)
    echo "Usage: $0 [start|stop|restart|moni]"
    exit 1
    ;;
esac
```

## 遗留问题

- 三个节点分别监控，聚合监控配置：直接在 Prometheus 的 scrape_configs targets 中添加多个节点地址（已解决）
- Grafana 的 Kafka 插件需单独添加至镜像
- Prometheus 临时部署在 151.100 上
- 监控面板需继续完善
