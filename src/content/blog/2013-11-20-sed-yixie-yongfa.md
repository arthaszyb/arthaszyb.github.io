---
title: sed 常用用法
date: '2013-11-20'
description: sed 文本处理的常用命令集合，包括插入、删除、替换等操作。涵盖按行号、按模式匹配、批量替换等使用场景。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

## 插入操作

### 在最后一行后插入

```bash
sed -i '$ a\green_lizard-end' content
```

### 在第一行前插入

```bash
sed -i '1 i\green_lizard-begin' content
```

### 在匹配行前插入

```bash
sed -i '/^mm/ i line-before' content
```

### 在匹配行后插入

```bash
sed -i '/^mm/ a line-after' content
```

### 在匹配行的行首插入

```bash
sed -i '/10.1.15.125/s/^/;/g' lizard*
```

### 在匹配行的行尾插入

```bash
sed -i '/10.1.15.125/s/$/;/g' lizard*
```

## 删除操作

### 删除匹配行

```bash
sed -i '/^mm/d' content
```

### 删除第一行

```bash
sed -i '1d' content
```

### 删除最后一行

```bash
sed -i '$d' content
```

## 替换操作

### 匹配行下方增加一行

```bash
sed -i '/external-locking/a\default-storage-engine = MyISAM' my.cnf
```

### 匹配并替换多个字段

```bash
sed -i -e '/^mysqlhost/s/=.*/= 1.1.1.1/g' \
       -e '/^mysqluser/s/=.*/= user1/g' \
       -e '/^mysqlpwd/s/=.*/= dwj*2eEQ/' config.txt
```

### 批量替换目录内所有文件

将所有文件中的 `172.16.*.*` 替换为 `10.0.0.3`：

```bash
grep -rl 172.16 dir/ | xargs -i sed -i 's/172.16\.[0-9]\+\.[0-9]\+/10.0.0.3/g' {}
```

### 将 Tab 转换为逗号

常用于导出 Excel 或 MySQL 数据：

```bash
sed 's/\t/,/g' file
```

## 其他常用命令

### 设置系统时间日期

```bash
date -s '22:48:40 2013-12-21'
```
