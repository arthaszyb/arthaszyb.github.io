---
title: shell 特殊变量与操作速查表
date: '2014-05-06'
description: 整理 Bash 的特殊变量、测试操作符、文件类型测试、参数替换与字符串操作的速查表，内容源自 ABS（Advanced Bash Scripting Guide）附录。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
origin_url: https://tldp.org/LDP/abs/html/
---
源自 ABS（Advanced Bash Scripting Guide）附录的速查表整理。

## 特殊的 shell 变量

| 变量 | 含义 |
|---|---|
| `$0` | 脚本名字 |
| `$1` | 位置参数 #1 |
| `$2`–`$9` | 位置参数 #2–#9 |
| `${10}` | 位置参数 #10 |
| `$#` | 位置参数的个数 |
| `"$*"` | 所有位置参数（作为单个字符串） |
| `"$@"` | 所有位置参数（每个作为独立字符串） |
| `$?` | 返回值 |
| `$$` | 脚本的进程 ID（PID） |
| `$-` | 传递到脚本中的标志（使用 set） |
| `$_` | 之前命令的最后一个参数 |
| `$!` | 运行在后台的最后一个作业的 PID |

## 测试操作：二元比较

| 算术比较 | 含义 | 字符串比较 | 含义 |
|---|---|---|---|
| `-eq` | 等于 | `=` / `==` | 等于 |
| `-ne` | 不等于 | `!=` | 不等于 |
| `-lt` | 小于 | `<` | 小于（ASCII） |
| `-le` | 小于等于 | `-z` | 字符串为空 |
| `-gt` | 大于 | `-n` | 字符串不为空 |
| `-ge` | 大于等于 | | |

在双中括号 `[[ ... ]]` 测试结构中使用 `<`、`>` 时不需转义。

## 文件类型测试

| 操作 | 测试条件 | 操作 | 测试条件 |
|---|---|---|---|
| `-e` | 文件存在 | `-s` | 文件大小不为 0 |
| `-f` | 是标准文件 | `-d` | 是目录 |
| `-r` | 有读权限 | `-w` | 有写权限 |
| `-x` | 有执行权限 | `-h`/`-L` | 是符号链接 |
| `-b` | 是块设备 | `-c` | 是字符设备 |
| `-p` | 是管道 | `-S` | 是 socket |
| `-g` | 设置了 sgid | `-u` | 设置了 suid |
| `-k` | 设置了粘贴位 | `-t` | 与终端相关联 |
| `-O` | 宿主是你 | `-G` | 组 id 与你相同 |
| `F1 -nt F2` | F1 比 F2 新 | `F1 -ot F2` | F1 比 F2 旧 |
| `F1 -ef F2` | 两者是同一文件的硬链接 | `!` | 反转测试结果 |

## 参数替换和扩展

| 表达式 | 含义 |
|---|---|
| `${var}` | 变量 var 的值，与 `$var` 相同 |
| `${var-DEFAULT}` | var 未声明时以 DEFAULT 为值 |
| `${var:-DEFAULT}` | var 未声明或为空时以 DEFAULT 为值 |
| `${var=DEFAULT}` | var 未声明时以 DEFAULT 为值 |
| `${var:=DEFAULT}` | var 未声明或为空时以 DEFAULT 为值 |
| `${var+OTHER}` | var 声明了则值为 OTHER，否则为 null |
| `${var:+OTHER}` | var 被设置了则值为 OTHER，否则为 null |
| `${var?ERR_MSG}` | var 未声明则打印 ERR_MSG |
| `${var:?ERR_MSG}` | var 未设置则打印 ERR_MSG |
| `${!varprefix*}` / `${!varprefix@}` | 匹配所有以 varprefix 开头声明的变量 |

## 字符串操作

| 表达式 | 含义 |
|---|---|
| `${#string}` | string 的长度 |
| `${string:position}` | 从 position 开始提取子串 |
| `${string:position:length}` | 从 position 提取长度 length 的子串 |
| `${string#substring}` | 从开头删除最短匹配 |
| `${string##substring}` | 从开头删除最长匹配 |
| `${string%substring}` | 从结尾删除最短匹配 |
| `${string%%substring}` | 从结尾删除最长匹配 |
| `${string/substring/replacement}` | 替换第一个匹配 |
| `${string//substring/replacement}` | 替换所有匹配 |
| `${string/#substring/replacement}` | 前缀匹配则替换 |
| `${string/%substring/replacement}` | 后缀匹配则替换 |

## 几个补充

- `$RANDOM` 是 Bash 内部函数，返回 0–32767 的伪随机整数，不应用于产生密钥。`RANDOM=$$` 可用当前进程 ID 作随机数种子。
- `break` 可带参数：`break N` 退出 N 层循环。
- 函数返回值最大不超过 255（只占一个字节），且只能返回整数。
- `case` 可有相同数据，但只匹配第一个出现的；`*)` 类似 default。
