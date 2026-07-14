---
title: RedHat 集群套件 (高可用、负载均衡) 简介
date: '2013-10-21'
description: RHCS 的高可用集群（RHCM）和负载均衡集群（Piranha/LVS）实现方法、基础知识、架构特点及配置。涵盖高可用集群的容错机制、LVS 的 VS/NAT、VS/DR、VS/TUN 三种工作模式。
category: web-infra
tags:
  - 集群
  - 高可用
  - 负载均衡
draft: false
source: evernote-local-db
lang: zh
origin_url: ""
---

RHCS（Red Hat Cluster Suite）整理笔记。

## RHCS 组件概览

RHCS 提供两个主要组件：

1. **RHCM (Red Hat Cluster Manager)** — 高可用集群管理，提供故障自动转移、服务迁移、资源管理，支持 NFS、SAMBA 高可用配置向导。

2. **Piranha** — 基于 LVS 的负载均衡集群，提供 Web 界面配置、路由器高可用、服务器监控功能。

## 高可用集群的三种结构

- **主从式** — 两节点，主服务器运行服务，从服务器备份。资源利用率低。
- **对称式** — 两节点，相互监视，两台同时提供服务。资源利用率较高。
- **集群式** — 多节点，每节点可独立运行服务，故障自动在成员间转移。

## RHEL 和 RHCS 部署流程

**硬件准备：** RHCS 3.0 支持 RHEL 3.0 AS/WS。需验证硬件兼容性。

**系统配置：**
- 在 /etc/hosts 配置所有节点的 IP 和主机名
- 修改 /boot/grub/grub.conf 的 timeout 为 10 秒
- 配置共享存储设备（SCSI 或光纤），分区为：两个 10M 裸设备，多个供服务使用的分区
- 配置裸设备：编辑 /etc/sysconfig/rawdevices，绑定到分区，重启 rawdevices 服务

**软件安装：** 四个核心软件包：

```bash
rpm -ivh clumanager-x.x.x ipvsadm-x.x.x piranha-x.x.x redhat-config-cluster-x.x.x
```

**集群配置：**
- 编辑 /etc/cluster.conf（集群配置文件）
- 定义集群成员节点
- 配置共享存储设备和裸设备
- 创建 NFS/SAMBA 高可用服务（含 IP 地址、挂载点）
- 复制配置文件到所有节点
- 启动 clumanager 服务

## LVS 负载均衡工作原理

负载均衡器（Director）无缝将客户请求调度到真实服务器（RealServer），客户端透明访问，无需修改程序。LVS 支持 NAT、DR、TUN 三种调度模式。
