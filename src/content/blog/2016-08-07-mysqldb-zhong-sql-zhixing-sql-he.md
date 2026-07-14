---
title: MySQLdb中sql执行_sql和_args的注意点
date: '2016-08-07'
description: MySQLdb SQL 执行中，参数占位符 %s 仅能用于值条件，不能用于表名或列名，需用字符串 format 替换。
category: python
tags:
  - mysql
  - python
draft: false
source: evernote-local-db
lang: zh
---
MySQLdb 中 SQL 参数绑定的限制：占位符 `%s` 仅能替代 WHERE 条件等值参数，不能替代表名或列名等结构化元素。

占位符只用于安全传递数据值；表名、列名等需用字符串 format 方法替换：

```python
# 错误：表名不能占位
cursor.execute("SELECT * FROM %s WHERE id = %s", (table_name, user_id))

# 正确：表名用 format，条件值用占位符
sql = "SELECT * FROM {0} WHERE id = %s".format(table_name)
cursor.execute(sql, (user_id,))
```
