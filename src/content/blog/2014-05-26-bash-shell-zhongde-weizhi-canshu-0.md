---
title: Bash 位置参数与特殊参数的含义
date: '2014-05-26'
description: 整理 Bash 中位置参数（$0/$1/$#/$*/$@）和特殊参数（$?/$-/$!/$_/$$）的含义，以及函数退出状态与 return 的用法。内容参考 ABS（Advanced Bash Scripting）。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
origin_url: https://tldp.org/LDP/abs/html/
---
Bash 中常见的特殊符号收集，参考 ABS（Advanced Bash Scripting）中文翻译版第 9 章内部变量。

## 位置参数

- `$0`：当前执行的进程名 / 脚本本身的名字（正则中表示整行输出）
- `$1, $2, ...`：从命令行传给脚本、或传给函数、或赋给变量的位置参数
- `$#`：命令行或位置参数的个数
- `$*`：所有位置参数，被作为一个单词（`"$*"` 必须被引号引用）
- `$@`：与 `$*` 同义，但每个参数都是独立的引用字串，参数被完整传递、不被解释和扩展（`"$@"` 必须被引号引用）

## 其他特殊参数

- `$-`：传给脚本的 flag（使用 `set` 命令）。源自 ksh 后引进 Bash，但在 Bash 中不太可靠
- `$!`：后台运行的最后一个作业的 PID
- `$_`：保存之前执行命令的最后一个参数
- `$?`：命令、函数或脚本的退出状态。用于检查上一个命令是否正确执行（0 表示正确，非 0 表示出错）
- `$$`：脚本自身的进程 ID，常用来构造唯一的临时文件名，比调用 mktemp 简单

## 退出与返回

函数返回一个「退出状态」值，可由 `return` 指定，否则是函数最后一个执行命令的退出状态（0 成功，非 0 出错）。退出状态可在脚本中由 `$?` 引用，使 shell 函数也能像 C 函数一样有「返回值」。

`return` 终止一个函数，可选带一个整数参数作为返回值返回给调用脚本，并赋给 `$?`。

> 注意：函数返回值最大不能超过 255（只占一个字节），且只能返回整数，不能返回字符串。

`while true` 可写为 `while :`。

## 示例：两个数中的最大者

```bash
#!/bin/bash
# max.sh: 两个整数中的最大者

E_PARAM_ERR=-198   # 参数少于 2 个时的返回值
EQUAL=-199         # 两个整数相等的返回值

max2 ()            # 返回两个整数的较大值
{                  # 注意: 参与比较的数必须小于 257
    if [ -z "$2" ]
    then
        return $E_PARAM_ERR
    fi

    if [ "$1" -eq "$2" ]
    then
        return $EQUAL
    else
        if [ "$1" -gt "$2" ]
        then
            return $1
        else
            return $2
        fi
    fi
}

max2 33 34
return_val=$?

if [ "$return_val" -eq $E_PARAM_ERR ]
then
    echo "Need to pass two parameters to the function."
elif [ "$return_val" -eq $EQUAL ]
then
    echo "The two numbers are equal."
else
    echo "The larger of the two numbers is $return_val."
fi

exit 0
```
