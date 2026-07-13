---
title: MySQL 多表查询学习笔记
date: '2013-12-26'
description: "MySQL多表查询、子查询、视图、索引、存储过程、触发器等核心概念和SQL语法总结。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---

## 多表查询

### 内连接（INNER JOIN）

```sql
-- 基础内连接
SELECT 字段列表 FROM 表1, 表2 WHERE 表1.sid = 表2.sid;

-- 三表连接
SELECT s_name, marks, c_name FROM student_info, marks_info, class_info
WHERE marks_info.s_id = student_info.s_id AND marks_info.c_id = class_info.c_id;

-- 使用别名简化
SELECT s.s_id, s_name, c_name, marks FROM student_info s, marks_info m, class_info c
WHERE s.s_id = m.s_id AND m.c_id = c.c_id;

-- INNER JOIN 语法
SELECT s_name, c_name, marks FROM student_info
INNER JOIN marks_info ON student_info.s_id = marks_info.s_id
INNER JOIN class_info ON marks_info.c_id = class_info.c_id;
```

### 外连接

**左连接（LEFT JOIN）**：以左表为标准，右表无匹配填 NULL

```sql
SELECT s_name, marks FROM student_info s
LEFT JOIN marks_info m ON s.s_id = m.s_id;
```

**右连接（RIGHT JOIN）**：以右表为标准，左表无匹配填 NULL

```sql
SELECT s_name, marks FROM marks_info m
RIGHT JOIN student_info s ON s.s_id = m.s_id;
```

**全连接**：MySQL 不支持 FULL JOIN，使用 UNION 实现

```sql
SELECT s_name, marks FROM student_info s LEFT JOIN marks_info m ON s.s_id = m.s_id
UNION
SELECT s_name, marks FROM marks_info m RIGHT JOIN student_info s ON s.s_id = m.s_id;
```

### 交叉连接

```sql
SELECT 字段列表 FROM 表1 CROSS JOIN 表2;
SELECT s_name, mark FROM student_info CROSS JOIN marks;
```

### 自连接

自己和自己的表连接，用于层级关系等。

## 常用查询技巧

### 去重和过滤

```sql
-- DISTINCT 去重
SELECT DISTINCT area FROM student_info;

-- GROUP BY 去重
SELECT area FROM student_info GROUP BY area;

-- IN 查询散列数据
WHERE id IN (1, 3, 4);

-- BETWEEN 查询范围
WHERE id BETWEEN 1 AND 3;

-- NOT IN
WHERE id NOT IN (1, 3, 4);

-- LIKE 模糊查询（避免 %d% 开头匹配）
WHERE name LIKE '_d_';      -- _ 单个字符
WHERE name LIKE '%d';       -- % 多个字符

-- NULL 检查
IS NULL                     -- 系统 NULL
IS NOT NULL
WHERE field = ''            -- 空字符串
WHERE field = 'null'        -- 字符串 'null'
```

### 别名

```sql
-- 表别名
SELECT s_name FROM student_info AS s;
SELECT s_name FROM student_info s;

-- 字段别名
SELECT s_id, s_name AS name FROM student_info;

-- 常量字段
SELECT '编号', s_id, s_name FROM student_info;
```

## 子查询

```sql
SELECT 字段列表 FROM 表1
WHERE 字段 IN|>|<|>=|<=|!=|ANY|ALL|EXISTS (SELECT 子查询);

-- IN 子查询
SELECT s_name FROM student_info
WHERE s_id IN (SELECT s_id FROM marks WHERE mark > 60);

-- 比较运算符
ANY     -- 任何一个符合条件
ALL     -- 所有结果都成立
EXISTS  -- 子查询有结果返回则主查询执行
```

## 视图

虚拟表，可查询可修改，不能增删。

```sql
-- 创建视图
CREATE VIEW 视图名 AS 查询语句;

-- 删除视图
DROP VIEW 视图名;

-- 使用视图与普通表相同
SELECT * FROM 视图名;
```

## 索引

在记录上建立的虚拟目录，加快查询。

### 索引分类

- **普通索引**：任何字段，标示符 MUL
- **唯一索引**：不能重复，标示符 UNI
- **主键**：一表一个，记录唯一且非 NULL，标示符 PRI

### 创建索引

```sql
-- 已存在的表
CREATE INDEX 索引名 ON 表名(字段名);
CREATE INDEX id_index ON student_info(s_id);
CREATE UNIQUE INDEX id_index ON student_info(s_id);

-- 修改表添加索引
ALTER TABLE 表名 ADD INDEX 索引名(字段);
ALTER TABLE 表名 ADD UNIQUE 索引名(字段);

-- 创建表时指定索引
CREATE TABLE person (
  pid INT(4),
  pname CHAR(30),
  INDEX 索引名(字段)
);

-- 多列索引
CREATE INDEX 索引名 ON 表名(字段1, 字段2);

-- 短索引（前缀）
CREATE INDEX index1 ON news(title(10));
```

### 查看和删除

```sql
-- 查看索引
SHOW INDEX FROM 表名;

-- 删除索引
DROP INDEX 索引名 ON 表名;
ALTER TABLE 表名 DROP INDEX 索引名;
```

## 存储过程

MySQL 自定义函数，有自己的控制结构。

### 基础语法

```sql
-- 定义界定符
DELIMITER //

-- 创建存储过程
CREATE PROCEDURE 名称(IN|OUT|INOUT 参数 类型)
BEGIN
  -- 过程体
END //

-- 调用
CALL 过程名();

-- 恢复默认界定符
DELIMITER ;
```

### 参数类型

- **IN**：传入参数（形参）
- **OUT**：返回参数（return）
- **INOUT**：传入传出参数

### 例子

```sql
DELIMITER //

-- 简单过程
CREATE PROCEDURE stu_pro()
BEGIN
  SELECT * FROM student_info;
END //

-- 带参数的过程
CREATE PROCEDURE stu_id_pro(IN sid INT(4))
BEGIN
  SELECT * FROM student_info WHERE s_id = sid;
END //

-- 返回参数
CREATE PROCEDURE get_age(IN sid INT(4), OUT age1 INT(4))
BEGIN
  SELECT age INTO age1 FROM student_info WHERE s_id = sid;
END //

CALL get_age(3, @a) //
SELECT @a //

-- INOUT 参数
CREATE PROCEDURE add_one(INOUT a INT(4))
BEGIN
  SET a = a + 1;
END //

SET @p = 100 //
CALL add_one(@p) //

DELIMITER ;
```

### 控制结构：IF

```sql
DELIMITER //

CREATE PROCEDURE if_pro(IN tag INT(4))
BEGIN
  IF tag = 1 THEN
    SELECT * FROM student_info;
  ELSE
    SELECT * FROM class;
  END IF;
END //

DELIMITER ;
```

### 控制结构：CASE

```sql
DELIMITER //

CREATE PROCEDURE case_pro(IN tag INT(4))
BEGIN
  CASE tag
    WHEN 1 THEN SELECT * FROM student_info;
    WHEN 2 THEN SELECT * FROM class;
    WHEN 3 THEN SELECT * FROM people;
    ELSE SELECT * FROM person;
  END CASE;
END //

DELIMITER ;
```

### 循环：WHILE

```sql
DELIMITER //

CREATE PROCEDURE sum_while()
BEGIN
  DECLARE tag INT(4) DEFAULT 0;
  DECLARE num INT(4) DEFAULT 0;
  WHILE num <= 10 DO
    SET tag = num + tag;
    SET num = num + 1;
  END WHILE;
  SELECT tag;
END //

DELIMITER ;
```

### 循环：REPEAT

```sql
DELIMITER //

CREATE PROCEDURE sum_repeat()
BEGIN
  DECLARE tag INT(4) DEFAULT 0;
  DECLARE num INT(4) DEFAULT 0;
  REPEAT
    SET num = num + 1;
    SET tag = num + tag;
    UNTIL num >= 10
  END REPEAT;
  SELECT tag;
END //

DELIMITER ;
```

### 循环：LOOP

```sql
DELIMITER //

CREATE PROCEDURE sum_loop()
BEGIN
  DECLARE tag INT(4) DEFAULT 0;
  DECLARE num INT(4) DEFAULT 0;
  loop1: LOOP
    SET num = num + 1;
    SET tag = num + tag;
    IF num >= 10 THEN
      LEAVE loop1;
    ELSE
      ITERATE loop1;
    END IF;
  END LOOP loop1;
  SELECT tag;
END //

DELIMITER ;
```

### 游标和错误处理

```sql
DELIMITER //

CREATE PROCEDURE cursor_pro()
BEGIN
  DECLARE a INT(4) DEFAULT 0;
  DECLARE b INT(4) DEFAULT 0;
  DECLARE tag INT(4) DEFAULT 0;
  DECLARE cur1 CURSOR FOR SELECT sid, marks FROM stu;
  DECLARE CONTINUE HANDLER FOR SQLSTATE "02000" SET tag = 1;
  
  OPEN cur1;
  REPEAT
    FETCH cur1 INTO a, b;
    IF b < 60 THEN
      UPDATE stu SET money = 500 WHERE sid = a;
    ELSEIF b < 70 THEN
      UPDATE stu SET money = 1000 WHERE sid = a;
    ELSEIF b < 80 THEN
      UPDATE stu SET money = 2000 WHERE sid = a;
    ELSEIF b < 90 THEN
      UPDATE stu SET money = 3000 WHERE sid = a;
    ELSE
      UPDATE stu SET money = 4000 WHERE sid = a;
    END IF;
    UNTIL tag
  END REPEAT;
  CLOSE cur1;
END //

DELIMITER ;
```

**错误类型**：
- `01000` - SQL 错误
- `02000` - 数据未发现

## 触发器

用户执行某操作后，MySQL 自动执行的程序逻辑。

```sql
CREATE TRIGGER 触发器名
BEFORE|AFTER
INSERT|UPDATE|DELETE
ON 表名
FOR EACH ROW
BEGIN
  触发器 SQL 语句
END

-- 新增示例
DELIMITER //

CREATE TRIGGER sum
BEFORE INSERT ON a
FOR EACH ROW
BEGIN
  SET new.num = new.num + 1;
END //

DELIMITER ;
```

**关键字**：
- `NEW`：插入或更新后的新数据
- `OLD`：更新或删除前的原数据

## 数据库优化

### 设计优化

1. 统一编码（客户端、服务器、浏览器）
2. 不出现表中有表的现象
3. 单表字段不宜过多
4. 单库表数量不超过 1000
5. 字段尽量用较小的类型（CHAR < VARCHAR，INT < DOUBLE）
6. 用存储过程替代频繁的 PHP 数据库访问
7. 只在必要时建立索引，避免过多浪费空间
8. 数据库设计符合第三范式
9. 字段设为 NOT NULL

### 查询优化

1. 不查询不必要的字段
2. 避免 LIKE '%pattern%'，改用 LIKE 'pattern%'
3. 在合理字段上建立索引
4. 用 JOIN 代替普通多表连接，若无索引且子查询结果少则反之
5. 多个字段常同时出现在 WHERE 则建立多列索引
6. UNION 优先使用 UNION ALL（避免去重开销）
7. 聚合函数避免 WHERE，改用 HAVING
8. GROUP BY 和 ORDER BY 后字段顺序保持一致
9. 建立短索引和唯一索引
10. INSERT 明确字段列表而非 *
11. 频繁多表查询时建立视图
12. WHERE 多条件时，筛选多的条件放前面
13. 删除不必要的括号和条件

### 插入优化

```sql
-- 单条插入最慢
INSERT INTO table VALUES (...);

-- 多条值插入较快
INSERT INTO table VALUES (...), (...), (...);

-- LOAD 插入最快（批量）
LOAD DATA INFILE '/path/to/file' INTO TABLE table;
```
