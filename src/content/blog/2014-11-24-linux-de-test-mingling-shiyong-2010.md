---
title: Linux test 命令使用
date: '2014-11-24'
description: Linux test 命令的完整选项速查：文件类型与权限侦测、文件新旧比较、整数与字符串判定、多重条件组合。
category: linux
tags:
  - shell-scripting
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---
![](/images/legacy/legacy-fb72efeb28.jpg)

`test` 命令用于各类条件侦测，是 shell 脚本里最常用的判断工具。

## 1. 文件类型侦测（是否存在）

如 `test -e filename`：

- `-e` 该文件名是否存在？（常用）
- `-f` 是否为文件（file）？（常用）
- `-d` 是否为目录（directory）？（常用）
- `-b` 是否为一个 block device 装置？
- `-c` 是否为一个 character device 装置？
- `-S` 是否为一个 Socket 文件？
- `-p` 是否为一个 FIFO（pipe）文件？
- `-L` 是否为一个连结档？

## 2. 文件权限侦测

如 `test -r filename`：

- `-r` 是否具有『可读』属性？
- `-w` 是否具有『可写』属性？
- `-x` 是否具有『可执行』属性？
- `-u` 是否具有『SUID』属性？
- `-g` 是否具有『SGID』属性？
- `-k` 是否具有『Sticky bit』属性？
- `-s` 是否为『非空白文件』？

## 3. 两个文件之间的比较

如 `test file1 -nt file2`：

- `-nt`（newer than）判断 file1 是否比 file2 新
- `-ot`（older than）判断 file1 是否比 file2 旧
- `-ef` 判断两文件是否指向同一个 inode（可用于 hard link 判定）

## 4. 两个整数之间的判定

如 `test n1 -eq n2`：

- `-eq` 两数值相等（equal）
- `-ne` 两数值不等（not equal）
- `-gt` n1 大于 n2（greater than）
- `-lt` n1 小于 n2（less than）
- `-ge` n1 大于等于 n2（greater than or equal）
- `-le` n1 小于等于 n2（less than or equal）

## 5. 字符串判定

- `test -z string` 判定字符串是否为空，若为空则为 true
- `test -n string` 判定字符串是否非空，若为空则为 false（`-n` 可省略）
- `test str1 = str2` 判定 str1 是否等于 str2，相等回传 true
- `test str1 != str2` 判定 str1 是否不等于 str2

## 6. 多重条件判定

如 `test -r filename -a -x filename`：

- `-a`（and）两状况同时成立。如 `test -r file -a -x file`，file 同时具有 r 与 x 权限时才回传 true
- `-o`（or）两状况任一成立。如 `test -r file -o -x file`，file 具有 r 或 x 权限就回传 true
- `!` 反相状态。如 `test ! -x file`，当 file 不具有 x 时回传 true
