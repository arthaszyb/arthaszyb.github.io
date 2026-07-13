---
title: 其他制作镜像的方式
date: '2018-01-22'
description: 除了标准 Dockerfile 方法外，Docker 还提供 docker import 和 docker save/load 等其他镜像创建和迁移方案。
category: container-virt
tags:
  - docker
draft: false
source: evernote-local-db
lang: zh
origin_url: https://yeasy.gitbooks.io/docker_practice/content/image/other.html
---

## 从 rootfs 压缩包导入

使用 `docker import` 命令从本地文件、远程 Web 文件或标准输入导入镜像。压缩包将在镜像 `/` 目录展开，直接作为镜像第一层提交。

格式：

```bash
docker import [选项] <文件>|<URL>|- [<仓库名>[:标签]]
```

示例：创建 OpenVZ 的 Ubuntu 14.04 模板镜像

```bash
docker import http://download.openvz.org/template/precreated/ubuntu-14.04-x86_64-minimal.tar.gz openvz/ubuntu:14.04
# Downloading from http://download.openvz.org/template/precreated/ubuntu-14.04-x86_64-minimal.tar.gz
# sha256:f477a6e18e989839d25223f301ef738b69621c4877600ae6467c4e5289822a79 B/78.42 MB
```

验证：

```bash
docker image ls openvz/ubuntu
# REPOSITORY          TAG     IMAGE ID        CREATED              SIZE
# openvz/ubuntu       14.04   f477a6e18e98    55 seconds ago       214.9 MB

docker history openvz/ubuntu:14.04
# IMAGE               CREATED              CREATED BY                                                    SIZE
# f477a6e18e98        About a minute ago   Imported from http://download.openvz.org/...                214.9 MB
```

## docker save 和 docker load

Docker 提供 `docker save` 和 `docker load` 命令用于将镜像保存为 tar 文件并在其他位置加载。这是没有 Registry 时的做法，现在已不推荐，镜像迁移应使用 Registry。

### 保存镜像

将 alpine 镜像保存为压缩 tar 文件：

```bash
docker image ls alpine
# REPOSITORY    TAG      IMAGE ID        CREATED       SIZE
# alpine        latest   baa5d63471ea    5 weeks ago   4.803 MB

docker save alpine | gzip > alpine-latest.tar.gz
```

### 加载镜像

将镜像文件复制到目标机器，加载镜像：

```bash
docker load -i alpine-latest.tar.gz
# Loaded image: alpine:latest
```

### 镜像迁移

结合 `ssh` 和 `pv` 等工具，可以编写一条命令完成镜像从一个机器迁移到另一个机器，并显示进度条：

```bash
docker save <镜像名> | bzip2 | pv | ssh <用户名>@<主机名> 'cat | docker load'
```

## 总结

- `docker import` 适合从已有的 rootfs 快速创建镜像
- `docker save/load` 适合在无 Registry 的环境中进行镜像备份和迁移
- 现代部署中推荐使用 Docker Registry（Docker Hub 或私有 Registry）进行镜像管理
