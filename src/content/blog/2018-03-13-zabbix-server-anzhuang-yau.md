---
title: Zabbix Server 源码安装
date: '2018-03-13'
description: Zabbix Server 从源码编译安装的步骤。包含 configure 配置、依赖库安装、编译与安装等关键步骤。
category: monitoring
tags:
  - mysql
  - zabbix
draft: false
source: evernote-local-db
lang: zh
---

## 源码安装步骤

从官网下载源码包，按以下步骤编译安装。

### 1. 依赖库检查与安装

```bash
sudo yum search libevent
sudo yum install libevent-devel
sudo yum search net-snmp-config
sudo yum install libpcre-devel
sudo yum install pcre-devel
sudo yum install -y curl-devel
```

### 2. 编译与安装

```bash
sudo ./configure --prefix=/usr/local/app/zabbix --enable-server --enable-agent --with-mysql --enable-ipv6 --with-net-snmp --with-libcurl --with-libxml2
sudo make && sudo make install
```

**configure 选项说明**：
- `--prefix`：安装路径
- `--enable-server`、`--enable-agent`：编译 server 和 agent 程序
- `--with-mysql`：使用 MySQL 数据库支持
- `--enable-ipv6`、`--with-net-snmp` 等：启用相应功能
