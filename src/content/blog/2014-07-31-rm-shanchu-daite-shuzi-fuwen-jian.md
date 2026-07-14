---
title: rm删除带特殊字符的文件
date: '2014-07-31'
description: "当文件名以-或--开头时，rm会误认为是选项参数。使用rm -- 文件名可以告诉rm停止解析选项，后面的参数作为文件名处理。"
category: linux
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

当文件名带 `-` 或 `--` 这样的字符时，`rm` 会误认为是命令选项。使用 `--` 标记来停止选项解析：

```bash
rm -- 文件名
```

例如文件名为 `-h.tgz`：

```bash
# 错误方式（-h被认为是选项）
rm -h.tgz
# 错误：rm: invalid option -- h

# 正确方式
rm -- -h.tgz
```

`--` 表示"停止解析选项"，之后的参数全部按文件名处理。
