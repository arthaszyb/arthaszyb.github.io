---
title: Linux shell 中的逻辑关系表达方式
date: '2014-05-22'
description: 总结 shell 中逻辑与、逻辑或的两种写法：test 内置的 -a/-o 选项，以及用 && / || 连接多个 test 表达式。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---
总结一下 Linux shell 中逻辑关系的表达方式。

**逻辑与**：

```bash
if [ $xxx = a -a $xx = b ]        # 用 test 的 -a 选项
if [ $xxx = a ] && [ $xx = b ]    # 用 && 连接两个 test
```

**逻辑或**：

```bash
if [ $xxx = a -o $xx = b ]        # 用 test 的 -o 选项
if [ $xxx = a ] || [ $xx = b ]    # 用 || 连接两个 test
```
