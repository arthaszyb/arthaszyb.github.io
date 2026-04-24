---
title: "Docker学习之路（六）用commit命令创建镜像"
date: 2017-11-23 03:44:26 +0000
categories: ["docker"]
tags: ["Pages"]
description: "2017 年 11 月 23 日 11:44 docker Aomine 2015年02月27日发布 赞 | 6 收藏 | 27 57.1k 次浏览 假期快要结束了，干点正事，接着Docker的学习。 构建镜像 构建镜像的两种方法： 使用 docker commit 命令 使用 docker build 命令和 Doc"
source: "evernote-local-db"
---

2017
年
11
月
23
日
11:44
Docker学习之路（六）用commit命令创建镜像
docker

Aomine
2015年02月27日发布
赞 | 6
收藏 | 27
57.1k
次浏览
假期快要结束了，干点正事，接着Docker的学习。
构建镜像
构建镜像的两种方法：
使用
docker commit
命令
使用
docker build
命令和
Dockerfile
文件
Dockerfile更抢到、灵活，推荐使用。
一般来说不是真的“创建”新镜像，而是基于一个已有的基础镜像，比如Ubuntu、Fedora等，构建新的镜像而已。从零构建一个全新的镜像可参考
这篇文章
用commit创建镜像
创建Docker账号
共享和发布镜像时构建镜像中重要的环节，可以将镜像推送到Docker Hub或资金的私有Registry中。首先到
https://hub.docker.com/account/signup/
创建账号。
邮件激活后，可以测试登录：
$
sudo docker login
这条命令会完成登录，并将认证信息报错起来供后面使用。个人认证信息将报错到
$HOME/ .dockercfg
文件中.
用 commit 命令创建镜像
可以想象是往版本控制系统里提交变更：首先创建一个容器，并在容器里做修改，就行修改代码一样，最后在讲修改提交为一个新镜像。
创建一个新容器命令：
$ sudo docker
run
-i -t ubuntu /bin/bash
我用之前创建好的aoct容器：
$
sudo docker start aoct
$
sudo docker attach aoct
安装Apache
:
root
@614122c0aabb
:/
# apt-get -yqq update

...

root
@614122c0aabb
:/
# apt-get -y install apache2

...
想把这个容器作为一个Web服务器来运行，所以要把它当前状态保存下来，就不必每次都创建一个新容器并再次安装Apache。
所以先用
exit
命令退出容器，再运行
docker commit
命令：
$
sudo docker commit
614122
c0aabb aoct/apache2
命令中，指定了要提交的修改过的容器的ID、目标镜像仓库、镜像名。
commit
提交的知识创建容器的镜像与容器的当前状态之间的差异部分，很轻量。
查看新创建的镜像：
$
sudo docker images aoct/apache2
也可以像git一样，在提交镜像时指定更多信息来描述所做的修改：
$ sudo docker commit -m=
'A

new
image'
--author='Aomine' 614122c0aabb aoct/apache2
上面代码，用
-m
指定行创建的镜像的提交信息。
--author
指定镜像作者，接着是容器ID、目标镜像仓库、镜像名。
使用
docker inspect
命令查看新创建的镜像的详细信息：
$
sudo docker inspect aoct/apache2
使用
docker run
命令从刚创建的新镜像运行一个容器：
$ sudo docker
run
-t -i aoct/apache2 /bin/bash

【本人的学习笔记，主要是对《我的第一本Docker书》、《Docker —— 从入门到实践》的学习记录，引用了很多书上的话和例子，并结合其他各种资源的学习。我使用的是windows 7， docker 1.3.2。】

来自

<
https://segmentfault.com/a/1190000002567459
>

已使用 Microsoft OneNote 2016 创建。
