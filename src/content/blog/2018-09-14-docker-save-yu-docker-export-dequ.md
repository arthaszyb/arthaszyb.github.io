---
title: docker save与docker export的区别
date: '2018-09-14'
description: "对比docker save和docker export两个命令的功能、应用场景及区别，包括加载、镜像分层等关键概念。"
category: container-virt
tags:
  - docker
draft: false
source: evernote-local-db
lang: zh
---

## 背景

在迁移 GPU 容器镜像时发现，只能用 `docker save` + `docker load` 才行，用 `docker export` 恢复的容器会出现 nvidia 命令无法执行的问题，通过 `docker inspect` 发现少了显卡驱动相关的一些配置。

## docker save

Docker 命令行接口很优雅，加 `--help` 可以查看帮助。`docker save` 用来将一个或多个镜像打包保存为 tar 档案：

```bash
$ docker save --help
Usage: docker save [OPTIONS] IMAGE [IMAGE ...]
Save one or more images to a tar archive (streamed to STDOUT by default)

Options:
  --help           Print usage
  -o, --output     Write to a file, instead of STDOUT
```

例如将 postgres 和 mongo 打包：

```bash
$ docker save -o images.tar postgres:9.6 mongo:3.4
```

打包后的 `images.tar` 包含 `postgres:9.6` 和 `mongo:3.4` 两个镜像。

虽然命令行参数要求指定 image，但实际上也可以对 container 打包。如果指定的是 container，docker save 保存的是容器背后的 image。

使用 `docker load` 加载：

```bash
$ docker load -i images.tar
```

上述命令将 `postgres:9.6` 和 `mongo:3.4` 载入。如果本地镜像库已存在同名镜像，将被覆盖。

**应用场景**：如果应用使用 docker-compose.yml 编排多个镜像，但客户服务器无法连接外网，可以使用 `docker save` 将镜像打个包，拷贝到客户服务器后用 `docker load` 载入。

## docker export

`docker export` 用来将 container 的文件系统打包为 tar 档案：

```bash
$ docker export --help
Usage: docker export [OPTIONS] CONTAINER
Export a container's filesystem as a tar archive

Options:
  --help               Print usage
  -o, --output string  Write to a file, instead of STDOUT
```

例如导出一个容器：

```bash
$ docker export -o postgres-export.tar postgres
```

docker export 需要指定 container，不能像 docker save 那样指定 image 或 container 都可以。

使用 `docker import` 加载：

```bash
$ docker import postgres-export.tar postgres:latest
```

docker import 将容器导入后会成为一个镜像，而不是恢复为容器。另外，docker import 可以指定新的 IMAGE[:TAG]，如果镜像库中已存在同名镜像，原有镜像将失名，只能通过 IMAGE ID 操作。

**应用场景**：主要用来制作基础镜像。从 ubuntu 镜像启动容器，安装软件和进行设置后，用 `docker export` 保存为基础镜像，分发给其他人使用。

## 区别总结

| 特性 | docker save | docker export |
|-----|-----------|--------------|
| 保存对象 | 镜像（image） | 容器（container） |
| 加载命令 | docker load | docker import |
| 加载结果 | 恢复为镜像 | 转为镜像 |
| 重命名 | 不能 | 可以 |

## 深入探讨

docker load 能否导入 docker export 的容器包？docker import 能否导入 docker save 的镜像包？

测试两个文件：
- postgres-export.tar：通过 docker export 导出的容器包
- postgres-save.tar：通过 docker save 保存的镜像包

两者都基于 postgres:9.6 镜像。从文件大小可以看出，postgres-export.tar 比 postgres-save.tar 小 100+ MB。

**测试 docker load 容器包**：

```bash
$ docker load -i postgres-export.tar
Error response from daemon: no such file or directory
```

docker load 不能载入容器包。

**测试 docker import 镜像包**：

```bash
$ docker import postgres-save.tar postgres
sha256:8910feec1ee2fac8c152dbdd0aaab360ba0b833af5c3ad59fcd648b9a24d4838
$ docker image ls
REPOSITORY  TAG     IMAGE ID       CREATED       SIZE
postgres    latest  8910feec1ee2   2 minutes ago 398MB
```

竟然成功了！但能否启动容器？

```bash
$ docker run postgres
Error response from daemon: No command specified.
```

导入成功但镜像不可用。

**原因分析**：

- postgres-export.tar 内容是 Linux 系统的文件目录结构
- postgres-save.tar 是分层的文件系统：Docker 镜像由一层层文件叠加而成，上层文件覆盖下层同名文件
- 将 postgres-save.tar 各层文件合并就是 postgres-export.tar 的内容
- postgres-save.tar 存在大量重复文件，所以比 postgres-export.tar 大得多

docker load 必须载入分层文件系统，postgres-export.tar 不具有这样的结构，无法载入。而 docker import 仅是复制文件，无论结构如何都能载入，但 postgres-save.tar 不是有效的操作系统镜像，所以无法启动容器。

docker import 和 docker commit 相似：前者将外部文件复制进来形成单层文件系统的镜像，后者将当前改动提交为一层，叠加到原镜像之上。
