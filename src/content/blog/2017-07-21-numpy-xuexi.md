---
title: NumPy 学习笔记
date: '2017-07-21'
description: NumPy 基础操作笔记，包括数组定义和列操作。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
---

## 定义数组

将 list 或 tuple 转化为 NumPy 数组：

```python
a = np.array([1, 2, 3, 4])
```

## 增加列

给数组增加新的一列，使用 `c_` 连接两个数组：

```python
c = np.c_[list_a, arry_b]
```
