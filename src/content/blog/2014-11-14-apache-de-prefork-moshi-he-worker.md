---
title: Apache的prefork模式和worker模式
date: '2014-11-14'
description: Apache 两种多路处理模块（MPM）的对比。prefork 模式以进程处理请求，worker 模式采用进程+线程混合方式，各有优劣。
category: web-infra
tags:
  - apache
  - php
draft: false
source: evernote-local-db
lang: zh
---

## Prefork 模式

这个多路处理模块（MPM）实现了一个非线程型的、预派生的 web 服务器，工作方式类似于 Apache 1.3。

**特点**：
- 适合没有线程安全库、需要避免线程兼容性问题的系统
- 适合要求每个请求相互独立的场景
- 一个请求出现问题不会影响其他请求

**配置管理**：
- 最重要的是将 `MaxClients` 设置为足够大的值以处理请求高峰
- 同时不能太大以至于超出物理内存容量
- 具有很强的自我调节能力，只需很少配置指令

```nginx
<IfModule mpm_prefork_module>
ServerLimit 256
StartServers 5
MinSpareServers 5
MaxSpareServers 10
MaxClients 256
MaxRequestsPerChild 0
</IfModule>
```

## Worker 模式

此多路处理模块（MPM）使 web 服务器支持混合的多线程多进程方式。

**特点**：
- 由于使用线程处理请求，可以处理海量请求
- 系统资源开销小于基于进程的 MPM
- 同时使用多进程和线程，结合两种方式的优势
- 每个进程有多个线程，获得基于进程 MPM 的稳定性

**关键配置**：
- `ThreadsPerChild`：每个子进程的线程数
- `MaxClients`：总线程数

```nginx
<IfModule mpm_worker_module>
StartServers 2
MaxClients 150
MinSpareThreads 25
MaxSpareThreads 75
ThreadsPerChild 25
MaxRequestsPerChild 0
</IfModule>
```

## 两种模式的比较

| 指标 | Prefork | Worker |
|------|---------|--------|
| 进程结构 | 多进程单线程 | 多进程多线程 |
| 效率 | 在大多数平台上更高 | 相对较低 |
| 内存占用 | 较大 | 较小 |
| 适用场景 | 兼容性、调试友好 | 高流量并发 |
| 优势 | 稳定、兼容第三方模块 | 资源消耗少、高并发 |
| 劣势 | 内存占用多 | 线程调试困难、某个线程崩溃会影响整个进程 |

**总体**：prefork 方式速度略高于 worker，但需要更多 CPU 和内存资源。

## 模式切换

1. 将当前 prefork 启动文件改名：
```bash
mv httpd httpd.prefork
```

2. 将 worker 启动文件改名：
```bash
mv httpd.worker httpd
```

3. 修改 Apache 配置文件 `/usr/local/apache2/conf/extra/httpd-mpm.conf`

4. 重新启动服务：
```bash
/usr/local/apache2/bin/apachectl restart
```

**建议**：出于稳定性和安全考虑，不建议更换 Apache 运行方式。很多 PHP 模块不能工作在 worker 模式下（例如许多 Linux 发行版自带的 PHP 不支持线程安全），所以最好保持系统默认的 prefork 模式。

## 配置详解

### Prefork 配置参数

- `ServerLimit`：MaxClients 最大为 256，超过此限需设置此参数，最大值为 20000
- `StartServers`：启动时创建的子进程数（默认 5）
- `MinSpareServers`：最小空闲子进程数（默认 5）
- `MaxSpareServers`：最大空闲子进程数（默认 10）
- `MaxClients`：最大并发请求数（默认 256）
- `MaxRequestsPerChild`：每个子进程的最大请求数（默认 10000，0 表示无限）

### Worker 配置参数

- `StartServers`：启动时创建的子进程数（默认 3）
- `MaxClients`：最大并发请求数，即最大总线程数（默认 400）
- `MinSpareThreads`：最小空闲线程数（默认 75）
- `MaxSpareThreads`：最大空闲线程数（默认 250）
- `ThreadsPerChild`：每个子进程的常驻线程数（默认 25）
- `MaxRequestsPerChild`：每个子进程的最大请求数（0 表示无限）

**注意**：ServerLimit 必须放在其他指令前面才能生效。如需设置更大的 MaxClients，必须同时增加 ServerLimit。
