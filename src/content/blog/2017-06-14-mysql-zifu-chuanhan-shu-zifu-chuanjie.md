---
title: "MySQL 字符串函数：字符串截取"
date: '2017-06-14'
description: "MySQL 字符串截取和处理函数参考：LEFT、RIGHT、SUBSTRING、SUBSTRING_INDEX、LENGTH、LOCATE、LPAD、RPAD、LTRIM、RTRIM、TRIM、REPLACE 等函数的用法。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
origin_url: "http://justdo2008.iteye.com/blog/1141609"
lang: zh
---

## 基础截取函数

### LEFT/RIGHT - 从左/右端截取

```sql
select left('sqlstudy.com', 3);              -- 结果: sql
select right('sqlstudy.com', 3);             -- 结果: com
```

### SUBSTRING - 按位置截取

```sql
-- 从第 4 个字符位置开始取，直到结束
select substring('sqlstudy.com', 4);         -- 结果: study.com

-- 从第 4 个字符位置开始，取 2 个字符
select substring('sqlstudy.com', 4, 2);      -- 结果: st

-- 从第 4 个字符位置（倒数）开始取，直到结束
select substring('sqlstudy.com', -4);        -- 结果: .com

-- 从第 4 个字符位置（倒数）开始，取 2 个字符
select substring('sqlstudy.com', -4, 2);     -- 结果: .c
```

注意：在 `SUBSTRING(str, pos, len)` 中，pos 可以是负值，但 len 不能取负值。

### SUBSTRING_INDEX - 按分隔符截取

```sql
-- 截取第 2 个 '.' 之前的所有字符
select substring_index('www.sqlstudy.com.cn', '.', 2);
-- 结果: www.sqlstudy

-- 截取第 2 个 '.'（倒数）之后的所有字符
select substring_index('www.sqlstudy.com.cn', '.', -2);
-- 结果: com.cn

-- 如果找不到分隔符，返回整个字符串
select substring_index('www.sqlstudy.com.cn', '.coc', 1);
-- 结果: www.sqlstudy.com.cn
```

## 字符信息函数

### ASCII - 返回字符的 ASCII 码

```sql
select ASCII('2');  -- 结果: 50
```

### CHAR - 将 ASCII 码转换为字符

```sql
select CHAR(77, 121, 83, 81, NULL);  -- 结果: MySQ
```

### LENGTH - 字符串长度

```sql
select length('text');  -- 结果: 4
```

## 字符串搜索函数

### LOCATE/INSTR - 查找子字符串位置

```sql
-- LOCATE 返回子串在字符串中第一个出现的位置，从位置 pos 开始
select LOCATE('bar', 'foobarbar');        -- 结果: 4
select LOCATE('bar', 'foobarbar', 5);     -- 结果: 7
select LOCATE('xbar', 'foobar');          -- 结果: 0

-- INSTR 作用相同，参数顺序相反
select INSTR('foobarbar', 'bar');         -- 结果: 4
```

## 字符串填充和修剪函数

### LPAD/RPAD - 左/右填充

```sql
select LPAD('hi', 4, '??');  -- 结果: ??hi
select RPAD('hi', 5, '?');   -- 结果: hi???
```

### LTRIM/RTRIM/TRIM - 去除空格

```sql
select LTRIM(' barbar');     -- 结果: barbar
select RTRIM('barbar ');     -- 结果: barbar
select TRIM(' bar ');        -- 结果: bar
select TRIM(LEADING 'x' FROM 'xxxbarxxx');      -- 结果: barxxx
select TRIM(BOTH 'x' FROM 'xxxbarxxx');         -- 结果: bar
select TRIM(TRAILING 'xyz' FROM 'barxxyz');     -- 结果: barx
```

## 字符串变换函数

### CONCAT - 字符串连接

```sql
select CONCAT('My', 'S', 'QL');  -- 结果: MySQL
select CONCAT(12.3);             -- 结果: '12.3'
```

### REPLACE - 字符串替换

```sql
select REPLACE('www.mysql.com', 'w', 'Ww');  -- 结果: WwWwWw.mysql.com
```

### REPEAT - 字符串重复

```sql
select REPEAT('MySQL', 3);  -- 结果: MySQLMySQLMySQL
```

### REVERSE - 字符串反转

```sql
select REVERSE('abc');  -- 结果: cba
```

### UPPER/LOWER - 大小写转换

```sql
select UCASE('Hej');        -- 结果: HEJ
select LCASE('QUADRATICALLY');  -- 结果: quadratically
```

## 高级函数

### FIELD/FIND_IN_SET - 集合搜索

```sql
-- FIELD 返回 str 在列表中的索引，从 1 开始
select FIELD('ej', 'Hej', 'ej', 'Heja', 'hej', 'foo');  -- 结果: 2

-- FIND_IN_SET 搜索逗号分隔列表中的位置
select FIND_IN_SET('b', 'a,b,c,d');  -- 结果: 2
```

### MAKE_SET - 按位构建集合

```sql
select MAKE_SET(1, 'a', 'b', 'c');              -- 结果: a
select MAKE_SET(1 | 4, 'hello', 'nice', 'world');  -- 结果: hello,world
```

## 其他实用函数

### INSERT - 字符串替换

```sql
select INSERT('Quadratic', 3, 4, 'What');  -- 结果: QuWhattic
```

### LOAD_FILE - 读取文件内容

```sql
UPDATE table_name
SET blob_column = LOAD_FILE("/tmp/picture")
WHERE id = 1;
```

文件必须在服务器上，需要有 FILE 权限。

## 类型自动转换

MySQL 必要时自动在字符串和数字间转换：

```sql
SELECT 1 + "1";           -- 结果: 2
SELECT CONCAT(2, ' test'); -- 结果: '2 test'
```
