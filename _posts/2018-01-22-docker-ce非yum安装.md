---
title: "docker-ce非yum安装"
date: 2018-01-22 02:50:41 +0000
categories: ["docker"]
tags: ["Pages"]
description: "docker-ce 非 yum 安装 2018 年 1 月 22 日 10:50 一 直接 2 进制安装。 docker 官网可以看到只提供 yum 方式，但是通过分析可以找出其中的源，进入源把需要的 tgz 包下载下来， rz 到机器。 解压后生成一个 docker 目录，里面全是 2 进制文件。 cp -a * /"
source: "evernote-local-db"
---

docker-ce
非
yum
安装
2018
年
1
月
22
日
10:50
一

直接
2
进制安装。
docker
官网可以看到只提供
yum
方式，但是通过分析可以找出其中的源，进入源把需要的
tgz
包下载下来，
rz
到机器。
解压后生成一个
docker
目录，里面全是
2
进制文件。
cp -a * /usr/bin/
nohup

dockerd -H tcp://0.0.0.0:4243 -H unix:///var/run/docker.sock --selinux-enabled=false --log-opt max-size=1g

&

完成服务启动

二

脚本安装
/
官方安装

其实都是
yum
安装，需要好的公网，
IDC
没成功过

已使用 Microsoft OneNote 2016 创建。
