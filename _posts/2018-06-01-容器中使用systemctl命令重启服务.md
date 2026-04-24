---
title: "容器中使用systemctl命令重启服务"
date: 2018-06-01 07:39:08 +0000
categories: ["docker"]
tags: []
description: "2017年05月10日 10:07:44 阅读数：2176 在docker容器中用systemctl重启服务时，提示 Failed to get D-Bus connection: Operation not permitted 解决方法： ubuntu16.04以上版本, redhat, oraclelinux, c"
source: "evernote-local-db"
---

容器中使用systemctl命令重启服务
2017年05月10日 10:07:44
阅读数：2176
在docker容器中用systemctl重启服务时，提示
Failed to get D-Bus connection: Operation not permitted
解决方法：
ubuntu16.04以上版本, redhat, oraclelinux, centos但非centos7镜像等
$ docker run -d --privileged=true IMAGENAME:TAG /usr/sbin/init
$ docker exec -it CONTAINERID /bin/bash
1
2
3
IMAGENAME:TAG: 指定需要启动的镜像和标签
CONTAINERID: 容器的id（可用
docker ps -a
查看）
centos7（据说这是centos7镜像的大坑）
$ docker run -d -e
"container=docker"
--privileged=true -v /sys/fs/cgroup:/sys/fs/cgroup --name centos7 centos:centos7 /usr/sbin/init
$ docker
exec
-it centos7 /bin/bash
1
2
用这样方式启动docker容器后，我们就可以在容器中使用systemctl命令了。
