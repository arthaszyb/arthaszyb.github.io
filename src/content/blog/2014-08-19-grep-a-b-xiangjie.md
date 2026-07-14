---
title: grep -A -B详解
date: '2014-08-19'
description: grep 命令的 -A 和 -B 参数用法说明，用于显示匹配行前后的上下文。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

grep -A 和 -B 参数用于显示匹配行的前后上下文：

- `grep -A10 "colume" file`：显示关键字和之后的 10 行
- `grep -B10 "colume" file`：显示关键字和之前的 10 行
- `grep -C10 "colume" file`：显示关键行和前后各 10 行
