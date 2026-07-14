---
title: AWK 笔记
date: '2013-08-07'
description: AWK 的分隔符和内建变量使用。包括 RS/ORS（记录分隔符）、FS/OFS（字段分隔符）、NR/FNR/NF 等变量的详解和实例。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

## 记录和字段分隔符

### RS/ORS（记录分隔符）

`RS` 是记录分隔符，默认为 `\n`（换行）。`ORS` 是输出记录分隔符。

示例文件：

```text
1234 323123
4321 321321
66661234 124213
```

使用 `2` 作为记录分隔符：

```bash
$ awk 'BEGIN{RS="2"}{print $0}' 7.txt
1
34 3
31
3
43
1 3
13
1
66661
34 1
4
13
```

修改输出分隔符为 `--`：

```bash
$ awk 'BEGIN{ORS="--"}{print $0}' 7.txt
1234 323123--4321 321321--66661234 124213--
```

### FS/OFS（字段分隔符）

`FS` 是字段分隔符（列分隔符），默认为制表符。`OFS` 是输出字段分隔符。

使用 `2` 作为字段分隔符：

```bash
$ awk 'BEGIN{FS="2"}{print $1,$2,$3}' 7.txt
1 34 3 31
43 1 3 13
66661 34 1 4
```

修改输出字段分隔符为 `--`：

```bash
$ awk 'BEGIN{OFS="--"}{print $1,$2,$3}' 7.txt
1234--323123--
4321--321321--
66661234--124213--
```

## 内建变量：NR、FNR、NF

### 定义

- **NR**：Number of Record，从 AWK 开始执行后，按照记录分隔符读取的数据次数。在处理多个文件时累加。
- **FNR**：File Number of Record，处理新文件时从 1 开始计数。
- **NF**：Number of Field，当前记录被分割的字段数。

### 示例文件

class1：
```text
zhaoyun 85 87
guanyu 87 88
liubei 90 86
```

class2：
```text
caocao 92 87 90
guojia 99 96 92
```

### 使用 NR（全局行号）

```bash
$ awk '{print NR,$0}' class1 class2
1 zhaoyun 85 87
2 guanyu 87 88
3 liubei 90 86
4 caocao 92 87 90
5 guojia 99 96 92
```

### 使用 FNR（文件内行号）

```bash
$ awk '{print FNR,$0}' class1 class2
1 zhaoyun 85 87
2 guanyu 87 88
3 liubei 90 86
1 caocao 92 87 90
2 guojia 99 96 92
```

### 结合 FILENAME 和 NF

```bash
$ awk '{print FILENAME,"NR="NR,"FNR="FNR,"$"NF"="$NF}' class1 class2
class1 NR=1 FNR=1 $3=87
class1 NR=2 FNR=2 $3=88
class1 NR=3 FNR=3 $3=86
class2 NR=4 FNR=1 $4=90
class2 NR=5 FNR=2 $4=92
```

class1 有 3 个字段，class2 有 4 个字段。`$NF` 获取最后一个字段。

## 实用命令

### 复制文件（不覆盖已存在文件）

```bash
awk 'BEGIN { cmd="cp -i A/* B/"; print "n" |cmd; }'
```

### 获取除第一列外的所有列

```bash
awk '{$1="";print}'
```

### 查看 TCP 各状态的连接数

```bash
netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
```
