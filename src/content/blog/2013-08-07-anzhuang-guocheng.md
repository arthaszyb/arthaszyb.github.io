---
title: MySQL 5.5.29 源码编译安装
date: '2013-08-07'
description: "MySQL 5.5.29 源码包的编译安装步骤，包括 CMake 构建、配置参数、初始化数据库和基本管理命令。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---

MySQL 5.5.29 源码包的安装（此版本用 CMake 编译）。

## 环境准备

```bash
# 建立安装目录和数据目录
mkdir -p /test/usr/local/mysql
mkdir -p /test/usr/local/data/mysql

# 创建 mysql 用户和组
groupadd mysql
useradd -g mysql mysql

# 赋予权限
chown -R mysql.mysql /test/usr/local/data/mysql
```

## 安装 CMake

```bash
cd cmake-2.8.5
./bootstrap
make && make install
```

## 编译安装 MySQL

```bash
cd mysql-5.5.28

# 推荐的 cmake 配置（最终版本）
cmake -DCMAKE_INSTALL_PREFIX=/usr/local/mysql \
  -DINSTALL_DATADIR=/usr/local/mysql/data \
  -DDEFAULT_CHARSET=utf8 \
  -DDEFAULT_COLLATION=utf8_general_ci \
  -DEXTRA_CHARSETS=all \
  -DENABLED_LOCAL_INFILE=1 \
  -DWITH_INNOBASE_STORAGE_ENGINE=1 \
  -DDEFALUT_CHARSETS=all

# 编译和安装
make && make install
```

## 初始化数据库

```bash
# 复制配置文件
cp support-files/my-medium.cnf /etc/my.cnf
cp support-files/mysql.server /etc/init.d/mysqld
chmod 755 /etc/init.d/mysqld

# 初始化数据库
cd /usr/local/mysql
./scripts/mysql_install_db --user=mysql --basedir=/usr/local/mysql --datadir=/data/mysql/

# 启动服务
/etc/init.d/mysqld start
```

## 系统配置

```bash
# 添加系统服务和开机启动
chkconfig --add mysqld
chkconfig mysqld on

# 添加环境变量
echo ‘PATH=$PATH:/test/usr/local/mysql/bin’ >> /etc/profile
```

## 验证和管理

```bash
# 验证服务运行
netstat -tnl | grep 3306

# 删除匿名用户
mysql -u root -p
DELETE FROM mysql.user WHERE host=’localhost’ AND user=’’;
FLUSH PRIVILEGES;

# 设置 root 密码
SET PASSWORD FOR ‘root’@’localhost’ = PASSWORD(‘123456’);
```

## 备份

```bash
# 基础备份
mysqldump --opt XX > /XXXX

# 完整备份（所有数据库、事件、存储过程）
mysqldump -A -E -R >/tmp/data.sql
# -A：所有数据库
# -E：事件
# -R：存储过程
```
