---
title: Docker容器时间与主机时间不一致的问题
date: '2018-01-15'
description: 解决 Docker 容器内系统时间与主机时间不一致的问题，包括时区统一、localtime 挂载和自定义 Dockerfile 等三种方法。
category: container-virt
tags:
  - docker
draft: false
source: evernote-local-db
lang: zh
origin_url: http://blog.csdn.net/xinluke/article/details/52050371
---

## 问题现象

Docker 容器与主机的时间不一致。

例：主机时间为 22:42:44 CST（东八区），容器时间为 14:43:31 UTC（标准时间），相差 8 小时。

```bash
# 主机
date
# 2016年 07月 27日 星期三 22:42:44 CST

# 容器
date
# Wed Jul 27 14:43:31 UTC 2016
```

根本原因是时区不一致：CST（China Shanghai Time）是东八区，UTC 是标准时间。

## 解决方案

### 方案一：共享主机的 localtime

创建容器时，指定启动参数挂载 localtime 文件到容器内，保证两者时区一致：

```bash
docker run --name <name> -v /etc/localtime:/etc/localtime:ro ....
```

### 方案二：复制主机的 localtime

```bash
docker cp /etc/localtime <容器ID或NAME>:/etc/localtime
```

**注意**：更新时间后，容器中运行的程序（如 MySQL）不一定能立即读取到新时间，必须重启该服务或重启容器。

```bash
# 示例：查询 MySQL 时间（更新后需要重启 MySQL）
select now() from dual;
```

### 方案三：创建自定义 Dockerfile

创建 Dockerfile，在镜像中自定义时区和时间格式：

```dockerfile
FROM redis
FROM tomcat
ENV CATALINA_HOME /usr/local/tomcat

# 设置时区
RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone
```

利用 `docker build` 命令生成镜像后使用即可。

## 建议

时区设置建议在制作镜像时就完成，这样所有基于该镜像的容器都会有正确的时区。
