---
title: 教您如何查看MySQL用户权限
date: '2014-06-30'
description: "关于MySQL用户权限管理的整理笔记，包括查看权限的方法、GRANT命令用法、权限分类（数据库/全局/特殊权限）及常见例子。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
origin_url: https://www.cnblogs.com/
---
查看和管理MySQL用户权限是数据库运维的基本技能。以下是权限检查和授予的常用方法。

## 查看用户权限

```sql
show grants for 用户名;
-- 例如
show grants for root@'localhost';
```

## GRANT 命令用法

GRANT 命令的基本语法：
```sql
GRANT <privileges> ON <what> TO <user> [IDENTIFIED BY "<password>"] [WITH GRANT OPTION];
```

### 权限分类

**数据库/数据表/数据列权限：**
- `Alter`：修改已存在的数据表（例如增加/删除列）和索引
- `Create`：建立新的数据库或数据表
- `Delete`：删除表的记录
- `Drop`：删除数据表或数据库
- `INDEX`：建立或删除索引
- `Insert`：增加表的记录
- `Select`：显示/搜索表的记录
- `Update`：修改表中已存在的记录

**全局管理权限：**
- `FILE`：在MySQL服务器上读写文件
- `PROCESS`：显示或杀死属于其它用户的服务线程
- `RELOAD`：重载访问控制表，刷新日志等
- `SHUTDOWN`：关闭MySQL服务

**特殊权限：**
- `ALL`：允许做任何事（同root权限）
- `USAGE`：只允许登录，无其它操作权限

### 常见示例

```sql
-- 创建本地用户，限制为不操作任何对象
GRANT USAGE ON *.* TO 'discuz'@'localhost' IDENTIFIED BY PASSWORD '*C242DDD213BE9C6F8DA28D49245BF69FC79A86EB';

-- 授予该用户对指定数据库的所有权限
GRANT ALL PRIVILEGES ON `discuz`.* TO 'discuz'@'localhost';
```
