---
title: Redis快速入门：安装、配置和操作
date: '2014-10-15'
description: "Redis的安装编译、启动配置、系统服务化及基础命令操作指南，包括关键配置参数说明和实际部署步骤。"
category: database
tags:
  - redis
draft: false
source: evernote-local-db
origin_url: https://www.it168.com/
lang: zh
---
本文是Redis快速入门系列的一部分，介绍Redis的安装、配置和基本操作。Redis是一个开源的、使用ANSI C编写的、支持网络、可内存存储或持久化的Key-Value数据库。

## 安装步骤

**步骤一：下载** 
从 http://redis.io/download 下载最新稳定版（例如2.2.12）：
```bash
wget http://redis.googlecode.com/files/redis-2.2.12.tar.gz
```

**步骤二：编译**
```bash
tar xzf redis-2.2.12.tar.gz
cd redis-2.2.12
make && make install
```

**步骤三：启动服务**
```bash
src/redis-server
```
默认监听端口6379。若显示WARNING关于overcommit_memory，需在/etc/sysctl.conf中加入 `vm.overcommit_memory = 1` 并重启。

**步骤四：配置为Linux服务**
在/etc/rc.local中加入：
```bash
/path/to/redis-2.2.12/src/redis-server
```

**步骤五：客户端连接验证**
```bash
src/redis-cli
redis 127.0.0.1:6379>
```

**步骤六：停止实例**
在启动session中按Control-C，或通过客户端：
```bash
redis-cli shutdown
```

## 配置管理

使用配置文件启动（与MySQL类似）：
```bash
src/redis-server redis.conf
```

编译完成后会在目录下生成redis.conf配置文件。
## 主要配置参数

- `daemonize`：是否后台运行，默认no
- `pidfile`：pid文件位置，默认/var/run/redis.pid（多实例需指定不同路径）
- `bind`：绑定IP地址，限制连接来源（生产环境推荐设置）
- `port`：监听端口，默认6379
- `timeout`：客户端空闲超时时间（秒）
- `loglevel`：日志级别（debug/verbose/notice/warning），生产环境用notice
- `logfile`：日志文件路径，默认标准输出
- `databases`：数据库个数，默认16，通过SELECT切换
- `save`：快照触发条件，例如 `save 900 1` 表示900秒内至少1个key变化则触发快照
- `rdbcompression`：快照时是否压缩
- `dbfilename`：快照文件名，默认dump.rdb
- `dir`：快照文件存储目录
- `slaveof`：指定从数据库的主服务器地址
- `masterauth`：主数据库密码
- `requirepass`：客户端连接密码（注意：Redis速度很快，需要设置足够强的密码抵抗暴力破解）
- `maxclients`：最大连接数
- `maxmemory`：最大内存限制。内存满时，写操作将优先删除过期key
- `appendonly`：启用AOF持久化（在后台写入aof文件）
- `appendfsync`：AOF同步频率（always/everysec/no）
- `vm-enabled`：虚拟内存支持（Redis 2.0+）
- `activerehashing`：是否定期重新hash（降低内存，但引入2ms延迟）

## 基础命令操作

```bash
# 插入数据
redis 127.0.0.1:6379> set name "value"
OK

# 查询数据
redis 127.0.0.1:6379> get name
"value"

# 删除键
redis 127.0.0.1:6379> del name
(integer) 1

# 检查键是否存在（返回1存在，0不存在）
redis 127.0.0.1:6379> exists name
(integer) 0
```
