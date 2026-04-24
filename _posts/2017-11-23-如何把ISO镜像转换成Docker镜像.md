---
title: "如何把ISO镜像转换成Docker镜像"
date: 2017-11-23 03:23:27 +0000
categories: ["docker"]
tags: ["Pages"]
description: "最近开始研究docker，如果想要自己创建个镜像，必须从Docker Hub上面获取一个基础镜像来创建；对于我们公司是定制的ISO，我就在想有没有办法把ISO转换成Docker格式，然后上传到Docker Hub上作为基础镜像使用。 参考文章： http://www.aboutdebian.com/tar-backup"
source: "evernote-local-db"
---

如何把ISO镜像转换成Docker镜像
最近开始研究docker，如果想要自己创建个镜像，必须从Docker Hub上面获取一个基础镜像来创建；对于我们公司是定制的ISO，我就在想有没有办法把ISO转换成Docker格式，然后上传到Docker Hub上作为基础镜像使用。
参考文章：
http://www.aboutdebian.com/tar-backup.htm
0x01 准备阶段
首先，在一台虚拟机中安装好需要转换的ISO镜像，本文以CentOS 7.1为例；
其次，进入装好的系统，到根目录下面我们可以看到如下文件夹
其中/proc、/sys、/run、/dev这几个目录都是系统启动时自动生成的，虽然也属于文件系统一部分，但是他们每次开机都会有变化，所以打包的时候就应该忽略它们。
0x02 打包系统
按照上面参考文章操作也可以，或者直接运行下面命令
1
# tar -cvpf /tmp/system.tar --directory=/ --exclude=proc --exclude=sys --exclude=dev --exclude=run --exclude=boot .
Author：yangfannie.com
命令运行完成后再/tmp目录生成了一个system.tar文件，如果tar文件太大的话，也可以继续压缩成tar.gz格式。
就可以把打包好的文件导入到docker了。
0x03 导入docker
tar文件导入到docker方法很多，下面两种办法测试了都可以
导入成功后，接下去就可以运行容器了
1
# docker run -t -i centos:7.1 /bin/bash
Author：yangfannie.com
镜像做好之后就可以push到docker hub上了，不过我发现做好的镜像还是挺大的有1.4G，这样push的时候就会很慢很慢。

来自

<
http://yangfannie.com/1267.html
>

已使用 Microsoft OneNote 2016 创建。
