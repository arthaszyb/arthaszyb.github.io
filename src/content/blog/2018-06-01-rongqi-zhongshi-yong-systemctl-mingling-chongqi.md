---
title: 容器中使用systemctl命令重启服务
date: '2018-06-01'
description: "在docker容器中使用systemctl重启服务时遇到D-Bus连接错误的解决方法，针对不同发行版的启动参数配置。"
category: container-virt
tags:
  - systemd
  - docker
draft: false
source: evernote-local-db
lang: zh
---

在docker容器中用systemctl重启服务时，提示：

```
Failed to get D-Bus connection: Operation not permitted
```

## Ubuntu 16.04+ / RedHat / OracleLinux / CentOS(非7)

```bash
$ docker run -d --privileged=true IMAGENAME:TAG /usr/sbin/init
$ docker exec -it CONTAINERID /bin/bash
```

- `IMAGENAME:TAG`：指定需要启动的镜像和标签
- `CONTAINERID`：容器的id（可用 `docker ps -a` 查看）

## CentOS 7

CentOS 7镜像需要额外挂载cgroup：

```bash
$ docker run -d -e "container=docker" --privileged=true -v /sys/fs/cgroup:/sys/fs/cgroup --name centos7 centos:centos7 /usr/sbin/init
$ docker exec -it centos7 /bin/bash
```

用这样方式启动docker容器后，就可以在容器中使用systemctl命令了。
