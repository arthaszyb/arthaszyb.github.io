---
title: yum 下载远程源上的 rpm 包
date: '2013-11-07'
description: "使用 yumdownloader 工具从远程 yum 源下载 rpm 包，支持已安装和未安装的包，可自动解决依赖。"
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

使用 `yumdownloader` 工具从 yum 源下载 rpm 包到本地。

**未安装过的包**，直接下载：

```bash
yumdownloader 包名
```

**已安装的包或需要解决依赖**，加 `--resolve` 参数自动下载依赖包：

```bash
yumdownloader --resolve 包名
```

包文件默认下载到当前目录。
