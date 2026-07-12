---
title: yum安装出现Segmentation fault错误解决方法
date: '2017-11-21'
description: '2017年11月21日 11:09 网上绝大部分解决方法是什么libz库的版本问题，都是错的。'
category: linux
tags:
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
---
2017年11月21日

11:09

网上绝大部分解决方法是什么libz库的版本问题，都是错的。正确答案是：

解决方法：

rm -rf /var/lib/rpm/\_\_db.\*

rpm --rebuilddb

yum clean all

yum makecache

来自 <[https://serverfault.com/questions/256385/yum-segmentation-fault-in-centos](https://serverfault.com/questions/256385/yum-segmentation-fault-in-centos)\>

大神链接见上面。
