---
title: 更友好的显示当前的系统挂载
date: '2013-12-31'
description: "使用 mount 和 column 以表格形式显示系统挂载点，使用 du 命令显示目录大小，可调整深度查看多级目录。"
category: shell
tags:
  - shell-scripting
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

以表格形式显示系统挂载点，比直接调用 `mount` 更清晰：

```bash
mount | column -t
```

`column -t` 按制表符对齐，形成表格格式。

## 显示目录大小

显示目录下一级子目录的大小信息：

```bash
du -h --max-depth=1
```

其中：
- `-h`：以人类可读的格式（KB、MB、GB）显示大小
- `--max-depth=1`：只显示一级子目录，改为 2 则进一步显示下一级目录

