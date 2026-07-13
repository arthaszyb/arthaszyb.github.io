---
title: Linux shell if 参数对照表
date: '2014-04-11'
description: Shell 编程中 if 语句的文件测试、字符串比较、算术比较运算符参考表及实例。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

## 基础文件测试参数

- `-b` 当 file 存在并且是块文件时返回真
- `-c` 当 file 存在并且是字符文件时返回真
- `-d` 当 pathname 存在并且是一个目录时返回真
- `-e` 当 pathname 指定的文件或目录存在时返回真
- `-f` 当 file 存在并且是正规文件时返回真
- `-g` 当由 pathname 指定的文件或目录存在并且设置了SGID位时返回为真
- `-h` 当 file 存在并且是符号链接文件时返回真，该选项在一些老系统上无效
- `-k` 当由 pathname 指定的文件或目录存在并且设置了"粘滞"位时返回真
- `-p` 当 file 存在并且是命令管道时返回为真
- `-r` 当由 pathname 指定的文件或目录存在并且可读时返回为真
- `-s` 当 file 存在文件大小大于0时返回真
- `-u` 当由 pathname 指定的文件或目录存在并且设置了SUID位时返回真
- `-w` 当由 pathname 指定的文件或目录存在并且可写时返回真
- `-x` 当由 pathname 指定的文件或目录存在并且可执行时返回真

## 字符串和数值比较

| 操作符 | 说明 | 示例 |
|--------|------|------|
| `-eq` | 等于 | `[ 3 -eq $mynum ]` |
| `-ne` | 不等于 | `[ 3 -ne $mynum ]` |
| `-gt` | 大于 | `[ 3 -gt $mynum ]` |
| `-lt` | 小于 | `[ 3 -lt $mynum ]` |
| `-le` | 小于或等于 | `[ 3 -le $mynum ]` |
| `-ge` | 大于或等于 | `[ 3 -ge $mynum ]` |
| `-z` | 空串 | `[ -z $myvar ]` |
| `-n` | 非空串 | `[ -n $myvar ]` |
| `=` | 两个字符相等 | `[ $myvar = one ]` |
| `!=` | 两个字符不等 | `[ $myvar != one ]` |

## 详细文件比较运算符

| 运算符 | 描述 | 示例 |
|--------|------|------|
| `-e filename` | 文件或目录存在 | `[ -e /var/log/syslog ]` |
| `-d filename` | 目录存在 | `[ -d /tmp/mydir ]` |
| `-f filename` | 常规文件存在 | `[ -f /usr/bin/grep ]` |
| `-L filename` | 符号链接存在 | `[ -L /usr/bin/grep ]` |
| `-r filename` | 文件可读 | `[ -r /var/log/syslog ]` |
| `-w filename` | 文件可写 | `[ -w /var/mytmp.txt ]` |
| `-x filename` | 文件可执行 | `[ -x /usr/bin/grep ]` |
| `filename1 -nt filename2` | filename1 比 filename2 新 | `[ /tmp/etc/services -nt /etc/services ]` |
| `filename1 -ot filename2` | filename1 比 filename2 旧 | `[ /boot/bzImage -ot arch/i386/boot/bzImage ]` |

## 脚本示例

```bash
#!/bin/bash
# This script prints a message about your weight if you give it your
# weight in kilos and height in centimeters.
if [ ! $# == 2 ]; then
echo "Usage: $0 weight_in_kilos length_in_centimeters"
exit
fi
weight="$1"
height="$2"
idealweight=$[$height - 110]
if [ $weight -le $idealweight ] ; then
echo "You should eat a bit more fat."
else
echo "You should eat a bit more fruit."
fi
```

执行例子：

```text
# weight.sh 70 150
You should eat a bit more fruit.
# weight.sh 70 150 33
Usage: ./weight.sh weight_in_kilos length_in_centimeters
```

位置参数 `$1`、`$2` ... `$N`，`$#` 代表了命令行的参数数量，`$0` 代表了脚本的名字。第一个参数代表 `$1`，第二个参数代表 `$2`，以此类推。参数数量的总数存在 `$#` 中。上面的例子显示了怎么改变脚本，如果参数少于或者多余2个来打印出一条消息。

用 `-x` 选项检查脚本的执行情况：

```bash
# bash -x weight.sh 60 170
+ weight=60
+ height=170
+ idealweight=60
+ '[' 60 -le 60 ']'
+ echo 'You should eat a bit more fat.'
You should eat a bit more fat.
```
