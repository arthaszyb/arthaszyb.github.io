---
title: linux开启nscd服务缓存加速
date: '2017-11-27'
description: "nscd 是 Linux 域名和服务缓存守护程序，可缓存 passwd、group、hosts 查询结果。介绍配置方法、常见参数及命令用法，以及缓存对 DNS 解析性能的提升效果。"
category: linux
tags:
  - linux-admin
  - dns
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.361way.com/linux-nscd-dns-cache/4265.html
---

nscd（Name Service Cache Daemon）在 Linux 系统中缓存三类服务的查询结果：passwd、group、hosts，每类维护两份缓存（成功和失败）。下面是配置和使用方法。

## 配置

编辑 `/etc/nscd.conf`，示例配置：

```ini
#logfile /var/log/nscd.log
threads 6
max-threads 128
server-user nscd
debug-level 5
paranoia no
enable-cache passwd no
enable-cache group no
enable-cache hosts yes
positive-time-to-live hosts 5
negative-time-to-live hosts 20
suggested-size hosts 211
check-files hosts yes
persistent hosts yes
shared hosts yes
max-db-size hosts 33554432
```

### 主要参数说明

- `logfile`：调试日志文件路径
- `debug-level`：调试级别
- `threads`：启动的请求处理线程数（最少 5 个）
- `server-user`：nscd 运行用户（默认 root）
- `enable-cache`：启用/禁用指定服务的缓存
- `positive-time-to-live`：成功查询的 TTL（秒），大值提升命中率但可能降低一致性
- `negative-time-to-live`：失败查询的 TTL（秒），通常保持较小值
- `suggested-size`：内部散列表大小（应为素数）
- `check-files`：是否检查源文件（/etc/passwd、/etc/group、/etc/hosts）的改动

## 服务查看和清除

RHEL/CentOS 默认关闭 nscd，通过 `service nscd start` 启动。缓存文件在 `/var/db/nscd` 目录。

查看统计信息：

```bash
nscd -g
```

清除缓存：

```bash
nscd -i passwd
nscd -i group
nscd -i hosts
```

或重启服务：

```bash
service nscd restart
```

## 性能提升

nscd 的效果取决于 DNS 服务器响应速度。在局域网压力测试中（DNS 服务器 202.106.0.20）：

- **无缓存**：nginx 静态页面 27 万次/分钟，PHP 页面 22 万次/分钟
- **加 nscd**：nginx 静态页面 120 万次/分钟（快 4 倍），PHP 页面 50 万次/分钟（快 2 倍）

在搜索引擎、代理、推送等高频 DNS 查询场景中收益明显。
