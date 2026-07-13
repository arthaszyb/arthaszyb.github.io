---
title: Zookeeper 集群环境安装过程
date: '2018-04-08'
description: Zookeeper 集群部署完整指南。包括下载解压、环境变量配置、zoo.cfg 配置、集群部署（奇数台机器）、分布式安装、启动与验证流程。
category: monitoring
tags:
  - zookeeper
  - hadoop
  - java
draft: false
source: evernote-local-db
lang: zh
origin_url: https://blog.csdn.net/canlets/article/details/19046357
---

## Zookeeper 概述

Zookeeper 是分布式开源框架，提供分布式协调基本服务，包括分布式同步、命名服务、集群维护等。本文介绍集群环境的安装与配置。

**集群要求**：Zookeeper 集群需要一半以上机器正常启动才能可用，因此**建议使用奇数台机器**（如 5 台需 3 台正常工作）。

## 下载与解压

```bash
tar -xzvf zookeeper-3.4.5.tar.gz
# 解压到 /home/haduser/zookeeper 目录
```

## 环境变量配置

编辑 `/etc/profile`，增加：

```bash
export ZOOKEEPER_HOME=/home/haduser/zookeeper/zookeeper-3.4.5
export PATH=$PATH:$ZOOKEEPER_HOME/bin:$ZOOKEEPER_HOME/conf
```

## 集群配置

### 配置 zoo.cfg

```bash
cd zookeeper-3.4.5/conf
cp zoo_sample.cfg zoo.cfg
vim zoo.cfg
```

关键配置项：

```ini
tickTime=2000
dataDir=/home/haduser/zookeeper/zookeeper-3.4.5/data
clientPort=2181

# 集群配置（server.id=host:port1:port2）
# port1：Follower 连接 Leader 的端口
# port2：Leader 选举的端口
server.1=master:2888:3888
server.2=slave1:2888:3888
server.3=slave2:2888:3888
```

### 创建 myid 文件

在 `dataDir` 指定的目录下创建 `myid` 文件，内容为本机对应的 id（与 server.id 中的 id 对应）：

```bash
echo "1" > /home/haduser/zookeeper/zookeeper-3.4.5/data/myid
```

## 分布式部署

从 master 复制安装文件到其他机器：

```bash
scp -r zookeeper-3.4.5/ haduser@slave1:/home/haduser/zookeeper/
scp -r zookeeper-3.4.5/ haduser@slave2:/home/haduser/zookeeper/
```

修改各机器上的 myid（slave1 改为 2，slave2 改为 3）：

```bash
# 在 slave1 上
echo "2" > /home/haduser/zookeeper/zookeeper-3.4.5/data/myid
cat /home/haduser/zookeeper/zookeeper-3.4.5/data/myid

# 在 slave2 上
echo "3" > /home/haduser/zookeeper/zookeeper-3.4.5/data/myid
```

## 启动集群

在 Zookeeper 集群的每个节点上执行：

```bash
cd zookeeper-3.4.5
bin/zkServer.sh start
```

验证启动状态（在每个节点上查询）：

```bash
bin/zkServer.sh status
```

**输出示例**：
- slave1：Leader
- slave2、master：Follower

使用客户端连接集群：

```bash
bin/zkCli.sh -server master:2181
```

## 停止集群

```bash
bin/zkServer.sh stop
```
