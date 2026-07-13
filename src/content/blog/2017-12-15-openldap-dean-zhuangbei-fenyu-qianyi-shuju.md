---
title: OpenLDAP 备份与迁移
date: '2017-12-15'
description: "OpenLDAP 数据备份、导入、清空、迁移的方法。包括 slapcat（备份）、slapadd（导入）、ldapdelete（删除）等命令用法。"
category: linux
tags:
  - ldap
  - 备份恢复
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.361way.com/openldap-bak-imp-move/2366.html
---

## 安装

```bash
yum -y install openldap* db4*
cp /etc/openldap/DB_CONFIG.example /var/lib/ldap/DB_CONFIG
service ldap start
```

## 生成密码

```bash
slappasswd
```

输入密码两次，生成加密密码（相同密码每次加密结果不同）。

## 编辑 slapd.conf

编辑 `/etc/openldap/slapd.conf`，修改以下配置（根据实际情况修改域和密码）：

```ini
suffix "dc=test,dc=com"
rootdn "cn=admin,dc=test,dc=com"
rootpw {SSHA}YAz5BrA9hdWVv7HM2Yhd2C2erVVI/VVc
```

## 备份（导出）

```bash
/usr/sbin/slapcat > /opt/ldap/ldapdbak.ldif
```

使用 `slapcat` 而非 `ldapsearch`，无需输入密码。

## 导入

```bash
slapadd -l /opt/ldap/ldapdbak.ldif
```

## 清空数据

两种方式：

1. 通过 `ldapdelete` 删除单条或全部数据
2. 直接清理物理文件（需先停止 slapd）：

```bash
/etc/init.d/slapd stop
rm -rf /var/lib/ldap/*
/etc/init.d/slapd start
```

数据文件默认存放在 `/var/lib/ldap`，可能存在以域命名的子目录。

## 数据迁移

**源服务器导出：**

```bash
/usr/sbin/slapcat > /opt/ldap/ldapdbak.ldif
```

**目标服务器导入：**

```bash
/etc/init.d/slapd stop
rm -rf /var/lib/ldap/*
mkdir 361way.com
chown -R ldap:ldap 361way.com
slapadd -l /opt/ldap/ldapdbak.ldif
chown -R ldap:ldap 361way.com
/etc/init.d/slapd start
```
