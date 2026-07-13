---
title: MySQL 安装常见错误解决
date: '2013-08-07'
description: "MySQL 编译安装时 ncurses 库缺失错误的解决方法，以及 MySQL 无密码登录的处理办法。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---

## 问题1：./configure 时出现 ncurses 库缺失错误

### 错误信息

```
checking for tgetent in -lncurses... no
checking for tgetent in -lcurses... no
checking for tgetent in -ltermcap... no
checking for tgetent in -ltinfo... no
configure: error: No curses/termcap library found
```

### 原因

缺少 ncurses 开发包。

### 解决办法

**RedHat 系列**（CentOS、RHEL、Fedora）：

```bash
yum list | grep ncurses
yum -y install ncurses-devel
```

**Ubuntu / Debian**：

```bash
apt-cache search ncurses
apt-get install libncurses5-dev
```

安装完成后，重新运行：

```bash
./configure
make && make install
```

## 问题2：MySQL 无密码或忘记密码导致无法登录

### 解决步骤

1. 停止 MySQL 服务：

```bash
mysql stop
```

2. 以安全模式启动（跳过授权表和网络）：

```bash
/usr/local/mysql/bin/mysqld_safe --user=mysql --skip-grant-tables --skip-networking &
```

3. 无密码登录：

```bash
mysql
```

进入 MySQL 后可以重置密码或修复用户表。
