---
title: Linux top命令输出导入到文件
date: '2015-12-11'
description: '使用 top -b -n 1 命令获取系统 CPU 和内存负载信息并写入文件，避免实时刷新问题。'
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---
在 bash 下获取 top 输出导入文件的几个方法。

**使用 -b 和 -n 参数**

```bash
top -b -n 1 > a
```

参数说明：
- `-b`：Batch-mode，这样可以发送信息到文件
- `-n 1`：表示输出1个循环的信息

**或使用 col 过滤**

```bash
top | col -b > a
```

**使用 vmstat 查看系统负载（以秒为频率）**

```bash
vmstat 1 >> a.txt
```

以 1 秒钟一条的频率输出磁盘、内存、CPU 等信息。
