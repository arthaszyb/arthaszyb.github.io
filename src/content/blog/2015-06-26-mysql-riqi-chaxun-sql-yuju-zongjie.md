---
title: "mysql日期查询sql语句总结"
date: '2015-06-26'
description: "MySQL 日期查询常用 SQL 语句：按时间范围查询、查询一天/一周/一个月的数据、使用时间戳函数 UNIX_TIMESTAMP 和 FROM_UNIXTIME。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---

## 日期范围查询

假设日期格式为：2009-2-12、2009-3-3、2009-10-12

```sql
-- 查询 2009-2-3 到 2009-4-3 之间的数据（包含边界）
select * from user where birthday >= '2009-2-3' and birthday <= '2009-4-3';

-- 查询大于等于 2009-2-3 的所有数据
select * from user where birthday >= '2009-2-3';

-- 查询小于等于 2009-2-3 的所有数据
select * from user where birthday <= '2009-2-3';
```

注意：MySQL 中 `>` 包含 `=`，`<` 也包含 `=`，所以不需要额外写 `=` 号。

## 按天查询

```sql
select * from table where to_days(column_time) = to_days(now());
select * from table where date(column_time) = curdate();
```

## 按周查询

```sql
select * from table 
where DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(column_time);
```

## 按月查询

```sql
select * from table 
where DATE_SUB(CURDATE(), INTERVAL 1 MONTH) <= date(column_time);
```

## 时间戳函数

### UNIX_TIMESTAMP()

返回从 '1970-01-01 00:00:00' GMT 开始的秒数。

```sql
-- 无参数，返回当前时间戳
select UNIX_TIMESTAMP();
-- 结果: 882226357

-- 带参数，返回指定日期的时间戳
select UNIX_TIMESTAMP('1997-10-04 22:23:00');
-- 结果: 875996580
```

### FROM_UNIXTIME()

将时间戳转换为指定格式的日期字符串。

```sql
-- 默认格式 YYYY-MM-DD HH:MM:SS
select FROM_UNIXTIME(875996580);
-- 结果: '1997-10-04 22:23:00'

-- 使用 format 参数指定格式
select FROM_UNIXTIME(UNIX_TIMESTAMP(), '%Y %D %M %h:%i:%s %x');
-- 结果: '1997 23rd December 03:43:30 x'

-- 转换为数字形式
select FROM_UNIXTIME(875996580) + 0;
-- 结果: 19971004222300
```

## 字符集转换

在 MySQL 中通过 UNIX_TIMESTAMP 函数把 date 类型数据转换成 unix timestamp 形式的整形数字：

```sql
select UNIX_TIMESTAMP('2006-02-28') as testdate;
```
