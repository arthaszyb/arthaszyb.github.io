---
title: 共享内存
date: '2014-05-29'
description: 清除共享内存和查询共享内存信息的命令。
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

**清除共享内存**

```bash
ipcrm -M key
```

**通过共享内存查询进程信息**

```bash
ipcs -m -i shmid
```

![](/images/legacy/legacy-c4413e05c8.png)
