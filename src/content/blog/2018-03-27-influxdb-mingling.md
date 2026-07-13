---
title: InfluxDB 命令参考
date: '2018-03-27'
description: InfluxDB 0.13 完整命令参考。包含数据构成、数据库操作、CRUD 命令、函数、用户管理、数据保留策略、持续查询、HTTP API 等核心操作。
category: monitoring
tags:
  - influxdb
draft: false
source: evernote-local-db
lang: zh
---

## 数据构成

标准 INSERT 格式：

```
INSERT <measurement>[,<tag_key>=<tag_value>...] <field_key>=<field_value>[,<field_key>=<field_value>...] [<timestamp>]
```

例：

```
INSERT cpu_load_short,host=server01,region=us-west value=0.64,value2=0.86 1434055562000000000
```

**组成部分**：

1. **Key 部分**（measurement + tags）：
   - Measurement：类似表的概念
   - Tags：维度列（Key-Value），Tag Values 必须是 string 类型，用于索引
   - Tag Value 中的空格用 `\` 转义

2. **Field 部分**（数值列）：
   - 格式：Key-Value 对
   - 值类型：Integer（加 `i` 后缀）、float、Boolean、string
   - 例：`value=23`（float），`value=23i`（Integer）
   - Boolean：可用 `t, T, true, TRUE, f, F, false, FALSE`

3. **Timestamp 部分**（可选）：
   - 纳秒级时间戳
   - 省略则自动使用当前时间
   - InfluxDB 默认使用 UTC 时区展示数据

## 数据库操作

```sql
CREATE DATABASE "testDB"        -- 创建数据库
SHOW DATABASES                  -- 展示所有数据库
USE testDB                      -- 使用数据库
DROP DATABASE "testDB"          -- 删除数据库
```

## 查询表信息

```sql
SHOW MEASUREMENTS                                    -- 查询当前数据库中的表
SHOW FIELD KEYS                                      -- 查看所有表的字段
SHOW SERIES FROM pay                                 -- 查看 key 数据
SHOW TAG KEYS FROM "pay"                             -- 查看 tag key 值
SHOW TAG VALUES FROM "pay" WITH KEY = "merId"       -- 查看指定 tag key 的值
SHOW TAG VALUES FROM cpu WITH KEY IN ("region", "host") WHERE service = 'redis'  -- 复合查询
```

## 数据查询

```sql
SELECT * FROM /.*/ LIMIT 1                          -- 查询所有表的第一行
SELECT * FROM pay ORDER BY time DESC LIMIT 2
SELECT * FROM db_name."POLICIES name".measurement_name  -- 查询指定保留策略中的数据
SELECT mean(allTime) FROM pay WHERE time >= today() GROUP BY time(10m) time_zone(+8)
SELECT sum(allTime) FROM "pay" WHERE time > now() - 10s
SELECT count(allTime) FROM pay WHERE time > now() - 10m GROUP BY time(1s)
```

**时间格式化**：

```bash
curl -G 'http://localhost:8086/query' \
  --data-urlencode "db=mydb" \
  --data-urlencode "epoch=s" \
  --data-urlencode "q=SELECT value FROM cpu_load_short WHERE region='us-west'"
```

**按时间分组统计**：

```sql
SELECT count(allTime) FROM pay WHERE time > now() - 15h GROUP BY time(1h)
```

**按指定时间段查询**：

```sql
SELECT count(allTime), mean(allTime) FROM pay 
WHERE time >= '2016-11-30T16:00:00Z' 
AND time <= '2016-12-01T16:59:59Z' 
AND orderFlag = '1'
```

## 数据删除

```sql
DELETE FROM "query"                                  -- 删除表所有数据（表不存在）
DROP MEASUREMENT "query"                             -- 删除表（会删除保留策略）
DELETE FROM cpu WHERE time < '2000-01-01T00:00:00Z'
DROP SERIES FROM pay WHERE tag_key = ''
DROP SHARD 1
```

## 数据保留策略（Retention Policy）

查看保留期：

```sql
SHOW RETENTION POLICIES ON mydb
```

创建保留期：

```sql
CREATE RETENTION POLICY "rp_name" ON "db_name" DURATION 30d REPLICATION 1 DEFAULT
```

参数说明：
- `DURATION`：保留时间（30d、1h、10m 等）、`w`（周）、`INF`（无限期）
- `REPLICATION`：副本数
- `DEFAULT`：设为默认策略

修改保留期：

```sql
ALTER RETENTION POLICY default ON online DEFAULT
```

删除保留期：

```sql
DROP RETENTION POLICY <retentionpolicy> ON <database>
```

## 持续查询（Continuous Query）

基础 CQ：

```sql
CREATE CONTINUOUS QUERY "10m_event_count" ON db_name
BEGIN
  SELECT count(value) INTO "6_months".events FROM events GROUP BY time(10m)
END;
```

带 RESAMPLE 的 CQ：

```sql
CREATE CONTINUOUS QUERY "cpu_mean" ON db_name 
RESAMPLE EVERY 10s FOR 2m
BEGIN
  SELECT mean(value) INTO "cpu_mean" FROM "cpu" GROUP BY time(1m)
END;
```

管理 CQ：

```sql
SHOW CONTINUOUS QUERIES
DROP CONTINUOUS QUERY <cq_name> ON <database_name>
```

**案例**：根据 tags 查询交易成功/失败笔数，每分钟统计一次

```sql
CREATE CONTINUOUS QUERY fail ON online
BEGIN 
  SELECT count(allTime) AS fail INTO online."default".sign_result 
  FROM online."default".sign WHERE orderFlag='0' GROUP BY time(1m)
END

CREATE CONTINUOUS QUERY success ON online
BEGIN 
  SELECT count(allTime) AS success INTO online."default".sign_result 
  FROM online."default".sign WHERE orderFlag='1' GROUP BY time(1m)
END
```

## 用户管理

```sql
SHOW USERS
CREATE USER jdoe WITH PASSWORD '1337password'                   -- 普通用户
CREATE USER jdoe WITH PASSWORD '1337password' WITH ALL PRIVILEGES  -- 管理员
GRANT ALL TO jdoe                                               -- 赋予管理员权限
GRANT READ ON mydb TO jdoe                                      -- 赋予数据库读权限
REVOKE ALL PRIVILEGES FROM jdoe                                 -- 撤销管理员权限
REVOKE READ ON mydb FROM jdoe                                   -- 撤销数据库读权限
SHOW GRANTS FOR jdoe
DROP USER jdoe
```

## HTTP API

**写入数据**：

```bash
curl -i -X POST 'http://127.0.0.1:8086/write?db=online' \
  --data-binary 'pay,host=1,merId=1234567890,orderFlag=1 allTime=347,ecifTime=39,icqTime=88'
```

**从文件批量写入**：

```bash
curl -i -X POST 'http://localhost:8086/write?db=mydb' \
  --data-binary @cpu_data.txt
```

**单条查询**：

```bash
curl -GET 'http://localhost:8086/query?pretty=true' \
  --data-urlencode "db=mydb" \
  --data-urlencode "q=SELECT value FROM cpu_load_short WHERE region='us-west'"
```

**多条查询**：

```bash
curl -G 'http://localhost:8086/query?pretty=true' \
  --data-urlencode "db=mydb" \
  --data-urlencode "q=SELECT value FROM cpu_load_short WHERE region='us-west';SELECT count(value) FROM cpu_load_short WHERE region='us-west'"
```

## 脚本执行

```bash
influx -execute "SELECT count(allTime), mean(allTime) FROM pay WHERE time >= '2016-12-10T16:00:00Z' AND time <= '2016-12-11T16:59:59Z' AND orderFlag = '1'" -database 'online'
```

**注意**：
- 如果程序生成的时间戳作为 time 字段，查询出的数据可能相差 8 小时（时区问题），需要调整查询条件
- 查询不添加时间条件时默认采用当前系统时间，可能导致数据查询延后
