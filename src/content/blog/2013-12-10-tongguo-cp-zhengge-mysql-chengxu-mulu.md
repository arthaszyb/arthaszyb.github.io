---
title: 通过 cp 整个 MySQL 程序目录快速安装
date: '2013-12-10'
description: "通过拷贝编译好的MySQL程序目录到新机器实现快速部署，保留原有数据和用户权限。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---

这种方法适合在类似的服务器上快速部署已配置好的 MySQL 实例。

## 准备工作

1. **源服务器**：MySQL 的 data 目录和 my.cnf 最好放在程序目录中（如 `mysql/data/`），便于打包：

```bash
tar czf mysql-backup.tar.gz /path/to/mysql/
```

2. **目标服务器**：
   - 创建 mysql 用户：`useradd mysql`
   - 卸载系统自带 MySQL：`yum remove mysql`
   - 删除旧配置文件：`rm /etc/my.cnf`（系统默认会读取这里，会与新配置冲突）

## 部署步骤

3. **拷贝程序**：将源服务器的压缩包拷贝到目标机器，解压到 MySQL 目录：

```bash
cd /opt
tar xzf mysql-backup.tar.gz
```

确保目录属主正确：

```bash
chown -R mysql:mysql /opt/mysql
```

4. **启动 MySQL**：使用指定配置文件启动：

```bash
/opt/mysql/bin/mysqld_safe --defaults-file=/opt/mysql/my.cnf &
```

5. **验证**：此时新 MySQL 实例的数据、用户和权限都与源一致，可直接使用。

## 优点和注意事项

- **快速部署**：避免重新编译和配置
- **数据一致性**：保留所有原有数据、用户和权限
- **环境依赖**：目标服务器需要相同或兼容的系统库和依赖
