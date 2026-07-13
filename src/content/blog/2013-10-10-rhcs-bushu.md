---
title: RHCS部署
date: '2013-10-10'
description: Red Hat Cluster Suite 部署流程，包括共享存储配置、集群组件安装、集群配置和启动。
category: web-infra
tags:
  - iscsi
  - 存储
  - 集群
draft: false
source: evernote-local-db
lang: zh
---

Red Hat Cluster Suite（RHCS）部署步骤。

## 1. 配置共享存储

- 配置 iSCSI 服务器并共享磁盘
- 客户端连接共享盘，用 `fdisk -l` 查看

## 2. 在各节点安装 RHCS 组件

```bash
yum groupinstall Clustering
yum groupinstall "Cluster Storage"
```

创建 GFS2 文件系统：

```bash
mkfs.gfs2 -t mycluster:datagfs01 -p lock_dlm -j 3 /dev/sdb
```

参数说明：
- `-t mycluster:datagfs01`：集群名和共享盘名称
- `-j 3`：最大挂载数

## 3. 配置集群

使用图形化界面 `system-config-cluster` 配置虚拟 IP 和 GFS，然后同步配置文件到各节点。

## 4. 各节点挂载共享盘

```bash
mount -t gfs2 /dev/sdb /share
```

## 5. 启动集群服务

按顺序启动（先启 cman，后启 rgmanager）：

```bash
cman          # 在各节点启动
rgmanager     # 在各节点启动
```

## 6. 配置表决盘（可选）

表决盘一般小于 10M，通过 mkqdisk 命令格式化：

```bash
mkqdisk -c /dev/sdc1 -l myqdisk
mkqdisk -l      # 查看表决盘情况
```
