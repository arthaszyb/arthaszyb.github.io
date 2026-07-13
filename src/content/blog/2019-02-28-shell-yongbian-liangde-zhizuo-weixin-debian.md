---
title: shell用变量的值作为新的变量名
date: '2019-02-28'
description: 使用 eval 命令将变量的值用作新的变量名，实现间接引用的技巧。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
origin_url: https://blog.csdn.net/qinyushuang/article/details/44115531
---

使用 eval 命令可以实现以变量的值作为新的变量名。

## 示例

```bash
#!/bin/bash
name=yushuang
var=name
# 要获取到 yushuang 的值
res=`eval echo '$'$var`
echo $res
```

## 执行步骤

1. `"$var"` 替换为 `name`
2. `echo '$'"$var"` 变成 `echo '$name'`
3. `eval $name` 执行后得到 `yushuang`

通过 eval 的二次替换，实现了间接引用变量。
