---
title: 使用 Dockerfile 创建镜像问题记录
date: '2018-01-15'
description: 使用 Dockerfile 构建 Docker 镜像时遇到的 aufs 相关错误及解决方案。
category: container-virt
tags:
  - docker
draft: false
source: evernote-local-db
lang: zh
---

## 问题

执行 Dockerfile 构建镜像时，日志文件 `/var/log/message` 中出现以下错误：

```
docker: [error] mount.go:12 [warning]: couldn't run auplink before unmount: exec: "auplink": executable file not found in $PATH
```

## 原因

这是因为低版本 Docker 缺失了 `aufs-tools` 的依赖。`aufs`（Another Union File System）是 Docker 早期版本使用的存储驱动，`auplink` 是 aufs-tools 中的工具，用于处理 Docker 镜像层的挂载和卸载操作。

## 解决方案

安装 aufs-util 包：

```bash
yum install aufs-util
```

安装完成后，重新执行 Dockerfile 构建命令。如果错误仍然出现，继续查看日志确认是否有其他依赖缺失。
