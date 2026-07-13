---
title: 利用Python进行数据分析(7) Pandas基础：Series和DataFrame
date: '2017-08-09'
description: Pandas 数据分析库的两个核心数据结构：Series（一维带索引数组）和 DataFrame（表格型数据结构）的基础概念和操作。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.cnblogs.com/sirkevin/p/5741853.html
---

## pandas 简介

Pandas 是基于 NumPy 的 Python 数据分析包，主要目的是数据分析。提供了大量高级的数据结构和数据处理方法，核心是 Series 和 DataFrame。

## Series

Series 是一个一维数组对象，类似 NumPy 的一维 array。包含一组数据和对应的索引，可理解为带索引的数组。

### 创建 Series

从 Python 列表转换：

```python
import pandas as pd
s = pd.Series([1, 2, 3, 4])
```

从 Python 字典转换：

```python
s = pd.Series({'a': 1, 'b': 2, 'c': 3})
```

指定自定义索引：

```python
s = pd.Series([1, 2, 3, 4], index=['a', 'b', 'c', 'd'])
```

### Series 操作

获取索引和数据：

```python
s.index   # 获取索引
s.values  # 获取数组内容
```

通过索引访问数据，或使用索引数组批量获取。对 Series 的算术运算会保持索引不变。

## DataFrame

DataFrame 是表格型数据结构，提供有序的列和不同类型的列值，类似数据库表或 Excel 电子表格。

### 创建 DataFrame

从 NumPy 数组字典转换：

```python
df = pd.DataFrame({
    'A': np.array([1, 2, 3]),
    'B': np.array([4, 5, 6]),
    'C': np.array([7, 8, 9])
})
```

### DataFrame 操作

指定列的顺序：

```python
df = pd.DataFrame(data, columns=['C', 'A', 'B'])
```

DataFrame 默认按列名首字母顺序排序。若指定的列名不存在，会产生一列 NA 值。

获取数据：

```python
df['column_name']      # 字典索引方式
df.column_name         # 属性访问方式
```

修改列的值或删除某一列：

```python
df['new_column'] = values
del df['column_name']
```
