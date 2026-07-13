---
title: 用 # 计算字符串长度的注意点
date: '2014-05-27'
description: shell 中用 ${#var} 求字符串长度得到的是真实字符数，而 echo 字符串管道到 wc -c 会因末尾换行多算一个字符。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---
在 shell 中用 `${#变量}` 求字符串长度：`iloveu` 输出 6（真实字符数）。

而 `echo iloveu | wc -c` 输出 7，是因为 `echo` 在末尾补了换行符，`wc -c` 把它也算进去了，所以这种方式算长度不准确。
