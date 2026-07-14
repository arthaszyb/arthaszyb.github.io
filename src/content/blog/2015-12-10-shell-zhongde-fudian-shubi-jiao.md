---
title: shell中的浮点数比较
date: '2015-12-10'
description: Shell 中使用 bc 命令进行浮点数比较的方法，解决整数比较命令不支持小数的问题。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
origin_url: http://bbs.chinaunix.net/thread-1093131-1-1.html
---

Shell 的 `[ ]` 整数比较不支持浮点数。例如：

```bash
mya=5.7
if [ $mya -le 4 ]; then echo "ok"; else echo "fail"; fi
```

报错：`integer expression expected`

## 解决方案：使用 bc 命令

bc 是计算器工具，支持浮点运算。用 bc 的结果判断：

```bash
mya=5.7
if [ $(echo "$mya <= 4" | bc) = 1 ]; then
  echo "ok"
else
  echo "fail"
fi
```

bc 在浮点数比较时返回 1（真）或 0（假），适合用在条件判断中。

## 提取浮点数示例

从 df 命令输出中提取磁盘大小（如 5.7G）：

```bash
mya=`df -h | grep xvda2 | awk '{print $2}' | sed 's/G//'`
# 结果：5.7
```

然后使用上述 bc 方法进行比较。
