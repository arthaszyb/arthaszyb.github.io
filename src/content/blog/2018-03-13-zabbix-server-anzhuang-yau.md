---
title: zabbix-server安装-yau
date: '2018-03-13'
description: 方式1：源码安装。 官网下载有指引链接。
category: monitoring
tags:
  - mysql
  - zabbix
  - ai-agent
draft: false
source: evernote-local-db
lang: zh
---
方式1：源码安装。官网下载有指引链接。主要步骤如下：
```bash
sudo ./configure --prefix=/usr/local/app/zabbix --enable-server --enable-agent --with-mysql --enable-ipv6 --with-net-snmp --with-libcurl --with-libxml2
yum search libevent
```
sudo yum search libevent
sudo yum install libevent-devel
sudo yum search net-snmp-config
sudo yum install libpcre-devel
sudo yum install pcre-devel
sudo yum install -y curl-devel
sudo make
&
&
sudo make install
