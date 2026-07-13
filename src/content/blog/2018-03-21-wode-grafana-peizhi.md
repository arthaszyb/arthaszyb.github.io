---
title: 我的 Grafana 配置
date: '2018-03-21'
description: Grafana 多租户架构配置笔记。覆盖 Organization、User、Team 角色管理，InfluxDB 数据源配置（Proxy 模式），告警方式配置（Webhook/钩子）。
category: monitoring
tags:
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---

## 架构配置

Grafana 的多租户层级：`Organization` → `User` → `Team`（角色细分）

**关键特性**：

- 每个 Organization 完全独立隔离，相当于另一套独立环境
- 每个 Organization 需要独立配置数据源等一切
- 只有 admin 权限才能配置 Organization
- Team 是 Organization 内的角色细分

## 配置步骤

1. **配置用户**：创建用户并分配 Organization

2. **配置 InfluxDB 数据源**：
   - 使用 **Proxy 模式**（重要）
   - 如果需要用户名密码，先在 InfluxDB 中启用认证功能

3. **将 InfluxDB 数据作图**：基于配置的数据源创建 Dashboard

4. **配置告警**：
   - 先配置告警通知方式（短信、webhook 等）
   - 支持多种形式：邮件（需配置 SMTP）、Webhook（钩子）
   - Webhook 为直接调用指定 URL，仅支持 POST 和 PUT 方法
   - 注意：POST 请求如无 data 参数，则需配置无参数的 CGI 接口
