---
title: Bash Shell 字符串切割
date: '2015-04-03'
description: Bash 中字符串切割和参数展开的技巧总结，包括模式匹配、子串截取等用法。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

## 基础示例

```bash
AAA="hello First-of All"
echo ${AAA#*-}     # 输出: of All

AAA=111-222
echo ${AAA%-*}     # 输出: 111
echo ${AAA#*-}     # 输出: 222
```

## 变量匹配切割

```bash
AA="a bc d ef"
BB="d"
echo ${AA%%$BB*}   # 输出: a bc
echo ${AA#*$BB}    # 输出: ef
```

## 子串截取

```bash
AAA=abcdef
echo ${AAA:2}      # 输出: cdef
echo ${AAA: -2}    # 输出: ef
echo ${AAA::2}     # 输出: ab
```

## 实际应用

```bash
value="L(50000:10000)"
FORM_LONG_LEFT_TIME_TALK=$value
FORM_LONG_TIME_TALK=${FORM_LONG_LEFT_TIME_TALK%:*}
FORM_LONG_TIME_TALK=${FORM_LONG_TIME_TALK#*(}
FORM_LONG_TIME_TALK=`expr ${FORM_LONG_TIME_TALK} / 1000`
FORM_LEFT_TIME_TALK=${FORM_LONG_LEFT_TIME_TALK#*:}
FORM_LEFT_TIME_TALK=${FORM_LEFT_TIME_TALK%)*}
FORM_LEFT_TIME_TALK=`expr ${FORM_LEFT_TIME_TALK} / 1000`
```
