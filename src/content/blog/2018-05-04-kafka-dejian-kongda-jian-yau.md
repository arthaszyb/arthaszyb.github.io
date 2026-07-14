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

- 三个节点分别监控，聚合监控配置：直接在 Prometheus 的 scrape_configs targets 中添加多个节点地址
- Grafana 的 Kafka 插件需单独添加至镜像
- 监控面板需继续完善
3.通过curl ip:7071/metrics可以获取到所有监控项，约有1w多个
4.在prometheus上配置这个监控项，启动prometheus
# my global config
global:
scrape_interval: 15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.
```bash
# scrape_timeout is set to the global default (10s).
# Alertmanager configuration
```
alerting:
alertmanagers:
- static_configs:
- targets:
```bash
# - alertmanager:9093
# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
```
rule_files:
```bash
# - "first_rules.yml"
# - "second_rules.yml"
# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
```
scrape_configs:
# The job name is added as a label to any timeseries scraped from this config.
- job_name: 'prometheus'
```bash
# metrics_path defaults to '/metrics'
# scheme defaults to 'http'.
```
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
- targets: ['10.165.23.149:7071','10.165.23.202:7071','10.165.23.204:7071']
5.在prometheus页面可以看到监控项状态为up即可。
6.grafana建立prometheus的数据源
7.grafana下载一个kafka的面板插件，方便建立面板，也可以完全自定义。面板内语法即时各监控项本身。
8.配置kafka自拉起任务。
```bash
#!/bin/bash
#yau
#restart kafka
cd /usr/local/app/kafka/bin
```
function stop()
{
echo "stop kafka"
PIDS=$(ps ax | grep -i 'kafka' | grep java | grep -v grep | awk '{print $1}')
if [ -z "$PIDS" ]; then
echo "No kafka server to stop"
else
kill -9 $PIDS
fi
}
function start()
{
echo "starting kafa"
KAFKA_OPTS="$KAFKA_OPTS -javaagent:../jmx_prometheus_javaagent-0.6.jar=7071:../kafka-0-8-2.yml" ./kafka-server-start.sh -daemon ../config/server.properties
}
function moni()
{
echo "moni kafka.."
if ! ps ax | grep -i 'kafka' | grep java | grep -v grep
&
>/dev
ull;then
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
&
&
start
;;
moni)
moni
;;
*)
echo "Usage: $name [start|stop|restart|moni]"
exit 1
;;
esac
遗留问题：三个节点分别监控，如何配置聚合监控？ ----已解决：直接在prometheus的配置上targets增加list元素
grafana的kafka插件是页面添加进去的，没有合并到镜像
prometheus临时在151.100上
监控面板还要继续丰富
