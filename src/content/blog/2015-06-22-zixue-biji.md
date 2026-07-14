---
title: Docker学习笔记：基本命令和操作
date: '2015-06-22'
description: Docker 基础操作快速参考。包括容器查看/创建/启动/停止、镜像管理、卷挂载、端口映射、守护进程容器配置等命令。
category: container-virt
tags:
  - docker
draft: false
source: evernote-local-db
lang: zh
---

## 环境与安装

CentOS 7 环境下 Docker 的基本安装与目录结构：

```bash
yum install docker-io
```

Docker 目录结构：
- `/var/lib/docker` - Docker 主目录
- `containers` - 容器目录
- `graph` - 镜像目录

## 容器基本操作

查看容器：

```bash
docker ps -a
```

创建与运行容器：

```bash
docker run --name stoic_darwin -i -t ubuntu /bin/bash
```

启动、停止、进入容器：

```bash
docker start stoic_darwin
docker attach stoic_darwin
docker stop test_01
docker exec -i -t test_01 /bin/bash
```

## 守护式容器

创建自动重启的后台容器：

```bash
docker run --restart=always --name daemon_dave -d ubuntu /bin/sh -c "while true; do echo hello world; sleep 1; done"
```

`restart` 参数选项：
- `always` - 总是重启
- `on-failure:5` - 非零退出时重启，最多 5 次

## 镜像管理

从 Docker Hub 下载镜像：

```bash
docker pull centos:6.6
```

查看本地镜像：

```bash
docker images
```

加载本地镜像：

```bash
docker import xxx
```

## 卷挂载与端口映射

创建带卷挂载和端口映射的容器：

```bash
docker run --name nginx_dist -v /tmp/docker:/usr/share/nginx/html:ro -p 80:80 -d nginx:1.7.6
```

参数说明：
- `-v` - 前半部分为宿主机路径，后半部分为容器路径，实现路径映射
- `-p` - 前半部分为宿主机端口，后半部分为容器端口
- `-d` - 指定使用的镜像名
- `-i -t` - 生成容器后进入伪终端
