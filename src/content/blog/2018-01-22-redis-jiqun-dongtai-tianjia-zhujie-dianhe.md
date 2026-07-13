---
title: "redis 集群动态添加主节点和从节点"
date: '2018-01-22'
description: "Redis Cluster 动态扩展：使用 redis-trib.rb 添加新的主从节点、为新节点分配 slot、验证集群状态的完整步骤。"
category: database
tags:
  - redis
  - 集群
draft: false
source: evernote-local-db
origin_url: "http://blog.csdn.net/woshimike/article/details/56479773"
lang: zh
---

## 场景

现有 6 台 redis 集群，主节点端口为 7002、7003、7004，从节点为 7001、7005、7006。需添加两个新的 redis 服务：7007（主）和 7008（从）。

## 前置条件

安装 ruby 及 redis 接口：

```bash
yum install ruby
yum install rubygems
gem install redis
```

## 步骤 1：添加主节点

运行 redis-trib.rb 检查命令是否正常（该命令用 ruby 写，需要正确安装 ruby）：

```bash
./redis-trib.rb add-node new_host:new_port existing_host:existing_port
```

参数说明：
- `new_host:new_port` - 需要加入集群的 redis 服务，如 192.168.142.128:7007
- `existing_host:existing_port` - 集群中已存在的任何 redis，如 192.168.142.128:7001

执行：

```bash
./redis-trib.rb add-node 192.168.142.128:7007 192.168.142.128:7001
```

7007 成功添加到集群，但这个主节点暂无 slot（槽位）。

## 步骤 2：为新主节点分配 slot

```bash
./redis-trib.rb reshard 192.168.142.128:7007
```

交互式提示：
1. 询问要分配多少个 slot，输入如 4000
2. 询问从哪个主节点 ID 分配，复制目标节点 ID
3. 询问是从所有节点还是指定节点分配，输入 all
4. 询问是否确认分配计划，输入 yes

完成后，7007 已分配 4000 个 slot。

## 步骤 3：添加从节点

添加 7008 作为 7007 的从节点：

```bash
./redis-trib.rb add-node 192.168.142.128:7008 192.168.142.128:7002
```

7008 成功添加到集群。

## 步骤 4：配置从节点复制关系

登录新加入的从节点，执行：

```bash
cluster replicate <主节点-ID>
```

其中 `<主节点-ID>` 是 7007 的节点 ID。这样 7008 就成为 7007 的从节点。

## 验证

查看集群信息，可看到新的主从节点已正常加入。

## 注意

- slot 分配不分数据有无，有数据的 slot 也会被分配到新主节点
- 在分配过程中，集群会自动迁移 slot 对应的数据到新节点
