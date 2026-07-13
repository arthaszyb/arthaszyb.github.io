---
title: set names utf8的内部执行原理
date: '2015-01-21'
description: "SET NAMES UTF8 如何解决 MySQL 乱码问题：设置 character_set_client、character_set_connection、character_set_results 三个字符集参数，保证数据在输入输出路径上的编码一致。"
category: database
tags:
  - mysql
  - php
draft: false
source: evernote-local-db
origin_url: "http://hi.baidu.com/myt1988/blog/item/335786808ab7b8ce9123d9b7.html"
lang: zh
---

## MySQL 字符集配置

在 my.ini（Windows）或 my.cnf 中设置：

```ini
[mysql]
default-character-set=utf8

[mysqld]
default-character-set=utf8
```

但即使设置了这些，直接连接时仍可能遇到乱码。查看当前字符集设置：

```sql
show variables like "character_set_%";
```

可能看到：

```
character_set_client     latin1
character_set_connection latin1
character_set_database   utf8
character_set_results    latin1
character_set_server     utf8
character_set_system     utf8
```

## SET NAMES UTF8 的作用

在连接数据库后、读取数据前，执行：

```sql
SET NAMES UTF8;
```

PHP 中：

```php
mysql_query("SET NAMES UTF8");  // 必须在 mysql_connect() 之后
```

这等同于：

```sql
SET character_set_client = utf8;
SET character_set_connection = utf8;
SET character_set_results = utf8;
```

## 数据传输路径

**输入路径**：client → connection → server  
**输出路径**：server → connection → results

问题出在三个关键字符集上。以输出乱码为例，server 中的 utf8 数据经过 connection 转为 latin1，再转为 latin1 的 results，最后 utf-8 页面再转一次。两种字符集不兼容时，转化过程是不可逆的。

## 注意

SET NAMES UTF8 的作用仅是临时的，MySQL 重启后恢复默认值。从服务器配置角度无法通过配置完全省略这行代码，所以为了兼容性，建议每次连接后都执行一次 SET NAMES UTF8。
