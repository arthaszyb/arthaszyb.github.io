---
title: Python 字符串格式化两种方式
date: '2015-07-01'
description: Python 中字符串格式化的两种方式对比，百分号（%）格式和 format() 方法的用法和差异。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
---

## 基本示例

```python
>>> hi='yaung'
>>> ih='zhou'
>>> print "this is {0}".format(hi)
```

输出：

```
this is yaung
```

## 方式对比

**方式一：百分号（%）格式**

```python
>>> print 'this is %s' % (hi)
this is yaung
>>> print 'this is %s %s' % (ih,hi)
this is zhou yaung
```

**方式二：format() 方法**

```python
>>> print 'this is {1} {0}'.format(hi,ih)
this is zhou yaung
```

## 特殊情况：字符串中的 % 符号

如果字符串本身包含 % 字符，使用百分号格式时需要转义（用两个 %）：

```python
>>> print 'i have 100% %s name' % 'english'
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: not all arguments converted during string formatting

# 解决方案：% 转义
>>> print 'i have 100%% %s name' % 'english'
i have 100% english name

# 或者用 format() 方法避免
>>> print 'i have 100% {0} name'.format('english')
i have 100% english name
```
