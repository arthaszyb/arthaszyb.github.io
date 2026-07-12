---
title: "样例：Nginx 反向代理配置速查（图解与对照表，迁移测试样例）"
date: 2026-07-02
description: "手工撰写的迁移测试样例文章，用于验证 Astro 站点骨架的图片渲染与表格排版效果。"
category: web-infra
tags: [nginx, reverse-proxy, web-infra]
draft: false
lang: zh
---

> **说明**：本文是 Phase 1（Astro 站点骨架）阶段手工撰写的迁移测试样例，
> 用于验证图片渲染、表格排版（含横向滚动兜底）等功能点。Phase 2 内容
> 清洗迁移完成、验收通过后，本文件会被删除，不作为正式站点内容保留。

## 请求流向

一个最常见的双实例反向代理拓扑：客户端请求先落到 Nginx，再由 `upstream` 块分发到两台后端应用服务器。

![客户端经 Nginx 反向代理分发到两个上游应用服务器的示意图](/images/samples/nginx-flow-diagram.svg)

对应的配置片段大致如下（深色截图风格，用于验证图片在深色/浅色主题下都能正常显示，不依赖 CSS 反色滤镜）：

![nginx.conf 中 upstream 与 location 块的配置片段](/images/samples/nginx-config-screenshot.svg)

## 常用指令对照表

| 指令 | 作用域 | 说明 |
|---|---|---|
| `listen` | server | 监听端口，可加 `ssl`、`http2` 等参数 |
| `server_name` | server | 匹配请求的 `Host` 头 |
| `location` | server | 按路径匹配请求，决定转发目标 |
| `proxy_pass` | location | 转发到 upstream 或具体后端地址 |
| `proxy_set_header` | http/server/location | 透传或重写请求头，常用于传递真实客户端 IP |
| `upstream` | http | 定义一组后端服务器及负载均衡策略 |

## 负载均衡策略对照

| 策略 | 关键字 | 适用场景 |
|---|---|---|
| 轮询（默认） | 无需额外关键字 | 后端实例性能接近、无状态请求 |
| 加权轮询 | `weight=N` | 后端实例性能不均，按权重分配流量 |
| 最少连接 | `least_conn` | 请求处理时长差异较大 |
| IP Hash | `ip_hash` | 需要会话保持（同一客户端固定打到同一后端） |

## 一个更宽的对照表（用于验证横向滚动）

| 场景 | 超时相关指令 | 建议值 | 说明 | 常见坑 | 排查方式 |
|---|---|---|---|---|---|
| 后端响应慢 | `proxy_read_timeout` | 60s–300s，按业务调整 | 从 Nginx 向后端发起请求后，等待响应头的最长时间 | 设置过短导致长任务被提前掐断 | 结合后端日志核对实际处理耗时 |
| 客户端上传大文件 | `client_max_body_size` | 按业务上限设置，如 `50m` | 超过限制直接返回 `413` | 默认值 `1m` 很容易被忽略 | 查看 Nginx error log 中的 413 记录 |
| 长连接/推送场景 | `proxy_send_timeout` | 60s 起，视场景调整 | 向后端发送请求体的超时时间 | 与 `proxy_read_timeout` 混淆 | 抓包确认具体卡在发送还是等待阶段 |

## 小结

这份速查表覆盖了最常见的反向代理配置项、负载均衡策略选择，以及一个刻意加宽的对照表用来验证移动端下表格的横向滚动兜底是否生效。
