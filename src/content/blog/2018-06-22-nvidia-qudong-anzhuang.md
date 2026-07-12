---
title: NVIDIA驱动安装
date: '2018-06-22'
description: >-
  yum insall kernel-headers gcc
  https://buildlogs.centos.org/c7.1511.00/kernel/20151119220809/$(uname
  -r)/kernel-devel-3.10.0-327.el7.x8664.rpm yum localinstall
category: ai
tags:
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
---
yum insall
kernel-headers gcc
```bash
#注意devel包需要与自己机器内核版本一致，否则即使安装了，NVIDIA安装仍然提失败提示找不到devel
wget
```
https://buildlogs.centos.org/c7.1511.00/kernel/20151119220809/$(uname -r)/kernel-devel-3.10.0-327.el7.x86_64.rpm
yum localinstall kernel-devel-3.10.0-327.el7.x86_64.rpm
