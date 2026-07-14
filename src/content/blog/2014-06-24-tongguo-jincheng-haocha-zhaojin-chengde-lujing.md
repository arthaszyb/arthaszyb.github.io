---
title: 通过进程号查找进程的路径
date: '2014-06-24'
description: 查看 /proc/PID/exe 的符号链接可得知进程的绝对路径。
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

许多进程只能看到相对路径，要知道绝对路径可通过查看 `/proc/PID` 中的 `exe` 符号链接：

```bash
ll /proc/24331/
```

![](/images/legacy/legacy-d34f4843e8.png)![](/images/legacy/legacy-81b934d909.png)
