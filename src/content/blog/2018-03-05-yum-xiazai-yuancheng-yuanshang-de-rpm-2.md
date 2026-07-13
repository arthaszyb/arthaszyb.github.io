---
title: yum 下载远程源上的 RPM 包
date: '2018-03-05'
description: "用 yumdownloader 命令从远程 yum 源下载 RPM 包，支持自动解析依赖关系。"
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

用 `yumdownloader` 从远程 yum 源下载 RPM 包。

未安装过的包，直接下载：

```bash
yumdownloader packagename
```

已安装的包，或需要自动解析依赖关系，加 `--resolve` 参数：

```bash
yumdownloader --resolve packagename
```

包会下载到当前目录。
