---
title: 字符串截取
date: '2015-04-30'
description: Bash 字符串截取的各种方法，包括从开头/末尾删除、子串提取、长短匹配等。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
origin_url: http://hi.chinaunix.net/?20535598/viewspace-42324
---

Bash 字符串截取技巧整理。

## 从开头截取

使用 `#` 删除最短匹配，`##` 删除最长匹配：

```bash
MYVAR=foodforthought.jpg
echo ${MYVAR##*fo}    # 输出: rthought.jpg （最长匹配删除）
echo ${MYVAR#*fo}     # 输出: odforthought.jpg （最短匹配删除）
```

**记忆法**：`#` 在 `$` 左边（键盘上），代表从字符串开始处删除。`##` 比 `#` 长，用于最长匹配。

## 从末尾截取

使用 `%` 删除最短匹配，`%%` 删除最长匹配：

```bash
MYFOO="chickensoup.tar.gz"
echo ${MYFOO%%.*}     # 输出: chickensoup （最长匹配删除）
echo ${MYFOO%.*}      # 输出: chickensoup.tar
```

**记忆法**：`%` 在键盘上，用于从字符串末尾删除。

## 按位置和长度提取

```bash
EXCLAIM=cowabunga
echo ${EXCLAIM:0:3}   # 输出: cow （从第 0 位开始，取 3 字符）
echo ${EXCLAIM:3:7}   # 输出: abunga
```

## 实际应用

```bash
file="/data/download/DD0C17E310DDB4143CEAA584DA0917BEBD4FFD1800000000"
echo ${file%/*}       # 输出: /data/download （路径）
echo ${file##*/}      # 输出: DD0C17E310DDB4143CEAA584DA0917BEBD4FFD1800000000 （文件名）
```
