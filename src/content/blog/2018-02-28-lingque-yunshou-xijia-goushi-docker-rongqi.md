---
title: Docker容器的监控技术
date: '2018-02-28'
description: Docker 容器监控的核心理论与工具选型。覆盖黑盒/白盒监控、自主托管方案（CAdvisor+StatsD+InfluxDB+Grafana、Prometheus、Graphite）与 SaaS 方案（Datadog、Sysdig）对比。
category: monitoring
tags:
  - docker
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---

## 监控的必要性

在 Docker 容器技术飞速发展之时，监控容器的效率与健康成为了至关重要的需求。主要原因包括：

- 服务故障告警
- 负载决策（扩容/缩容）
- 特殊情况检测（如攻击）
- 问题根源分析

## 两种监控类型

**黑盒监控**：只观察服务的外部节点，查明它们是否像预期一样工作。

**白盒监监控**：在系统内部监控各个事件，获得更深入的洞察（如性能瓶颈）。从 Docker 角度，容器资源利用率是关键指标（CPU、磁盘、内存、网络）。

## 监控工具分类

### 1. 自主托管解决方案（Self-Hosted）

优点：设置成本低（如选用开源组件），一次性投入无须担心扩展成本。
缺点：需要持续设置和维护，工作量大，复杂度高。适合大型企业。

#### 推荐组合方案

**CAdvisor + StatsD + InfluxDB + Grafana**

- CAdvisor 和 StatsD：数据收集
- InfluxDB：时间序列数据库，专为时间序列设计，支持横向扩展、保留策略、REST API、CLI
- Grafana：流行的可视化工具，支持动态 dashboard、汇总和诊断功能，支持 Graphite、Elasticsearch、Prometheus、InfluxDB、OpenTSDB 等后端

#### Prometheus 方案

整体打包解决方案，无需挑选组件。

- Server：中央监控系统，配置监控目标和节点
- 数据收集：自定义方式（如从 Docker 容器获取），支持纯文本 metric endpoint
- 数据库：比 InfluxDB 更快更小，但不允许复杂查询
- 可视化：自有 dashboard + Grafana 集成

#### Graphite 方案

- 收集：CollectD/StatsD
- 缓存层：Carbon
- 存储：Whisper Database（基于保留策略）
- 可视化：Django Web APP + Grafana

### 2. SaaS 解决方案

优点：设置简单快速、丰富的集成度、无需操心扩展。
缺点：成本随扩展增加，指标数据流向第三方存在风险。

#### Datadog

云端监控解决方案，支持 agent 或 API 传输数据。Docker 支持在主机上安装 docker 化的 agent。优点：丰富集成（software stack、基础服务、build server）、交互式 dashboard、阈值警报、异常检测。

#### Sysdig

免费开源工具，配备内核模块。

- 有 CSysDig 控制台工具查看监控指标
- Sysdig cloud：注册后收集运行实例的指标
- 核心价值：主机级调试与监测能力

**选择建议**：主要收集主机监控指标时选择 Sysdig。

## 总结

根据企业规模和成本考虑选择方案：大型企业通常选自主托管以长期控制成本；初创团队可选 SaaS 快速上线。
