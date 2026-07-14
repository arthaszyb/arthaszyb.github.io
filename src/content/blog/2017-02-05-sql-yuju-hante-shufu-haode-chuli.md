---
title: sql语句含特殊符号的处理
date: '2017-02-05'
description: "SQL 语句中含有特殊符号（引号、逗号）时的转义方法：在字符串中使用两个符号表示一个符号。"
category: database
tags:
  - mysql
  - python
draft: false
source: evernote-local-db
lang: zh
---

SQL 语句中含有特殊符号时需要转义。

## 转义规则

- 含有逗号时，写成两个逗号 `,,`
- 含有单引号时，写成两个单引号 `''`

## Python 例子

```python
country = content.get('data').get('country', 'unknow').replace("'", "''").replace(",", ",,")
prov = content.get('data').get('province', 'unknow').replace("'", "''").replace(",", ",,")
city = content.get('data').get('city', 'unknow').replace("'", "''").replace(",", ",,")
oper = content.get('data').get('oper', 'unknow').replace("'", "''").replace(",", ",,")
```

在构建 SQL INSERT 语句前，使用 `replace()` 方法将输入数据中的特殊符号转义，这样可以避免 SQL 语法错误。
