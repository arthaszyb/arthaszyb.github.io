---
title: mysqldump 导出数据、结构、函数和存储过程
date: '2013-12-04'
description: "mysqldump备份导出的各种用法汇总，包括全库备份、指定库表备份、结构和数据分离、以及导出Excel等。"
category: database
tags:
  - mysql
  - 备份恢复
draft: false
source: evernote-local-db
lang: zh
---

## 基础备份命令

### 导出某个数据库（结构+数据）

```bash
mysqldump -h192.168.161.124 -uroot -pxxxxxx --opt db_name | gzip -9 > /db_backup/db_name.gz
```

### 包含函数和存储过程

```bash
mysqldump -h192.168.161.124 -uroot -pxxxxxx --opt -R db_name | gzip -9 > /db_backup/db_name.gz
# -R: 包含存储过程和函数
```

### 包含事件、函数和存储过程

```bash
mysqldump -h192.168.161.124 -uroot -pxxxxxx --opt -R -E db_name | gzip -9 > /db_backup/db_name.gz
# -E: 包含事件
```

## 多库和全库备份

### 导出多个数据库

```bash
mysqldump -h192.168.161.124 -uroot -pxxxxxx --opt --databases db_name1 db_name2 db_name3 | gzip -9 > /db_backup/mul_db.gz
```

### 导出所有数据库

```bash
mysqldump -h192.168.161.124 -uroot -pxxxxxx --opt --all-databases | gzip -9 > /db_backup/all_db.gz
```

## 结构和数据分离

### 只导出结构

```bash
mysqldump -h192.168.161.124 -uroot -pxxxxxx --opt --no-data db_name | gzip -9 > /db_backup/db_name.struct.gz
```

### 只导出数据

```bash
mysqldump -h192.168.161.124 -uroot -pxxxxxx --opt --no-create-info db_name | gzip -9 > /db_backup/db_name.data.gz
```

## 指定表的导出

### 导出某个表（结构+数据）

```bash
mysqldump -h192.168.161.124 -uroot -pxxxxxx --opt db_name tbl_name | gzip -9 > /db_backup/db_name.tbl_name.gz
```

### 导出某个表的结构

```bash
mysqldump -h192.168.161.124 -uroot -pxxxxxx --opt --no-data db_name tbl_name | gzip -9 > /db_backup/db_name.tbl_name.struct.gz
```

### 导出某个表的数据

```bash
mysqldump -h192.168.161.124 -uroot -pxxxxxx --opt --no-create-info db_name tbl_name | gzip -9 > /db_backup/db_name.tbl_name.data.gz
```

## --opt 参数说明

`--opt` 是组合参数，等价于：

```
--add-drop-table +
--add-locks +
--create-options +
--disable-keys +
--extended-insert +
--lock-tables +
--quick +
--set-charset
```

默认启用，用 `--skip-opt` 禁用。其他有用参数：

- `--add-drop-database`：添加 DROP DATABASE 语句

## 导出为 Excel

### 导出为 XLS 格式

```bash
SELECT * FROM test INTO OUTFILE '/tmp/reg.xls';
```

### 编码转换

Excel 默认编码为 GB2312，导出的 UTF-8 数据需转换：

```bash
iconv -futf8 -tgb2312 -oreg2.xls reg.xls
```

如转换失败（字符编码问题），可用 Excel 直接打开 XLS 文件，以文本模式另存为 ANSI 编码即可解决乱码。

## MySQL 锁表操作

### 全局读锁

```sql
FLUSH TABLES WITH READ LOCK;
UNLOCK TABLES;
```

全局读锁会锁定所有库的所有表为只读，用于联机备份。写操作被阻塞，读操作正常进行。

### 表级锁

```sql
LOCK TABLE tbl_name [AS alias] {READ [LOCAL] | [LOW_PRIORITY] WRITE};
UNLOCK TABLES;
```

表级锁可以锁定特定表，支持 READ 和 WRITE 两种模式：

- **READ 锁**（共享锁）：允许其他读请求，阻塞写请求
- **WRITE 锁**（独占锁）：阻塞其他读和写请求

**注意**：锁定语句具有隐式提交特性，退出 MySQL 终端时自动解锁。要使锁保持生效，必须保持当前连接。
