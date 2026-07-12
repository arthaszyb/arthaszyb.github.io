---
title: NVIDIA驱动安装
date: '2018-06-22'
description: 在CentOS 7上安装NVIDIA GPU驱动的步骤，包括安装必需的内核开发包和驱动程序包。
category: ai
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---
安装NVIDIA驱动需要先准备内核开发环境，然后下载并安装相应版本的驱动包。

```bash
yum install kernel-headers gcc
```

下载与当前内核版本匹配的kernel-devel包。注意devel包需要与机器内核版本一致，否则NVIDIA驱动安装会提示找不到devel：

```bash
wget https://buildlogs.centos.org/c7.1511.00/kernel/20151119220809/$(uname -r)/kernel-devel-3.10.0-327.el7.x86_64.rpm
```

安装下载的devel包：

```bash
yum localinstall kernel-devel-3.10.0-327.el7.x86_64.rpm
```
