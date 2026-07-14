---
title: Linux shell 时间运算以及时间差计算方法
date: '2014-04-17'
description: Shell 中进行时间加减运算和时间差计算的方法。通过时间戳和秒数进行转换计算。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

最近一段时间在处理 Shell 脚本时遇到时间的处理问题：时间的加减，以及时间差的计算。

## 时间加减

处理方法是将基础的时间转变为时间戳，然后把需要增加或改变的时间转成秒。

例：1990-01-01 01:01:01 加上 1 小时 20 分

**a. 将基础时间转为时间戳**

```bash
time1=$(date +%s -d '1990-01-01 01:01:01')
echo $time1
# 631126861 【时间戳】
```

**b. 将增加时间变成秒**

```bash
[root@localhost ~]# time2=$((1*60*60+20*60))
[root@localhost ~]# echo $time2
# 4800
```

**c. 两个时间相加，计算出结果时间**

```bash
time1=$(($time1+$time2))
time1=$(date +%Y-%m-%d\ %H:%M:%S -d "1970-01-01 UTC $time1 seconds");
echo $time1
# 1990-01-01 02:21:01
```

## 时间差计算方法

例：2010-01-01 与 2009-01-01 11:11:11 的时间差

原理：同样转成时间戳，然后计算天、时、分、秒

```bash
time1=$(($(date +%s -d '2010-01-01') - $(date +%s -d '2009-01-01 11:11:11')));
echo time1
# 将 time1 / 60 得到秒数换成分钟
# 将结果 / 60 得到分钟换成小时
# 以此类推
```

## 补充说明

**shell 单括号运算符**

```bash
a=$(date);
# 等同于：
a=`date`;
```

**双括号运算符**

```bash
a=$((1+2));
echo $a;
# 等同于：
a=`expr 1 + 2`
```
