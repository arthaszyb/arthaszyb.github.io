---
title: Windows 下查看文件 MD5
date: '2014-11-11'
description: 使用 Windows 内置工具 certutil 计算和验证文件的 MD5 哈希值。
category: misc
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

使用 Windows 内置命令 certutil 计算文件的 MD5 哈希值：

```bash
certutil -hashfile yourfilename MD5
```

将 `yourfilename` 替换为实际的文件路径，命令返回该文件的 MD5 哈希值。
