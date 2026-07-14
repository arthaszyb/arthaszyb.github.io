---
title: mysql拷贝表的几种方式
date: '2014-11-19'
description: "MySQL 表拷贝方法总结，包括仅复制结构、复制数据、完整复制、跨库复制、选择字段、字段改名、条件拷贝等8种方式。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---

MySQL 拷贝表常用操作方法总结。假设有一个表结构如下：

```sql
CREATE TABLE IF NOT EXISTS `admin` (
  `id` int(6) unsigned NOT NULL auto_increment,
  `username` varchar(50) NOT NULL default '',
  `password` varchar(100) default NULL,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM
DEFAULT CHARSET = latin1
AUTO_INCREMENT = 4;
```

**方法 1：仅复制结构**（不拷贝数据）

```sql
CREATE TABLE newadmin LIKE admin;
```

**方法 2：复制数据但不保留主键和索引**

```sql
CREATE TABLE newadmin AS
(
  SELECT * FROM admin
);
```

**方法 3：完整复制（包含结构、数据、主键、索引）**

```sql
CREATE TABLE newadmin LIKE admin;
INSERT INTO newadmin SELECT * FROM admin;
```

**方法 4：跨库复制**

```sql
CREATE TABLE newadmin LIKE shop.admin;
CREATE TABLE newshop.newadmin LIKE shop.admin;
```

**方法 5：仅拷贝部分字段**

```sql
CREATE TABLE newadmin AS
(
  SELECT username, password FROM admin
);
```

**方法 6：拷贝时改名字段**

```sql
CREATE TABLE newadmin AS
(
  SELECT id, username AS uname, password AS pass FROM admin
);
```

**方法 7：拷贝满足条件的行**

```sql
CREATE TABLE newadmin AS
(
  SELECT * FROM admin WHERE LEFT(username,1) = 's'
);
```

**方法 8：创建表同时定义字段信息**

```sql
CREATE TABLE newadmin
(
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY
)
AS
(
  SELECT * FROM admin
);
```
