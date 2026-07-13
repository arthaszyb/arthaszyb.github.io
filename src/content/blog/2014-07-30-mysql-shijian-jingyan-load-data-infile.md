---
title: LOAD DATA INFILE 报错解决办法
date: '2014-07-30'
description: "LOAD DATA INFILE命令在不同场景下的常见错误排查，包括权限问题（ERROR 1045）和远程导入禁用（ERROR 1148）的解决方案。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
origin_url: https://www.cnblogs.com/
---
LOAD DATA INFILE 是高效的数据导入工具，但在不同场景下会遇到几类典型问题。

## 场景1：root用户本地导入

在MySQL服务器本地，root用户通过load data infile导入数据通常不会有问题，只要文件路径指定正确即可。

## 场景2：普通用户本地导入 - ERROR 1045

```
ERROR 1045 (28000): Access denied for user 'xxx'@'xxx' (using password: YES)
```

**原因：** 普通用户缺少FILE权限。

**解决方案（三选一）：**

1. **加local参数（推荐）**
   ```sql
   load data local infile 'filename' into table xxx.xxx;
   ```

2. **授予FILE权限（不推荐）**
   FILE权限是全局的，需通过下面方式授予：
   ```sql
   grant FILE on *.* to 'xxx'@'xxx';
   ```
   注意：不能通过 `grant all on db.* to xxx` 授予指定数据库的FILE权限，因为FILE权限无法细化到数据库或表级别。

3. **修改.my.cnf配置** （具体方法见官方文档）

## 场景3：远程导入 - ERROR 1148

```
ERROR 1148 (42000): The used command is not allowed with this MySQL version
```

**原因：** 出于安全考虑，默认禁止从客户端远程执行LOAD DATA LOCAL。

**解决方案：** 在客户端登陆时加 `--local-infile` 参数：
```bash
mysql --local-infile -u user -ppasswd -e "load data local infile 'filename' into table xxx.xxx"
```
