---
title: mysql数据类型
date: '2015-04-08'
description: "MySQL 数据类型完整速查表：整型、浮点数、定点数、字符串、二进制、日期时间及其属性说明。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---

## 整型

| 类型 | 字节 | 有符号范围 |
|---|---|---|
| tinyint | 1 | -128 ~ 127 |
| smallint | 2 | -32768 ~ 32767 |
| mediumint | 3 | -8388608 ~ 8388607 |
| int | 4 | -2147483648 ~ 2147483647 |
| bigint | 8 | ±9.22 × 10^18 |

加 `unsigned` 后最大值翻倍。如 `tinyint unsigned` 范围为 0 ~ 256。

`int(m)` 中的 m 是表示查询结果集中的显示宽度，不影响实际取值范围。

## 浮点型

| 类型 | 精度 | 字节 | 说明 |
|---|---|---|---|
| float(m,d) | 8 位 | 4 | m 总个数，d 小数位 |
| double(m,d) | 16 位 | 8 | m 总个数，d 小数位 |

例：float(5,3) 插入 123.45678，实际存储 123.457，但总位数仍以实际为准（6 位）。

## 定点数

| 类型 | 说明 |
|---|---|
| decimal(m,d) | 精确存储，m < 65（总位数），d < 30（小数位） |

浮点型存放近似值，定点类型存放精确值。

## 字符串

| 类型 | 说明 |
|---|---|
| char(n) | 固定长度，最多 255 字符 |
| varchar(n) | 可变长度，最多 65535 字符 |
| tinytext | 可变，最多 255 字符 |
| text | 可变，最多 65535 字符 |
| mediumtext | 可变，最多 2^24 - 1 字符 |
| longtext | 可变，最多 2^32 - 1 字符 |

### char vs varchar

- char(n) 若存入字符数小于 n，以空格补充，查询时空格被去掉；varchar 无此限制
- char(n) 固定占用 n 字节；varchar 占用实际字符数 + 1 字节（n <= 255）或 + 2 字节（n > 255）
- char 类型检索速度比 varchar 快

### varchar vs text

- varchar 可指定 n，text 不能；varchar 存储数据 + 1/2 字节，text + 2 字节
- text 不能有默认值
- varchar 可直接创建索引，text 需指定前几个字符；varchar 查询速度快于 text，即使都创建索引

## 二进制数据

| 类型 | 说明 |
|---|---|
| BLOB | 二进制存储，区分大小写，只能整体读出 |
| TEXT | 文本存储，不区分大小写，可指定字符集 |

## 日期时间

| 类型 | 格式 |
|---|---|
| date | '2008-12-2' |
| time | '12:25:36' |
| datetime | '2008-12-2 22:06:44' |
| timestamp | 自动存储记录修改时间 |

定义 timestamp 字段，字段值会随其他字段修改时自动刷新，可存放记录最后被修改的时间。

## 字段属性

| 关键字 | 说明 |
|---|---|
| NULL | 数据列可包含 NULL 值 |
| NOT NULL | 数据列不允许包含 NULL 值 |
| DEFAULT | 默认值 |
| PRIMARY KEY | 主键 |
| AUTO_INCREMENT | 自动递增，适用整数类型 |
| UNSIGNED | 无符号 |
| CHARACTER SET | 指定字符集 |
