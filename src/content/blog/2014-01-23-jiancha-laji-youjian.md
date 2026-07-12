---
title: 检查垃圾邮件
date: '2014-01-23'
description: '进入anspam的log目录 awk -F"," ''{print $67,$70,$75}'' .log |grep Pass|grep chinaboqi'
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---
进入anspam的log目录
awk -F"," '{print $67,$70,$75}' *.log |grep Pass|grep chinaboqi
