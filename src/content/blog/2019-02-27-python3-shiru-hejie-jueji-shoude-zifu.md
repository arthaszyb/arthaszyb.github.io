---
title: Python3 如何解决字符编码问题
date: '2019-02-27'
description: Python3 的关键改进是解决了 Python2 中字符串与编码的问题。默认使用 UTF-8，区分 str（文本）和 bytes（二进制），提供清晰的 encode/decode 转换方法。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
---

Python3 最重要的改进之一是解决了 Python2 中字符编码的大坑。

## Python2 的问题

- 使用 ASCII 码作为默认编码，对中文处理不友好
- 将字符串分为 unicode 和 str 两种类型，容易误导开发者

## Python3 的改进

### 默认编码为 UTF-8

```python
>>> import sys
>>> sys.getdefaultencoding()
'utf-8'
```

### str 和 bytes 区分

文本字符使用 `str` 类型（可表示 Unicode 字符集所有字符），二进制数据使用 `bytes` 类型。

**str 类型**：

```python
>>> a = "a"
>>> type(a)
<class 'str'>
>>> b = "禅"
>>> type(b)
<class 'str'>
```

**bytes 类型**：在字符引号前加 `b` 表示字节序列，只能包含 ASCII 字符和十六进制字符：

```python
>>> c = b'a'
>>> type(c)
<class 'bytes'>
>>> d = b'\xe7\xa6\x85'  # UTF-8 编码的 "禅"
>>> type(d)
<class 'bytes'>
```

bytes 不能包含非 ASCII 字符（如中文）：

```python
>>> e = b'禅'
SyntaxError: bytes can only contain ASCII literal characters.
```

### bytes 操作

bytes 支持分片、索引、基本运算，但 str 与 bytes 不能直接相加：

```python
>>> b"a" + b"c"
b'ac'
>>> b"a" * 2
b'aa'
>>> b"abcdef\xd6"[1:]
b'bcdef\xd6'
>>> b"abcdef\xd6"[-1]
214
>>> b"a" + "b"
TypeError: can't concat bytes to str
```

## Python2 vs Python3 对比

| Python2 | Python3 | 表现 | 转换方法 | 用途 |
|---------|---------|------|---------|------|
| str | bytes | 字节 | encode | 存储 |
| unicode | str | 字符 | decode | 显示 |

## encode 与 decode

### encode：字符 → 字节

负责将字符转换为字节（编码）。默认使用 UTF-8：

```python
>>> s = "Python之禅"
>>> s.encode()
b'Python\xe4\xb9\x8b\xe7\xa6\x85'
>>> s.encode("gbk")
b'Python\xd6\xae\xec\xf8'
```

### decode：字节 → 字符

负责将字节转换为字符（解码）。默认使用 UTF-8：

```python
>>> b'Python\xe4\xb9\x8b\xe7\xa6\x85'.decode()
'Python之禅'
>>> b'Python\xd6\xae\xec\xf8'.decode("gbk")
'Python之禅'
```
