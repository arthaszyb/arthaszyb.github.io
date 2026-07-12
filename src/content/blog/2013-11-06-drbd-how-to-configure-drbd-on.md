---
title: DRBD – How to configure DRBD on CentOS 6
date: '2013-11-06'
description: "DRBD 分布式块设备部署指南：安装 ELRepo 仓库、drbd 工具和模块、配置资源文件、DNS 和 NTP 同步、初始化元数据、启动同步、创建文件系统。"
category: linux
tags:
  - raid
  - drbd
draft: false
source: evernote-local-db
lang: zh
---

## DRBD 简介

[DRBD](http://www.drbd.org/)（Distributed Replicated Block Device）是一个网络化的 RAID-1 解决方案，通过网络镜像块设备，用于构建高可用（HA）集群。

**使用场景**：

- 需要镜像特定磁盘数据到另一机器
- 配置高可用集群或服务

**前置要求**：

- 两台机器均需额外磁盘用于同步（大小最好相同）
- 机器间的网络连接正常
- DNS 解析正常（可通过 /etc/hosts 手工配置）
- 两个节点的 NTP 时间同步

## CentOS 6.x 部署步骤

### 1. 安装 ELRepo 仓库（两台机器）

```bash
[root@foo1 ~]# rpm -ivh http://elrepo.org/elrepo-release-6-5.el6.elrepo.noarch.rpm
```

### 2. 安装 DRBD 工具和模块（两台机器）

选择 drbd83 或 drbd84（drbd84 在某些内核版本有问题）：

```bash
[root@foo1 ~]# yum install -y kmod-drbd83 drbd83-utils
```

### 3. 加载 DRBD 模块（两台机器）

```bash
[root@foo1 ~]# modprobe drbd
```

或重启两台机器自动加载。

### 4. 创建 DRBD 资源配置文件（两台机器）

在两台机器上创建完全相同的 `/etc/drbd.d/disk1.res` 文件：

```bash
resource disk1
{
  startup {
    wfc-timeout 30;
    outdated-wfc-timeout 20;
    degr-wfc-timeout 30;
  }

  net {
    cram-hmac-alg sha1;
    shared-secret sync_disk;
  }

  syncer {
    rate 100M;
    verify-alg sha1;
  }

  on foo1.geekpeek.net {
    device minor 1;
    disk /dev/sdb;
    address 192.168.1.100:7789;
    meta-disk internal;
  }

  on foo2.geekpeek.net {
    device minor 1;
    disk /dev/sdb;
    address 192.168.1.101:7789;
    meta-disk internal;
  }
}
```

### 5. 配置 DNS 解析（两台机器）

在两台机器的 `/etc/hosts` 中添加：

```bash
192.168.1.100 foo1 foo1.geekpeek.net
192.168.1.101 foo2 foo2.geekpeek.net
```

### 6. 配置 NTP 时间同步（两台机器）

在 `/etc/crontab` 中添加定时同步任务（替换为实际的 NTP 服务器）：

```bash
1 * * * * root ntpdate your.ntp.server
```

### 7. 初始化 DRBD 元数据存储（两台机器）

```bash
[root@foo1 ~]# drbdadm create-md disk1
```

### 8. 启动 DRBD 服务（两台机器）

```bash
[root@foo1 ~]# /etc/init.d/drbd start
```

### 9. 将一台节点设为 PRIMARY（选择一台，如 foo1）

```bash
[root@foo1 ~]# drbdadm --overwrite-data-of-peer primary disk1
```

### 10. 等待初始同步完成

检查同步进度：

```bash
[root@foo1 ~]# cat /proc/drbd
version: 8.3.15 (api:88/proto:86-97)
GIT-hash: 0ce4d235fc02b5c53c1c52c53433d11a694eab8c build by phil@Build32R6, 2012-12-20 20:23:49
1: cs:SyncSource ro:Primary/Secondary ds:UpToDate/Inconsistent C r---n-
ns:1060156 nr:0 dw:33260 dr:1034352 al:14 bm:62 lo:9 pe:78 ua:64 ap:0 ep:1 wo:f oos:31424
[==================>.] sync'ed: 97.3% (31424/1048508)K
finish: 0:00:01 speed: 21,240 (15,644) K/sec
```

同步完成后（100%）：

```bash
[root@foo1 ~]# cat /proc/drbd
version: 8.3.15 (api:88/proto:86-97)
GIT-hash: 0ce4d235fc02b5c53c1c52c53433d11a694eab8c build by phil@Build32R6, 2012-12-20 20:23:49
1: cs:Connected ro:Primary/Secondary ds:UpToDate/UpToDate C r-----
ns:1081628 nr:0 dw:33260 dr:1048752 al:14 bm:64 lo:0 pe:0 ua:0 ap:0 ep:1 wo:f oos:0
```

### 11. 在 DRBD 设备上创建文件系统

```bash
[root@foo1 ~]# mkfs.ext4 /dev/drbd1
```

现在可以在 PRIMARY 节点上挂载 DRBD 设备。更多 DRBD 管理和命令用法参考其他文档。
