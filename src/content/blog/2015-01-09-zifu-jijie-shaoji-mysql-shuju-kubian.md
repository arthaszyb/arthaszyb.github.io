---
title: 字符集介绍及 MySQL 数据库编码转换
date: '2015-01-09'
description: "字符集基础与 MySQL 实践：ASCII、GBK、Latin1、UTF-8 编码原理，MySQL 字符集系统变量，字符集设置和转换过程，常见乱码问题解析，数据库编码升级方案（mysqldump 和分表导出两种方法）。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
origin_url: 'http://wushank.blog.51cto.com/3489095/1341592'
lang: zh
---

## 一、字符集介绍

### 1. ASCII

ASCII（American Standard Code for Information Interchange，美国标准信息交换代码）由美国国家标准学会制定，是标准的单字节字符编码方案。

- 基础 ASCII：7 位二进制表示 128 种字符
- 扩展 ASCII：8 位二进制表示 256 种字符（128-255）

**字符分布**：

- 0-31、127（33 个）：控制字符（LF、CR、FF、DEL、BS、BEL 等）
- 32-126（95 个）：可显示字符
  - 48-57：数字 0-9
  - 65-90：大写字母 A-Z
  - 97-122：小写字母 a-z
  - 其余：标点符号和运算符

### 2. GBK

GBK（汉字内码扩展规范，Chinese Internal Code Specification）兼容 GB2312，收录汉字 21003 个、符号 883 个，简繁体融于一库。

- **GB2312**：1980 年发布，收录汉字 6763 个和符号 682 个，通行于中国大陆和新加坡
- **GBK**：对 GB2312 的扩展，也是 CP936 代码页的扩展

### 3. Latin1（ISO-8859-1）

Latin1 是单字节编码，向下兼容 ASCII：

- 编码范围：0x00-0xFF
- 0x00-0x7F：完全与 ASCII 相同
- 0x80-0x9F：控制字符
- 0xA0-0xFF：文字符号

**特性**：Latin1 使用了单字节内的所有空间，因此任何编码的字节流当作 Latin1 看待都没有问题。**这是 MySQL 默认编码为 Latin1 的原因**。

### 4. UTF-8

UTF-8（8-bit Unicode Transformation Format）是针对 Unicode 的可变长度字符编码，由 Ken Thompson 于 1992 年创建，已标准化为 RFC 3629。

**编码规则**：用 1-4 个字节编码 Unicode 字符

| Unicode 编码范围 | UTF-8 字节流 |
|---|---|
| 000000-00007F | 0xxxxxxx |
| 000080-0007FF | 110xxxxx 10xxxxxx |
| 000800-00FFFF | 1110xxxx 10xxxxxx 10xxxxxx |
| 010000-10FFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx |

**特点**：

- 对 0x00-0x7F 字符，UTF-8 与 ASCII 完全相同
- 最大长度 4 字节，可容纳 21 位二进制数，足以表示所有 Unicode 字符（最大 0x10FFFF）

**例子**：

"汉"字 Unicode = 0x6C49（在 0x0800-0xFFFF 范围），使用 3 字节模板：
- 二进制：0110 1100 0100 1001
- 替换模板中的 x：11100110 10110001 10001001 = E6 B1 89

## 二、MySQL 字符集设置

### 1. 系统变量

- `character_set_server`：默认的内部操作字符集
- `character_set_client`：客户端数据使用的字符集
- `character_set_connection`：连接层字符集
- `character_set_results`：查询结果字符集
- `character_set_database`：当前数据库的默认字符集
- `character_set_system`：系统元数据（字段名等）字符集

对应的 `collation_*` 变量描述字符序。

### 2. 字符集支持层次

MySQL 对字符集的支持细化到四层：**服务器 → 数据库 → 数据表 → 列**

**默认字符集的继承链**：

1. 编译 MySQL 时指定（默认 latin1）
2. 安装时在配置文件 my.cnf 中指定（继承编译时配置）
3. 启动 mysqld 时通过命令行参数指定（继承配置文件配置）
4. 创建数据库时未明确指定，继承 character_set_server
5. 选定数据库后，character_set_database 被设定为该库的默认字符集
6. 创建表时，表默认字符集为 character_set_database
7. 创建列时，列默认字符集为表默认字符集

### 3. 查看字符集设置

```sql
SHOW VARIABLES LIKE 'character%';
SHOW VARIABLES LIKE 'collation%';
```

示例输出：

```
| character_set_client     | latin1 |
| character_set_connection | latin1 |
| character_set_database   | latin1 |
| character_set_results    | latin1 |
| character_set_server     | latin1 |
```

**排序方式命名规则**：`字符集_语言_后缀`

- `_ci`：不区分大小写
- `_cs`：区分大小写
- `_bin`：二进制排序（按字符编码，不涉及语言）

### 4. MySQL 字符集转换过程

1. MySQL Server 收到请求 → 从 character_set_client 转换为 character_set_connection
2. 进行内部操作前 → 从 character_set_connection 转换为内部操作字符集，依次查询：
   - 数据字段的 CHARACTER SET 设定值
   - 数据表的 DEFAULT CHARSET 设定值
   - 数据库的 DEFAULT CHARSET 设定值
   - character_set_server 设定值
3. 将操作结果从内部操作字符集转换为 character_set_results

## 三、常见问题解析

### 场景一：插入前未设置连接字符集

目标表默认 utf8，插入 utf8 数据但未设置连接字符集，查询时才设置为 utf8：

- 插入时：character_set_client/connection/results 均为 latin1（默认）
- 转换链：latin1 → latin1 → utf8（每个汉字从 3 字节变成 6 字节）
- 查询时：utf8 → utf8（原封不动返回 6 字节）→ **乱码**

### 场景二：插入前设置了连接字符集为 utf8

目标表默认 latin1，但提前设置连接字符集为 utf8：

- 插入时：character_set_client/connection/results 均为 utf8
- 转换链：utf8 → utf8 → latin1
- 若数据含 0x00-0xFF 范围外的 Unicode 字符 → 无法表示 → 转换为"?"(0x3F) → **数据丢失**

## 四、修改 MySQL 字符集

### 查看字符集

```sql
SHOW CHARACTER SET;              -- 所有支持的字符集
SHOW COLLATION;                 -- 所有排序方式
SHOW VARIABLES LIKE 'char%';     -- 系统字符集设置
SHOW TABLE STATUS FROM db LIKE 'table%'; -- 表字符集
SHOW FULL COLUMNS FROM table;    -- 列字符集
```

### 修改字符集

**服务器级**：

```sql
-- 临时修改
SET GLOBAL character_set_server=utf8;

-- 永久修改（修改 my.cnf）
[mysqld]
default-character-set=utf8
```

**数据库级**：

```sql
-- 临时修改
SET CHARACTER SET utf8;

-- 永久修改：修改建库语句
ALTER DATABASE dbname CHARACTER SET utf8 COLLATE utf8_general_ci;
```

**表级**：

```sql
ALTER TABLE table_name DEFAULT CHARSET utf8;
```

**列级**：

```sql
ALTER TABLE products CHANGE products_model products_model varchar(20) 
CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL;
```

**连接级**：

```sql
-- 临时修改
SET NAMES utf8;

-- 永久修改（修改 my.cnf 中的 [client] 部分）
[client]
default-character-set=utf8
```

## 五、字符集转换实例

**背景**：原数据库采用 latin1，升级为 utf8。原表 databasename（charset=latin1），新表 new_databasename（charset=utf8）。

### 方法一：mysqldump + SQL 转码

1. 导出原数据：

```bash
mysqldump --opt -hlocalhost -uroot -p*** --default-character-set=latin1 dbname > /usr/local/dbname.sql
```

2. 修改 SQL 文件中的 `CHARSET=latin1` 为 `CHARSET=utf8`
3. 在 INSERT 语句前添加 `SET NAMES utf8;`
4. 将 SQL 文件转码为 UTF-8（使用 UltraEdit 或其他工具的"转换"功能）
5. 创建新数据库：

```sql
CREATE DATABASE new_dbname CHARACTER SET utf8 COLLATE utf8_general_ci;
```

6. 导入数据：

```bash
mysql -hlocalhost -uroot -p*** --default-character-set=utf8 new_dbname < /usr/local/dbname.sql
```

**缺点**：大量中文或特殊字符时易出错，导致导入失败。

### 方法二：分表导出（推荐）

1. 将表结构导出，修改 `CHARSET=latin1` 为 `CHARSET=utf8`，在目标库建表结构
2. 进入 MySQL 命令行：

```bash
mysql -hlocalhost -uroot -p*** dbname
```

3. 导出表数据：

```sql
SELECT * FROM tbname INTO OUTFILE '/usr/local/tbname.sql';
```

4. 转码为 UTF-8
5. 在 MySQL 命令行设置字符集环境变量：

```sql
SET character_set_database=utf8;
```

6. 导入数据：

```sql
LOAD DATA INFILE '/usr/local/tbname.sql' INTO TABLE new_dbname.tbname;
```

**优点**：所有数据正常导入，无乱码。建议使用此方法，特别是对于大型数据库。

## 注意事项

- `my.cnf` 中的 `default_character_set` 仅影响 mysql 命令行客户端，不影响使用 libmysqlclient 库的应用程序
- 字段的 SQL 函数操作通常以内部操作字符集进行，不受连接字符集影响
- SQL 语句中的裸字符串受连接字符集或 introducer 影响，比较操作可能产生完全不同的结果
- 建议显式指定字符集，不依赖 MySQL 默认设置
