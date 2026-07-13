---
title: Docker常见命令—简易教程
date: '2018-01-11'
description: Docker 常见命令速查表，包括容器操作、镜像操作、Registry 操作以及 Dockerfile 基础和最佳实践。
category: container-virt
tags:
  - docker
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.youruncloud.com/docker/1_37.html
---

## 容器操作

```bash
docker create # 创建一个容器但是不启动它
docker run # 创建并启动一个容器
docker stop # 停止容器运行，发送信号SIGTERM
docker start # 启动一个停止状态的容器
docker restart # 重启一个容器
docker rm # 删除一个容器
docker kill # 发送信号给容器，默认SIGKILL
docker attach # 连接(进入)到一个正在运行的容器
docker wait # 阻塞到一个容器，直到容器停止运行
docker exec # 在容器里执行一个命令，可以执行bash进入交互式
```

## 获取容器相关信息

```bash
docker ps # 显示状态为运行（Up）的容器
docker ps -a # 显示所有容器,包括运行中（Up）的和退出的(Exited)
docker inspect # 深入容器内部获取容器所有信息
docker logs # 查看容器的日志(stdout/stderr)
docker events # 得到docker服务器的实时的事件
docker port # 显示容器的端口映射
docker top # 显示容器的进程信息
docker diff # 显示容器文件系统的前后变化
```

## 导出容器

```bash
docker cp # 从容器里向外拷贝文件或目录
docker export # 将容器整个文件系统导出为一个tar包，不带layers、tag等信息
```

## 镜像操作

```bash
docker images # 显示本地所有的镜像列表
docker import # 从一个tar包创建一个镜像，往往和export结合使用
docker build # 使用Dockerfile创建镜像（推荐）
docker commit # 从容器创建镜像
docker rmi # 删除一个镜像
docker load # 从一个tar包创建一个镜像，和save配合使用
docker save # 将一个镜像保存为一个tar包，带layers和tag信息
docker history # 显示生成一个镜像的历史命令
docker tag # 为镜像起一个别名
```

## Registry 仓库操作

```bash
docker login # 登录到一个registry
docker search # 从registry仓库搜索镜像
docker pull # 从仓库下载镜像到本地
docker push # 将一个镜像push到registry仓库中
```

## 常用查询和操作

获取 Container IP 地址（Container 状态必须是 Up）：

```bash
docker inspect id | grep IPAddress | cut -d '"' -f 4
```

获取端口映射：

```bash
docker inspect -f '{{range $p, $conf := .NetworkSettings.Ports}} {{$p}} -> {{(index $conf 0).HostPort}} {{end}}' id
```

获取环境变量：

```bash
docker exec container_id env
```

杀掉所有正在运行的容器：

```bash
docker kill $(docker ps -q)
```

删除老的（一周前创建）容器：

```bash
docker ps -a | grep 'weeks ago' | awk '{print $1}' | xargs docker rm
```

删除已经停止的容器：

```bash
docker rm `docker ps -a -q`
```

删除所有镜像（小心）：

```bash
docker rmi $(docker images -q)
```

## Dockerfile 基础

Dockerfile 是 docker 构建镜像的基础，是 docker 区别于其他容器的重要特征。学会编写 Dockerfile 对开发和运维都是必备的。

基本指令：

```dockerfile
FROM ubuntu
# 从一个基础镜像构建新的镜像

MAINTAINER William
# 维护者信息

ENV TEST 1
# 设置环境变量

RUN apt-get -y update
RUN apt-get -y install nginx
# 非交互式运行shell命令

ADD http://icescale.com/icescale.tgz /data
# 将外部文件拷贝到镜像里，src可以为url

WORKDIR /var/www
# 设置工作目录

USER nginx
# 设置用户ID

VOLUME ['/data']
# 设置volume

EXPOSE 80 443
# 暴露哪些端口

ENTRYPOINT ["/usr/sbin/nginx"]
# 执行命令

CMD ["start"]
# docker创建、启动container时执行的命令，如果设置了ENTRYPOINT，则CMD将作为参数
```

## Dockerfile 最佳实践

- 尽量将一些常用不变的指令放到前面
- CMD 和 ENTRYPOINT 尽量使用 json 数组方式
- 通过 Dockerfile 构建 image：`docker build -t csphere/nginx:1.7 .`

## 镜像仓库 Registry

部署私有 registry：

```bash
mkdir /registry
docker run -p 80:5000 -e STORAGE_PATH=/registry -v /registry:/registry registry:2.0
```

推送镜像到仓库（假设 192.168.1.2 是 registry 地址）：

```bash
docker tag csphere/nginx:1.7 192.168.1.2/csphere/nginx:1.7
docker push 192.168.1.2/csphere/nginx:1.7
```

## 实践示例

创建并拉取 busybox：

```bash
docker pull busybox:latest
```

创建测试容器：

```bash
docker run -d --name con03 csphere/test:0.1
# efc9bda4a2ff2f479b18e0fc4698e42c47c9583a24c93f5ce6b28a828a172709
```

登陆到容器中：

```bash
docker exec -it con03 /bin/bash
# [root@efc9bda4a2ff /]# exit
```

停止容器：

```bash
docker stop con03
# con03
```

开启容器：

```bash
docker start con03
# con03
```
