---
title: nginx反向代理下载文件不完整的问题
date: '2015-07-13'
description: nginx 反向代理转发大文件时下载不完整的原因和解决方案。问题根源在于代理缓冲区满，导致下载中断。
category: web-infra
tags:
  - nginx
draft: false
source: evernote-local-db
lang: zh
---

## 问题现象

从制品库（通过 nginx 反向代理）下载安装包时，文件不完整，每次下载的大小不一样。

## 问题分析

### 第一步：排除后端服务问题
测试不经过 nginx 反向代理直接访问后端服务，文件完整。
**结论**：问题在 nginx 代理上。

### 第二步：分析代理日志
查看 nginx access log，发现关键错误提示：
```
an upstream response is buffered to a temporary file /usr/local/nginx/proxy_temp/0/05/0000000050 while reading upstream
```

此消息表明 nginx 在缓冲上游（后端）的响应到临时文件。

### 第三步：根因分析
**nginx 代理缓冲机制**：

1. nginx 接收来自后端服务器的数据
2. 边接收边缓存到本地临时缓冲区
3. 同时转发给客户端

**问题所在**：
- 大文件下载时，如果缓冲时间过长或缓冲区空间不足
- 可能导致缓冲区溢出或超时
- 结果是文件下载不完整或中断

## 解决方案

### 方案 1：临时重启 nginx（不彻底）
```bash
nginx -s reload
# 或
service nginx restart
```
重启后缓冲区清空，短期内下载正常，但问题仍会重复出现。

### 方案 2：关闭代理缓冲（推荐）

在 nginx 配置中添加：

```nginx
location / {
    proxy_buffering off;
    proxy_pass http://backend;
}
```

关闭缓冲后，nginx 接收到数据直接转发给客户端，不再缓存，可彻底解决问题。但此方案会增加 nginx 的连接占用。

### 方案 3：调整缓冲参数（精细控制）

```nginx
location / {
    proxy_buffering on;
    proxy_buffer_size 64k;
    proxy_buffers 8 64k;
    proxy_busy_buffers_size 256k;
    proxy_max_temp_file_size 512m;
    proxy_temp_file_write_size 256k;
    proxy_pass http://backend;
}
```

**参数说明**：
- `proxy_buffer_size`：单个缓冲区大小
- `proxy_buffers`：缓冲区个数和大小
- `proxy_busy_buffers_size`：正在写入客户端时的缓冲区大小
- `proxy_max_temp_file_size`：临时文件最大大小
- `proxy_temp_file_write_size`：一次写入临时文件的数据量

增大这些参数可以处理更大的文件，但会消耗更多内存和磁盘空间。

## 推荐方案

- **小文件传输**：使用方案 2（关闭缓冲）
- **大文件传输**：使用方案 3（调整参数）并根据实际文件大小设置
- **定期出现问题**：采用方案 2 或 3，避免方案 1 的临时修补
