---
title: Python 函数参数笔记
date: '2014-11-06'
description: Python 函数参数类型，包括位置参数、*args（可变参数）、**kwargs（关键字参数）的区别和用法。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
---

## 函数参数类型

函数返回值取决于参数定义：

- 无前缀：返回单值
- `*变量`：返回元组
- `**变量`：返回字典（需传入 key=value 格式）

## 示例

**使用 **kwargs（关键字参数）**

```python
>>> def add1(**x):
...     return x
>>> add1(1,23,232321)
Traceback (most recent call last):
  File "<pyshell#73>", line 1, in <module>
TypeError: add1() takes 0 positional arguments but 3 were given
>>> add1(a=23,b=22)
{'a': 23, 'b': 22}
```

**使用 *args（可变位置参数）**

```python
>>> def add1(*x):
...     return x
>>> add1(1,23,4)
(1, 23, 4)
```
