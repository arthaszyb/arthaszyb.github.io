---
title: "使用dockefile创建镜像问题记录"
date: 2018-01-15 03:13:56 +0000
categories: ["docker"]
tags: ["Pages"]
description: "使用 dockefile 创建镜像问题记录 2018 年 1 月 15 日 11:13 tail /var/log/message 可以看到有如下错误： docker: [error] mount.go:12 [warning]: couldn’t run auplink before unmount: exec: “"
source: "evernote-local-db"
---

使用
dockefile
创建镜像问题记录
2018
年
1
月
15
日
11:13
tail

/var/log/message
可以看到有如下错误：
docker: [error] mount.go:12 [warning]: couldn’t run auplink before unmount: exec: “auplink”: executable file not found
in $PATH
这是因为低版本
docker
缺失了
aufs-tools
的依赖。需要自己安装下：
yum install aufs-util

安装完后再执行发现还是这个错误，继续
log
看，错误变成了

已使用 Microsoft OneNote 2016 创建。
