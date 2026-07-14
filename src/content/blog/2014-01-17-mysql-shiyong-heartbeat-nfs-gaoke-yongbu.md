---
title: MySQL 使用 Heartbeat + NFS 实现高可用部署
date: '2014-01-17'
description: "基于Heartbeat和NFS共享存储的MySQL高可用部署方案，实现自动故障转移和共享数据访问。"
category: database
tags:
  - mysql
  - nfs
  - 高可用
draft: false
source: evernote-local-db
lang: zh
---

使用 Heartbeat + NFS 实现 MySQL 高可用集群的部署步骤。

## 0. 初始化主机名

确保所有节点的主机名已配置：

```bash
uname -n  # 检查主机名
```

## 1. 配置 NFS 共享存储

编辑 NFS 导出配置，注意所有 MySQL 节点的 mysql 用户 UID 必须一致：

```bash
vi /etc/exports
/share_mysql_data *(rw,sync,anonuid=501,anongid=501)
```

## 2. 配置所有 MySQL 服务器

将所有 MySQL 节点的数据目录指向挂载的 NFS 共享存储。

## 3. 测试 MySQL 启动

测试各节点 MySQL 启动是否正常。**注意**：在共享存储情况下，同一时刻只能单独启动一个 MySQL 实例（避免数据冲突）。

## 4. 安装 Heartbeat

### 4.1 创建 HA 用户

```bash
groupadd haclient
useradd -g haclient hacluster
```

### 4.2 安装依赖和 Heartbeat

```bash
# 安装依赖
yum -y install bison bison-devel docbook-style-xsl flex \
  gettext gettext-devel gnutls gnutls-devel intltool \
  OpenIPMI OpenIPMI-devel

yum install cluster-glue
yum install resource-agents
yum install pacemaker  # 可选

# 安装 Heartbeat
rpm -ivh PyXML-0.8.4-19.el6.x86_64.rpm
rpm -ivh heartbeat-libs-3.0.4-1.el6.x86_64.rpm --nodeps
rpm -ivh heartbeat-3.0.4-1.el6.x86_64.rpm
rpm -ivh heartbeat-devel-3.0.4-1.el6.x86_64.rpm
```

## 5. 配置 Heartbeat

编辑 `haresource` 配置文件，定义虚拟 IP、NFS 挂载和 MySQL 服务的管理：

```bash
vi haresource
```

```
host003 IPaddr::192.168.9.85/24/eth0:1 Filesystem::192.168.9.82:/share_mysql_data::/var/mysql/data::nfs mysql
```

配置说明：
- `host003`：主节点主机名
- `IPaddr::192.168.9.85/24/eth0:1`：虚拟 IP 和网卡
- `Filesystem::...::nfs`：NFS 挂载资源
- `mysql`：MySQL 服务资源

## 6. 启动和测试

启动 Heartbeat 服务：

```bash
service heartbeat start
```

测试故障转移：
- 模拟主节点故障，观察从节点是否接管虚拟 IP 和 MySQL 服务
- 验证数据库连接是否正常切换到从节点

## 工作原理

1. **NFS 共享存储**：所有 MySQL 数据保存在共享存储中，任何节点都能访问
2. **虚拟 IP**：应用连接到虚拟 IP，不依赖于具体的物理节点
3. **Heartbeat 监控**：持续监控主节点健康状态，故障时自动转移虚拟 IP 和服务到从节点
4. **自动故障转移**：无需人工干预，实现透明的高可用转移
