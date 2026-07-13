---
title: Grafana + MySQL 数据源配置
date: '2018-03-08'
description: Grafana 使用 MySQL 数据库作为数据源的配置方法。包括 default.ini 数据库配置、账户权限设置、dashboard 创建与 SQL 查询配置步骤。
category: monitoring
tags:
  - mysql
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
origin_url: http://blog.csdn.net/sweatOtt/article/details/78278011
---

## 安装与启动

1. 从官网下载 Grafana
2. 解压后进入 conf 目录，修改 `default.ini`

## 配置 MySQL 数据源

修改 `default.ini` 的 `[database]` 部分：

```ini
[database]
# You can configure the database connection by specifying type, host, name, user and password
# as separate properties or as on string using the url property.
# Either "mysql", "postgres" or "sqlite3", it's your choice

type = mysql
host = 127.0.0.1:3306
name = <database_name>
user = <username>
# If the password contains # or ; you have to wrap it with triple quotes. Ex """#password;"""
password = <password>
```

**账户权限要求**：

官网推荐只需 SELECT 权限，但实际 Grafana 会创建表，所以需要 CREATE 权限。建议直接创建一个 ALL 权限的数据库账号。

## 启动 Grafana

```bash
./bin/grafana-server
```

访问 `http://localhost:3000`

## 配置数据源

在 Grafana 中配置 MySQL 数据源的基本信息。

## 创建 Dashboard

1. 创建 dashboard，选择类型（如 graph）
2. 点击 Panel Title，选择 edit
3. 在配置框中写 SQL 查询：

```sql
SELECT <time_column> as time, <value_column> as value, <series_name_column> as metric
FROM <table_name>
WHERE $__timeFilter(<time_column>)
```

**SQL 参数说明**：

- `<time_column>`：时间戳字段（必须，数据中要包含该字段）
- `<value_column>`：要显示的数据值
- `<series_name_column>`：数据分类字段（决定显示多少条线；如 part 字段有 0、1 两个值，则展示 2 条线）
- `$__timeFilter`：宏定义，点击 show help 查看详细描述

4. 按 Ctrl+S 保存配置

## 验证效果

dashboard 将展示根据 SQL 查询结果生成的图表。
