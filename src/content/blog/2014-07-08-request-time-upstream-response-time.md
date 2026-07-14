---
title: $request_time & $upstream_response_time
date: '2014-07-08'
description: nginx 日志中两个重要时间变量的含义和区别。request_time 是从接收请求到发送完回复的总时间，upstream_response_time 是后端服务器的响应时间。
category: web-infra
tags:
  - nginx
draft: false
source: evernote-local-db
lang: zh
---

## $request_time

**定义**：从接收客户端数据的第一个字节到发送完所有响应数据并记录日志的时间间隔，单位为秒，精度到毫秒。

换句话说，这是从客户端请求到 nginx 完全处理并回复的总耗时。

## $upstream_response_time

**定义**：从 nginx 向后端建立连接开始到完全接收后端响应数据并关闭连接的时间间隔。由于可能存在重试，该值可能包含多个时间段用逗号或冒号分隔。

**通常规律**：`$upstream_response_time` < `$request_time`

## 两者相差大的原因

### HTTP POST 请求差异最明显

对于 POST 请求，两者相差特别大。原因是 nginx 会先完整地缓存 HTTP request body，等接收完毕后才会将数据一起转发给后端。这导致：

- `$request_time` 包含了客户端上传数据的时间
- `$upstream_response_time` 只计算后端处理时间

### 连接复用和重试

如果后端有重试或故障转移，`$upstream_response_time` 可能有多个记录值。同时 nginx 与客户端的连接保活也会延长 `$request_time`。

## 性能分析建议

- 如果 `$request_time` 远大于 `$upstream_response_time`，说明瓶颈在网络传输或 nginx 本身
- 如果两者接近，说明瓶颈在后端应用
- 对于上传场景，需要分离两个指标来分析问题根源
