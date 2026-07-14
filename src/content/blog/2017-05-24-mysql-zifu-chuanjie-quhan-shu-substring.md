---
title: "Mysql 字符串截取函数 SUBSTRING 的用法"
date: '2017-05-24'
description: "MySQL 字符串截取函数：LEFT、RIGHT、SUBSTRING、SUBSTRING_INDEX 的使用方法和参数说明。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
origin_url: "http://www.jb51.net/article/27458.htm"
lang: zh
---

## 从左开始截取 - LEFT

```sql
LEFT(str, length)
```

说明：被截取字段，截取长度

例：
```sql
select LEFT(content, 200) as abstract from my_content_t;
```

## 从右开始截取 - RIGHT

```sql
RIGHT(str, length)
```

说明：被截取字段，截取长度

例：
```sql
select RIGHT(content, 200) as abstract from my_content_t;
```

## 按位置截取 - SUBSTRING

```sql
SUBSTRING(str, pos)
SUBSTRING(str, pos, length)
```

说明：
- 第一种格式从字符串 str 返回一个子字符串，起始于位置 pos
- 第二种格式返回长度同 len 字符相同的子字符串，起始于位置 pos
- pos 可以是负值，表示从字符串末尾倒数

例：
```sql
-- 从第 5 个字符开始截取到末尾
select substring(content, 5) as abstract from my_content_t;

-- 从第 5 个字符开始截取 200 个字符
select substring(content, 5, 200) as abstract from my_content_t;

-- 从末尾倒数第 5 个字符开始截取到末尾
select substring(content, -5) as abstract from my_content_t;
```

注意：length 参数不能取负值。

## 按关键字截取 - SUBSTRING_INDEX

```sql
SUBSTRING_INDEX(str, delim, count)
```

说明：被截取字段，关键字，关键字出现的次数（可以是负数表示从右侧倒数）

例：
```sql
-- 截取第 2 个 '.' 之前的所有字符
select SUBSTRING_INDEX("blog.jb51.net", ".", 2) as abstract;
-- 结果：blog.jb51

-- 截取第 2 个 '.'（倒数）之后的所有字符
select SUBSTRING_INDEX("blog.jb51.net", ".", -2) as abstract;
-- 结果：jb51.net

-- 如果找不到关键字，返回整个字符串
select SUBSTRING_INDEX("blog.jb51.net", ".abc", 1) as abstract;
-- 结果：blog.jb51.net
```

## 实际应用

当存储的数据格式中包含多个分隔符分隔的 ID，需要用 SUBSTRING_INDEX 配合 SUBSTRING 分别提取每个 ID。例如在 IN 查询中分别获取两个 ID 值 1 和 2：

```sql
SELECT jl.* 
FROM jl 
WHERE jl.id = (
  SELECT SUBSTRING((
    SELECT user.jlid FROM user WHERE user.id = 1
  ), 1, 1)
)
OR jl.id = (
  SELECT SUBSTRING((
    SELECT user.jlid FROM user WHERE user.id = 1
  ), 3, 1)
)
LIMIT 0, 30;
```
