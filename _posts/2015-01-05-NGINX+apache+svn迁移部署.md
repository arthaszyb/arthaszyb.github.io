---
title: "NGINX+apache+svn迁移部署"
date: 2015-01-05 11:28:13 +0000
categories: ["Nginx [2]"]
tags: ["Pages"]
description: "Monday, January 5, 2015 11:28 AM 过程 1.cp svn的目录，apache配置文件 1.5. 部署svn 2.yum install mod_dav_svn .会在/etc/httpd/modules/生成apache需要的两个模块文件mod_dav_svn.so和mod_authz_"
source: "evernote-local-db"
---

NGINX+apache+svn迁移部署
Monday, January 5, 2015
11:28 AM
过程
1.cp svn的目录，apache配置文件
1.5. 部署svn

2.yum install mod_dav_svn .会在/etc/httpd/modules/生成apache需要的两个模块文件mod_dav_svn.so和mod_authz_svn.so
3.编译部署apache（--enable-dav --enable-so）。启动apache。这时应该可以访问svn页面
4.部署nginx，配置反向代理。
遇到的问题
1.现象nginx代理失败404。
原因：listen 80 必须改为listen IP:80
2.
原因：nginx,apache和svn目录的用户权限需要保持一致。

3.svn迁移后，对新库进行恢复操作出现如下错误：
Couldn’t perform atomic initialization
解决方法：
rm 原来建的库，重新建，带上一个参数
svnadmin create --fs-type fsfs

--pre-1.6-compatible

/PATH/TO/REPO

nginx配置

已使用 Microsoft OneNote 2016 创建。
