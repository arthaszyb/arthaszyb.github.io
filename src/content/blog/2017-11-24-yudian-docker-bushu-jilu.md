---
title: 御点 Docker 部署记录
date: '2017-11-24'
description: 御点（企业应用）Docker 部署全流程。基于 CentOS 6.9 基础镜像创建和配置容器，导出、迁移到新宿主机，网络配置注意事项。
category: container-virt
tags:
  - docker
  - iptables
draft: false
source: evernote-local-db
lang: zh
---

## 构建镜像

基于 CentOS 6.9 拉取和创建容器：

```bash
docker pull centos:6.9
docker run --name z1 -it centos:6.9 /bin/bash
```

在容器内安装必要的包：

```bash
yum install -y killall perl unzip sudo
```

退出并提交容器为新镜像：

```bash
exit
docker commit fa2a420b2863 enter_prise_v0.1
```

## 镜像迁移

导出容器为 tar 文件：

```bash
docker export 888ab1b10154 > enterPrise.tar
```

在新宿主机上导入镜像：

```bash
cat enterPrise.tar | docker import - my/enterprise:0.1
```

注意：镜像名必须是小写字母。

## 配置要点

- Docker 容器网络模式需要配置，host 模式下 `ifconfig` 可能无输出
- 服务 bind 地址统一改为 `0.0.0.0`，便于迁移时 IP 变更
- 务必配置 iptables 规则以防安全风险
