---
title: MySQL 性能优化提示
date: '2014-03-06'
description: "MySQL性能优化的设计、查询、存储引擎和配置建议汇总，需根据实际应用情况调整。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---

MySQL 性能优化的基本原则和具体建议。

## 数据库设计优化

1. **使用标准化设计**：遵循数据库三范式，表的联合查询（JOIN）性能不会差

2. **选择合适的字符集**：
   - `utf8_general_ci` 略快于 `utf8_unicode_ci`
   - UTF-16 可以处理所有字符但需要 2 倍存储
   - UTF-8 支持各种字符但比 latin1 慢
   - 尽可能使用 latin1（除非需要中文等特殊字符）

3. **字段设计**：
   - 所有字段尽可能使用 `NOT NULL`
   - 使用最小的数据类型（如状态字段用 TINYINT 而非 INT）

4. **索引策略**：
   - 为所有 SELECT 查询字段创建适当的索引
   - 索引提升查询性能但降低插入性能
   - 避免无用的和重复的索引

## 查询优化

### 避免的查询模式

```sql
-- 避免 IN 查询
WHERE id IN (1, 2, 3, 4, 5)

-- 避免 ORDER BY RAND()
ORDER BY RAND()

-- 避免 LIKE 前缀匹配
WHERE name LIKE '%pattern'

-- 避免在WHERE、LIMIT、ORDER BY中使用表达式和函数
WHERE age > YEAR(NOW()) - 18

-- 避免在大表中使用大偏移LIMIT
LIMIT 100000, 10
```

### 推荐的查询方式

1. **使用 INSERT ... ON DUPLICATE KEY UPDATE**

当需要在唯一索引表中插入前检查数据是否存在时：

```sql
-- 避免
SELECT * FROM table WHERE id = 1;
IF exists THEN
  UPDATE ...
ELSE
  INSERT ...

-- 改为
INSERT INTO table (...) VALUES (...)
ON DUPLICATE KEY UPDATE field = VALUES(field);
```

2. **分页查询优化**

```sql
-- 避免大偏移
LIMIT 100000, 10

-- 改为，通过WHERE限制结果集
SELECT * FROM table WHERE id > 100000 LIMIT 10;
```

3. **GROUP BY vs DISTINCT**

优先使用 GROUP BY 而非 DISTINCT

4. **SELECT 字段优化**

```sql
-- 避免
SELECT * FROM table;

-- 改为，只选择需要的字段
SELECT id, name FROM table;
```

5. **小查询合并**

尽可能将多个小查询合并为一个大查询，减少往返

### 查询分析工具

1. **EXPLAIN 分析**

分析 SQL 查询是否最优：

```sql
EXPLAIN SELECT * FROM table WHERE id = 1;
```

2. **慢查询日志**

定期浏览系统的慢查询日志（Slow Query Log）：

```ini
[mysqld]
slow_query_log = 1
long_query_time = 2
```

## 存储引擎选择

- **InnoDB**：频繁写操作，支持事务
- **MyISAM**：主要读操作，表级锁
- **ARCHIVE**：归档日志等历史数据，压缩率高
- **BLACKHOLE**：日志等一次性写操作，性能最快
- **MERGE**：跨多个表的查询

> 在测试平台充分测试后再在生产环境使用

## my.cnf 配置优化

```ini
[mysqld]
# 主键缓冲区大小
key_buffer_size = 128M

# 打开表的缓存个数
table_cache = 128

# 排序缓冲区大小
sort_buffer_size = 32M
myisam_sort_buffer_size = 32M

# 如果不做复制，禁用二进制日志
# log-bin = mysql-bin

# InnoDB 相关优化
innodb_buffer_pool_size = 4G
innodb_log_file_size = 512M
```

## 总体原则

- **测试先行**：所有优化都应该在测试环境验证
- **监控和分析**：定期检查慢查询日志和性能指标
- **渐进式优化**：一次优化一个方面，观察影响
- **避免过度优化**：不是所有优化都适用，需根据实际情况调整
- **文档齐全**：记录优化决策和原因，便于后续维护
