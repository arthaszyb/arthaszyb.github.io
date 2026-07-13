---
title: 快速部署 Prometheus 监控系统
date: '2018-02-28'
description: Prometheus 快速部署指南。以 Docker 容器方式部署 Prometheus Server、Node Exporter、cAdvisor、Grafana，涵盖配置、启动命令与验证步骤。
category: monitoring
tags:
  - docker
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---

## 架构与环境说明

监控两台 Docker Host（192.168.56.102 和 192.168.56.103），监控 host 和容器两个层次的数据。

### 所需组件

- **Prometheus Server**：中央监控系统，运行在 host 192.168.56.103
- **Node Exporter**：收集 host 硬件和操作系统数据，运行在所有 host
- **cAdvisor**：收集容器数据，运行在所有 host
- **Grafana**：可视化显示多维数据，运行在 host 192.168.56.103

## 部署步骤

### 1. 运行 Node Exporter

在两个 host 上执行（负责收集 host 监控数据）：

```bash
docker run -d -p 9100:9100 \
  -v "/proc:/host/proc" \
  -v "/sys:/host/sys" \
  -v "/:/rootfs" \
  --net=host \
  prom/node-exporter \
  --path.procfs /host/proc \
  --path.sysfs /host/sys \
  --collector.filesystem.ignored-mount-points "^/(sys|proc|dev|host|etc)($|/)"
```

验证：访问 `http://192.168.56.102:9100/metrics`

### 2. 运行 cAdvisor

在两个 host 上执行（负责收集容器监控数据）：

```bash
docker run \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:rw \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --publish=8080:8080 \
  --detach=true \
  --name=cadvisor \
  --net=host \
  google/cadvisor:latest
```

验证：访问 `http://192.168.56.102:8080/metrics`

### 3. 运行 Prometheus Server

在 host 192.168.56.103 上执行：

```bash
docker run -d -p 9090:9090 \
  -v /root/prometheus.yml:/etc/prometheus/prometheus.yml \
  --name prometheus \
  --net=host \
  prom/prometheus
```

#### 配置文件示例

`prometheus.yml` 关键配置：

```yaml
static_configs:
  - targets: 
    - 'localhost:9090'
    - 'localhost:8080'
    - 'localhost:9100'
    - '192.168.56.102:8080'
    - '192.168.56.102:9100'
```

说明：指定从哪些 exporter 抓取数据（两台 host 上的 Node Exporter 和 cAdvisor）。localhost:9090 是 Prometheus Server 自己。

验证：访问 `http://192.168.56.103:9090`，点击菜单 `Status -> Targets`，确认所有 Target 状态为 UP。

### 4. 运行 Grafana

在 host 192.168.56.103 上执行：

```bash
docker run -d -i -p 3000:3000 \
  -e "GF_SERVER_ROOT_URL=http://grafana.server.name" \
  -e "GF_SECURITY_ADMIN_PASSWORD=secret" \
  --net=host \
  grafana/grafana
```

参数说明：
- `-e "GF_SECURITY_ADMIN_PASSWORD=secret"`：指定 admin 密码

#### Grafana 配置

1. 访问 `http://192.168.56.103:3000/` 并登录
2. 配置 Data Source：
   - Name：prometheus
   - Type：Prometheus
   - Url：http://192.168.56.103:9090
3. 点击 Add

#### 使用现成 Dashboard

Grafana 本身的 Dashboard 配置复杂，可使用现成模板：

1. 访问 https://grafana.com/dashboards?dataSource=prometheus&search=docker
2. 下载"Docker and system monitoring"等模板（json 文件）
3. 在 Grafana 点击 `Dashboards -> Import` 导入 json 文件
4. Dashboard 立即展示监控数据（host 数据可通过 Node 切换，容器数据在下半部分）

## 网络说明

所有容器都使用 `--net=host`，使 Prometheus Server 能够直接与 Exporter 和 Grafana 通信。
