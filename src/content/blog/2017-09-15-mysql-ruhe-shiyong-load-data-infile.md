---
title: "mysql 如何使用 LOAD DATA INFILE 导入中文数据"
date: '2017-09-15'
description: "LOAD DATA INFILE 导入大量数据时避免中文乱码的方法：指定 CHARACTER SET 编码、设置数据库和表的字符集、设置连接字符集。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
origin_url: "http://blog.sina.com.cn/s/blog_80014bd90102vq0e.html"
lang: zh
---

## 中文乱码问题

使用 `LOAD DATA INFILE` 导入中文数据时经常遇到乱码，即使已将数据转换为 utf8 也无法解决。问题原因：`LOAD DATA INFILE` 需要通过 `CHARACTER SET` 指定数据文件的编码方式。

## 导入示例

```sql
LOAD DATA LOCAL INFILE '/var/log/ppm/userlog/httplog-2011-05-06-14.sql' 
  INTO TABLE user_action 
  CHARACTER SET utf8 
  FIELDS TERMINATED BY ',' 
  ENCLOSED BY '/' 
  LINES TERMINATED BY '\n' 
  (dload_type, content_name, server, infohash, file_len, ppc_url, user_ip, start_time, end_time, bytes_download);
```

关键是加上 `CHARACTER SET utf8` 指定数据文件编码。

## 中文乱码完整解决方案

### 原因分析

MySQL 中文乱码通常由以下原因导致：
1. server 本身设定问题（停留在 latin1）
2. table 的语系设定问题（character 和 collation）
3. 客户端程序（如 php）的连线语系设定问题

### 建库建表时设定编码

```sql
-- 创建数据库
CREATE DATABASE `test` CHARACTER SET 'utf8' COLLATE 'utf8_general_ci';

-- 创建表
CREATE TABLE `database_user` (
  `ID` varchar(40) NOT NULL default '',
  `UserID` varchar(40) NOT NULL default ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### 修改现有库表的编码

```sql
-- 查看默认编码格式
show variables like "%char%";

-- 修改库编码
ALTER DATABASE `db_name` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

-- 修改表编码
ALTER TABLE `tb_name` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

-- 设置连接编码
set names utf8;
```

### UTF-8 编码导入

```bash
# 确保数据文件编码为 UTF-8
set names utf8;
```

```sql
LOAD DATA LOCAL INFILE 'C:\\utf8.txt' INTO TABLE yjdb;
```

### GBK 编码导入

```bash
# 对于 GBK/GB2312 编码的数据
set names gbk;
```

```sql
ALTER DATABASE `db_name` DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;
ALTER TABLE `tb_name` DEFAULT CHARACTER SET gbk COLLATE gbk_chinese_ci;

LOAD DATA LOCAL INFILE 'C:\\gbk.txt' INTO TABLE yjdb;
```

### 网页显示编码

- 将网站编码设为 utf-8，可兼容世界上所有字符
- 或在 MySQL 连接时加入编码参数：`?useUnicode=true&characterEncoding=utf-8`
- 在网页代码中加上 `SET NAMES utf8` 或 `SET NAMES gbk` 指令

## 重要提示

- UTF-8 数据不要导入 GBK 数据库，GBK 数据不要导入 UTF-8
- DOS 不支持 UTF-8 的显示，建议在 Linux 上进行导入操作
- 强烈建议统一使用 UTF-8 编码
