---
title: Docker-ce 非 yum 安装
date: '2018-01-22'
description: 当 Docker 官方包仓库不可用时，通过直接下载二进制文件或官方脚本进行 docker-ce 安装的替代方案。
category: container-virt
tags:
  - docker
  - selinux
draft: false
source: evernote-local-db
lang: zh
---

Docker 官方通常提供 yum 安装方式，但在网络不稳定或仓库不可达的情况下，可以采用以下替代方案。

## 方案一：直接二进制安装

从 Docker 官网或镜像源找到二进制包，下载 tgz 包，传到目标机器，解压后得到 docker 目录（包含所有二进制文件）。

```bash
cp -a * /usr/bin/
```

启动 dockerd 服务：

```bash
nohup dockerd -H tcp://0.0.0.0:4243 -H unix:///var/run/docker.sock --selinux-enabled=false --log-opt max-size=1g &
```

参数说明：
- `-H tcp://0.0.0.0:4243`：监听 TCP 端口 4243（远程访问）
- `-H unix:///var/run/docker.sock`：监听 Unix socket（本地访问）
- `--selinux-enabled=false`：禁用 SELinux 检查
- `--log-opt max-size=1g`：设置日志单文件最大 1GB

## 方案二：官方安装脚本

Docker 官方提供的安装脚本本质上也是通过 yum 安装，在 IDC 内网环境中往往无法成功。此方法仅在有良好公网连接的环境中可用。

## 注意事项

在无法访问官方包仓库的 IDC 环境中，二进制安装方案相对稳定，可以作为首选。
