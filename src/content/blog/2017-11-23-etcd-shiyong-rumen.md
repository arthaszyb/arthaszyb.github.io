---
title: etcd 使用入门
date: '2017-11-23'
description: >-
  etcd 是分布式服务发现系统的使用笔记，涵盖单点安装、集群配置、HTTP API 基础操作、etcdctl 命令行工具，包括 key 增删查改、TTL、监听变化、原子操作等常见场景。
category: container-virt
tags:
  - kubernetes
  - docker
  - etcd
draft: false
source: evernote-local-db
lang: zh
origin_url: http://cizixs.com/2016/08/02/intro-to-etcd
---

etcd 是 CoreOS 开发的分布式服务系统，采用 raft 协议实现一致性。单实例 3.0.4 版本支持每秒 2000+ 读操作。默认使用端口 2379（HTTP API）和 2380（peer 通信）。集群模式推荐 3、5、7 个节点。

## 安装与启动

单点启动只需运行 `./etcd` 命令。生产环境推荐集群部署并使用 SSL 安全机制。

## 集群配置参数

核心启动参数：

```bash
--name                      # 节点名称，集群中唯一
--data-dir                  # 数据保存路径，默认 ${name}.etcd
--snapshot-count            # 事务数达到此值触发快照
--heartbeat-interval        # leader 心跳间隔，默认 100ms
--eletion-timeout           # 选举超时，默认 1000ms，无心跳时触发重选
--listen-peer-urls          # 与同伴通信地址，如 http://ip:2380
--listen-client-urls        # 客户端服务地址，如 http://ip:2379
--advertise-client-urls     # 对外公告的客户端地址
--initial-advertise-peer-urls # 对外公告的 peer 地址
--initial-cluster           # 格式：node1=http://ip1:2380,node2=http://ip2:2380,...
--initial-cluster-state     # 新建集群用 new，加入已存在集群用 existing
--initial-cluster-token     # 集群 token，保持唯一
```

所有参数也可通过环境变量设置：`--my-flag` 对应 `ETCD_MY_FLAG`，命令行参数优先级更高。

## 基础架构

- 集群由多个 member 组成，每个 member 是独立的 etcd 实例
- Leader 负责同步日志到 followers，定时发送心跳
- Followers 无心跳收到时触发重新选举
- 客户端请求先发送给 leader，leader 同步到超过半数 followers 后返回
- 三大组件：raft 实现、WAL 日志存储（包含 wal file 和 snapshot）、数据存储和索引

## HTTP API 操作

API endpoint 前缀：`/v2/keys`

### 基本增删查改

```bash
# 创建/更新 key
http PUT http://127.0.0.1:2379/v2/keys/message value=="hello, etcd"

# 获取 key
http GET http://127.0.0.1:2379/v2/keys/message

# 删除 key
http DELETE http://127.0.0.1:2379/v2/keys/message
```

返回 JSON 包含：
- `action`：set/get/delete/compareAndSwap 等
- `node.key`：key 路径
- `node.value`：值
- `node.createdIndex`：创建时递增
- `node.modifiedIndex`：修改时递增
- `prevNode`：更新/删除时返回前一个值

HTTP 头：
- `X-Etcd-Index`：集群 index
- `X-Raft-Index`：raft index
- `X-Raft-Term`：raft 任期

### TTL 操作

```bash
# 设置 TTL（5 秒后自动删除）
http PUT http://127.0.0.1:2379/v2/keys/tempkey value=="Gone with wind" ttl==5

# 取消 TTL
http PUT http://127.0.0.1:2379/v2/keys/foo value==bar ttl== prevExist==true

# 更新 TTL 而不改变值
http PUT http://127.0.0.1:2379/v2/keys/tempkey refresh==true ttl==500
```

### 监听变化

客户端长轮询监听 key 变化：

```bash
# 监听单个 key
http http://127.0.0.1:2379/v2/keys/foo wait==true

# 监听目录
http http://127.0.0.1:2379/v2/keys/foo wait==true recursive==true

# 从指定 index 开始监听
http http://127.0.0.1:2379/v2/keys/foo waitIndex==100
```

连接长时间无返回会被关闭，客户端需自动重试。etcd 仅保存最近 1000 个事件。

### 有序 key 创建

```bash
# 自动生成有序 key（用于队列场景）
http POST http://127.0.0.1:2379/v2/keys/queue value==job1

# 获取时排序
http http://127.0.0.1:2379/v2/keys/queue sorted==true
```

### 原子操作

#### CompareAndSwap（条件更新）

```bash
# 仅当前一个值为 bar 时才更新为 changed
http PUT http://127.0.0.1:2379/v2/keys/foo prevValue==bar value==changed
```

支持条件：`prevValue`、`prevIndex`、`prevExist`

条件不满足返回 HTTP 412 和 errorCode 101。

#### CompareAndDelete（条件删除）

```bash
http DELETE http://127.0.0.1:2379/v2/keys/foo prevValue==changed
```

支持 `prevValue` 和 `prevIndex` 条件。

### 目录操作

```bash
# 创建目录
http PUT http://127.0.0.1:2379/v2/keys/anotherdir dir==true

# 列出目录内容
http http://127.0.0.1:2379/v2/keys/

# 递归列出所有内容
http http://127.0.0.1:2379/v2/keys/\?recursive\=true

# 删除空目录
http DELETE http://127.0.0.1:2379/v2/keys/queue dir==true

# 删除非空目录（递归）
http DELETE http://127.0.0.1:2379/v2/keys/queue dir==true recursive==true
```

目录以 `/` 开头的 key 是隐藏节点，不会在列出目录时显示。

### 目录 TTL

```bash
http PUT http://127.0.0.1:2379/v2/keys/dir dir==true ttl==5 prevExist==true
```

目录过期时自动删除内部所有子目录和 key。

### 集群信息查询

```bash
GET /v2/stats/leader      # leader 及 followers 信息
GET /v2/stats/self        # 当前节点信息
GET /v2/state/store       # 命令统计信息
```

### 成员管理

```bash
# 列出集群成员
http http://127.0.0.1:2379/v2/members

# 添加成员
curl http://10.0.0.10:2379/v2/members -XPOST \
  -H "Content-Type: application/json" \
  -d '{"peerURLs":["http://10.0.0.10:2380"]}'

# 删除成员
curl http://10.0.0.10:2379/v2/members/272e204152 -XDELETE

# 更新成员 peer url
curl http://10.0.0.10:2379/v2/members/272e204152 -XPUT \
  -H "Content-Type: application/json" \
  -d '{"peerURLs":["http://10.0.0.10:2380"]}'
```

## etcdctl 命令行工具

etcdctl 是 HTTP API 的 CLI 封装。

```bash
# 设置值
./etcdctl set /message "hello, etcd"

# 获取值
./etcdctl get /message

# 获取详细元数据
./etcdctl -o extended get /message

# 设置 TTL
./etcdctl set /tempkey "gone with wind" --ttl 5

# 条件更新（值匹配时才更新）
./etcdctl set --swap-with-value "hello, etcd" /message "goodbye, etcd"

# 仅创建（不存在时）
./etcdctl mk /foo bar

# 自动生成排序 key
./etcdctl mk --in-order /queue job1
./etcdctl mk --in-order /queue job2
./etcdctl ls --sort /queue

# 更新（仅当 key 存在时生效）
./etcdctl update /message "I'am changed"
./etcdctl update --ttl 3 /message "I'am changed"

# 删除
./etcdctl rm /foo

# 条件删除（值匹配时）
./etcdctl rm --with-value bar /foo

# 目录操作
./etcdctl mkdir /dir
./etcdctl rmdir /dir/subdir/      # 删除空目录
./etcdctl rm --recursive /dir      # 删除非空目录

# 列出目录
./etcdctl ls /
./etcdctl ls --recursive /

# 监听 key（打印变化）
./etcdctl watch /message

# 监听目录
./etcdctl watch --recursive /

# 持续监听（除非 Ctrl+C）
./etcdctl watch --forever /message

# 监听并执行命令
./etcdctl exec-watch --recursive / -- sh -c "echo change detected."
```

## 总结

- etcd 仅保存最近 1000 个历史事件，不适合大量更新场景
- 典型应用：配置管理、服务发现（读多写少）
- 相比 zookeeper 更简洁，但需配合 registrator、confd 等工具实现完整的服务发现
- 暂无图形化工具
