---
title: MySQL "server quit without updating PID file" 错误解决
date: '2013-11-20'
description: "MySQL启动失败提示PID文件错误的7种常见原因和解决方法汇总。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---

MySQL 启动时出现 `The server quit without updating PID file` 错误的常见原因和解决办法。

## 方案1：PID 文件权限不足

```bash
chown -R mysql:mysql /var/data
chmod -R 755 /usr/local/mysql/data
service mysqld restart
```

## 方案2：MySQL 进程仍在运行

检查是否有僵尸进程：

```bash
ps -ef | grep mysqld
kill -9 <PID>  # 杀死进程
service mysqld restart
```

## 方案3：mysql-bin.index 冲突

第二次安装 MySQL 时，残余数据会影响启动。进入数据目录删除：

```bash
cd /usr/local/mysql/data
rm -f mysql-bin.index
service mysqld restart
```

## 方案4：配置文件中未指定数据目录

MySQL 启动时默认使用 `/etc/my.cnf`，需要验证数据目录设置：

```bash
# /etc/my.cnf 中 [mysqld] 段需要有
datadir = /usr/local/mysql/data
```

## 方案5：skip-federated 字段问题

检查 `/etc/my.cnf` 中是否有未注释的 `skip-federated` 字段，若有则注释掉：

```
# skip-federated
```

## 方案6：错误日志目录不存在

使用命令赋予权限和所有者：

```bash
chown -R mysql:mysql /usr/local/mysql/data
chmod -R 755 /usr/local/mysql/data
```

## 方案7：SELinux 阻止（CentOS）

CentOS 默认开启 SELinux，可能阻止 MySQL 启动。修改配置：

```bash
# 编辑 /etc/selinux/config
SELINUX=disabled

# 重启机器
reboot
```

## 快速诊断

查看 MySQL 错误日志获得更详细信息：

```bash
tail -f /usr/local/mysql/data/error.log
```

根据具体错误信息选择对应的解决方案。
