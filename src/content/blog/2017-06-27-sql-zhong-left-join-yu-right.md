---
title: SQL中Left Join、Right Join、Inner Join、Full Join的区别
date: '2017-06-27'
description: 对SQL中四种JOIN操作的类型和执行结果进行对比说明，通过建表示例演示各种JOIN的差异。
category: bigdata
tags:
  - sql-join
draft: false
origin_url: http://blog.csdn.net/shadowyelling/article/details/7684714
source: evernote-local-db
lang: zh
---
SQL中常用的JOIN操作类型及其区别。

## JOIN类型概览

- **LEFT JOIN**：返回左表中所有记录，以及右表中符合连接条件的记录。
- **RIGHT JOIN**：返回右表中所有记录，以及左表中符合连接条件的记录。
- **INNER JOIN**：仅返回两表中都符合连接条件的记录。
- **FULL JOIN**：返回两表中的所有记录（LEFT JOIN + RIGHT JOIN的并集）。

## 示例表结构

创建两个测试表EMP和SAL：

```sql
USE [Test]
GO
CREATE TABLE [dbo].[EMP](
  [ENAME] [nchar](10) COLLATE Chinese_PRC_CI_AS NOT NULL,
  [CITY] [nchar](10) COLLATE Chinese_PRC_CI_AS NULL
) ON [PRIMARY]

CREATE TABLE [dbo].[SAL](
  [ENAME] [nchar](10) COLLATE Chinese_PRC_CI_AS NOT NULL,
  [SALARY] [money] NULL
) ON [PRIMARY]
```

通过在这两表上执行不同的JOIN操作，可以观察各种JOIN方式的结果差异。
