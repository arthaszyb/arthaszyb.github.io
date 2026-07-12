---
title: 今天总结一下linux shell中逻辑关系表达方式。
date: '2014-05-22'
description: >-
  今天总结一下 linux shell中逻辑关系表达方式。  逻辑与的表达： 1）、if [ $xxx=a -a $xx=b ] 2）、 if [
  $xxx=a ] & & [ $xx=b ] 逻辑或的表达： 1）、if [ $xxx=a -o $xx=b ] 2）、 if [ $xxx=a ] ||
  [ $xx=b ]
category: shell
tags: []
draft: false
source: evernote-local-db
lang: zh
---
今天总结一下
linux
shell中逻辑关系表达方式。
逻辑与的表达：
1）、if [ $xxx=a -a $xx=b ]
2）、
if [ $xxx=a ]
&
&
[ $xx=b ]
逻辑或的表达：
1）、if [ $xxx=a -o $xx=b ]
2）、
if [ $xxx=a ] || [ $xx=b ]
