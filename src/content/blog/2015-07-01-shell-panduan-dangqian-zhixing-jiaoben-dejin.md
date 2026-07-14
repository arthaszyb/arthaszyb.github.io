---
title: shell判断当前执行脚本的进程数的坑
date: '2015-07-01'
description: 分析 shell 脚本中使用 ps 统计自身进程数时为何会得到 2 而不是 1，以及变量赋值对子进程的影响。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

## 问题

直接用 ps 结合 grep 统计脚本进程数时，得到的结果是 2 而不是 1。

```bash
#!/bin/bash
p=$(/bin/ps -ef | grep -w "$0" | grep -v 'grep' | wc -l)
echo "$p"
```

输出：2

## 原因分析

通过 while true 循环监控发现，这个脚本执行过程中产生了**子进程**。变量赋值 `p=$(...)`时，产生了子进程来执行命令替换。

进一步测试发现：不定义变量 p，直接执行 ps 命令则不会产生子进程。

## 解决方案

改为直接计数，不保存结果：

```bash
#!/bin/bash
ps -ef | grep "$0" | grep -v grep | wc -l
```

以上执行过程不产生额外子进程，输出为 1。

## 变量展开的陷阱

`$p` 和 `"$p"` 的行为不同：

- `echo $p`：结果显示在一行，wc -l 得 1
- `echo "$p"`：多行输出，wc -l 得 2

## 结论

1. 脚本内的命令替换（变量赋值）会产生子进程
2. `$p` 不加引号会将多行结果合并为一行
3. `"$p"` 加引号会保留原有换行符
4. 判断同名脚本进程时需特别注意
