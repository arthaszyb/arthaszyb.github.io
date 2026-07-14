---
title: 修改Apache最大连接数和MySQL并发数
date: '2015-01-29'
description: Apache 和 MySQL 连接数的优化配置。根据服务器硬件资源（CPU、内存、带宽）调整最大连接数参数，防止资源耗尽。
category: web-infra
tags:
  - apache
  - mysql
draft: false
source: evernote-local-db
lang: zh
---

## Apache 最大连接数优化

### 第一步：查看 Apache 运行模式

```bash
httpd -l
```

输出示例：
```
Compiled in modules:
core.c
prefork.c
http_core.c
mod_so.c
```

此例运行模式为 prefork。

### 第二步：修改 httpd-mpm.conf

打开 `/usr/local/apache2/conf/extra/httpd-mpm.conf`（位置可能不同，用 find 查询）

**原始默认配置**：

```ini
StartServers 5
MinSpareServers 5
MaxSpareServers 10
MaxClients 150
MaxRequestsPerChild 0
```

**参数说明**：

- `StartServers`：启动时建立的子进程数
- `MinSpareServers`：最小空闲进程数。不足时 Apache 最多每秒创建一个新进程
- `MaxSpareServers`：最大空闲进程数。超过时父进程杀死多余进程
- `MaxClients`：最大并发连接数限制。超过此数的请求进入等候队列
- `MaxRequestsPerChild`：每个子进程最大请求数。达到后进程重启（防止内存泄露）
- `ServerLimit`：MaxClients 上限值（默认 256）。超过需设置此参数，最大 20000

### 第三步：计算最优并发数

**计算当前 httpd 占用内存**：

```bash
ps aux | grep httpd | wc -l

# 计算平均内存占用
ps aux | grep -v grep | awk '/httpd/{sum += $6;n++};END{print sum/n}'
```

**设置策略**：
- 留出系统基础资源（如 500MB）
- 假设 httpd 平均占用 20-30MB
- 公式：`最大连接数 = (总内存 - 系统占用) / 单进程占用内存`

**示例**（2GB 内存）：
```
(2000MB - 500MB) / 30MB ≈ 50 个连接
但不应该设这么低，建议保守估计 8000 左右
```

### 第四步：修改配置文件

根据计算结果修改 `/usr/local/apache2/conf/extra/httpd-mpm.conf`：

```ini
StartServers 5
MinSpareServers 5
MaxSpareServers 10
ServerLimit 5500
MaxClients 5000
MaxRequestsPerChild 100
```

**关键点**：
- `ServerLimit` 必须放在 `MaxClients` 前
- `ServerLimit` 值要大于 `MaxClients`
- `MaxRequestsPerChild` 设为 0 时进程永不重启，可能导致内存持续增长

### 第五步：重启 Apache

```bash
apachectl stop
apachectl start
```

**注意**：不能使用 `apachectl restart`，因为 ServerLimit 修改需要完整重启。

## MySQL 并发连接数优化

### 查看当前设置

在 MySQL 或 PHPMyAdmin 中执行：

```sql
-- 查看当前连接数
show status like '%max%';

-- 查看配置的最大连接数
show variables like '%max%';
```

### 方法一：修改 my.cnf（标准配置）

编辑 `/etc/my.cnf`：

```ini
[mysqld]
set-variable=max_connections=1000
set-variable=max_user_connections=500
set-variable=wait_timeout=200
```

**参数说明**：
- `max_connections`：最大连接数（默认 100）
- `max_user_connections`：每个用户的最大连接数
- `wait_timeout`：空闲连接等待时间（秒），超过则关闭连接

**重启后验证**：

```bash
mysqladmin -uroot -p variables | grep max_connections
```

### 方法二：大内存服务器（4GB+）

使用 Innodb-heavy 配置文件：

```bash
cp /usr/local/mysql/share/mysql/my-innodb-heavy-4G.cnf /etc/my.cnf
```

然后修改 `my.cnf` 中的 `max_connections` 值调高即可。

### 理论上限

MySQL 连接数受系统限制，最多不能超过文件描述符数量。可查看：

```bash
ulimit -n
```

## 性能监控

### Apache 连接检查

```bash
# 查看当前 Apache 进程数
ps aux | grep httpd | wc -l

# 查看 TCP 连接状态分布
netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
```

### MySQL 连接检查

```bash
# 查看当前连接数
mysqladmin -uroot -p status | grep Threads

# 或登录 MySQL 后执行
show processlist;
```

## 配置建议总结

| 场景 | Apache MaxClients | MySQL max_connections |
|------|-------------------|------------------------|
| 小站点（1G 内存） | 100-200 | 100-200 |
| 中型站点（4G 内存） | 500-1000 | 500-1000 |
| 大型站点（8G+ 内存） | 2000-5000 | 1000-2000 |

**通用原则**：
- 不要盲目设置过高，影响整体性能
- 定期监控实际连接使用率
- 根据生产环境实际情况调整，宁可保守也不要溢出
