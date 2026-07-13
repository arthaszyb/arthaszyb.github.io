---
title: 内置命令查看CPU的核数
date: '2014-05-08'
description: 使用 Windows 内置命令 wmic 查看 CPU 核心数和逻辑处理器数，区分单核/双核和单线程/多线程。
category: misc
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

CPU 分类：单核单线程、单核超线程、双核单线程、双核超线程。使用 Windows 内置命令查看核心数和逻辑处理器数。

![](/images/legacy/legacy-361d886d95.jpg)

## 查看方法

打开命令提示符（cmd），运行 wmic，然后输入：

```bash
cpu get *
```

输出中查看 `numberofcores` 和 `numberoflogicalprocessors` 两个字段，分别表示核心数和逻辑处理器数。

![](/images/legacy/legacy-acdc5beddf.jpg)

![](/images/legacy/legacy-619c8eb7bb.jpg)

## 对照表

![](/images/legacy/legacy-ddb8d06225.jpg)
