---
title: SQL语句中JOIN ON和WHERE用法的区别和联系
date: '2017-07-18'
description: 详细说明SQL中JOIN ON和WHERE条件的执行顺序差异，及其对LEFT JOIN和INNER JOIN查询效率的影响。
category: bigdata
tags:
  - sql-join
draft: false
origin_url: https://my.oschina.net/jun24bryant/blog/787375
source: evernote-local-db
lang: zh
---
JOIN的四种类型：

- **LEFT JOIN**：返回左表所有记录以及右表中连接字段相等的记录。
- **RIGHT JOIN**：返回右表所有记录以及左表中连接字段相等的记录。
- **INNER JOIN**：只返回两表连接字段相等的行。
- **FULL JOIN**：LEFT JOIN + RIGHT JOIN的并集。
- **CROSS JOIN**：笛卡尔积，行数为两表行数的乘积。

## ON和WHERE条件的区别

数据库在JOIN两表时会生成临时表，再将结果返回。

**LEFT JOIN中的ON和WHERE：**

- **ON条件**：在生成临时表时使用，不管条件是否为真，都会返回左表的所有记录。
- **WHERE条件**：在临时表生成后再过滤，条件不为真的行被完全过滤掉，失去了LEFT JOIN的含义。

**INNER JOIN中的ON和WHERE的性能差异：**

将条件放在ON中：
```sql
SELECT * FROM A
INNER JOIN B ON B.ID = A.ID AND B.State = 1
INNER JOIN C ON B.ID = C.ID
```
B表在JOIN时就被过滤，状态不等于1的行不参与后续与C表的联接。

将条件放在WHERE中：
```sql
SELECT * FROM A
INNER JOIN B ON B.ID = A.ID
INNER JOIN C ON B.ID = C.ID
WHERE B.State = 1
```
B表不论状态如何都与C表联接，之后才过滤，查询成本更高。

**结论**：ON条件在联接时过滤，WHERE在联接后过滤。对于需要过滤的字段，使用ON可提高效率。但对简单查询，WHERE的写法更简洁。
