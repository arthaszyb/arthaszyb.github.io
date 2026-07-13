---
title: OpenLDAP 安装及常用配置
date: '2017-12-14'
description: "OpenLDAP（LDAP 在 Linux 上的实现）用于构建集中身份验证系统。本文包含服务端配置、用户迁移、客户端配置、日志、sudo 管理、用户目录挂载等完整步骤。"
category: linux
tags:
  - ldap
  - nfs
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
origin_url: https://www.52os.net/articles/openldap-install-and-settings.html
---

OpenLDAP 用于构建集中的身份验证系统（相当于 Windows AD 域）。以下以 CentOS 6.6 64位 为例。

## 一、服务端配置

### 安装

```bash
yum install -y openldap openldap-servers openldap-clients openldap-devel
```

所需软件：openldap（配置文件、库、文档）、openldap-server（slapd 服务）、openldap-clients、openldap-devel。

### 配置 slapd

复制配置和数据库文件：

```bash
cp /usr/share/openldap-servers/slapd.conf.obsolete /etc/openldap/slapd.conf
cp /usr/share/openldap-servers/DB_CONFIG.example /var/lib/ldap/DB_CONFIG
chown -R ldap.ldap /etc/openldap
chown -R ldap.ldap /var/lib/ldap
```

生成管理员密码（运行后输入两次，返回密文）：

```bash
slappasswd
```

编辑 `/etc/openldap/slapd.conf`，在 `database bdb` 段修改：

```ini
suffix “dc=52os,dc=net”
rootdn “cn=admin,dc=52os,dc=net”
rootpw {SSHA}QeLa25YmQt3csWI2eWcrXbtylxpq5FQ0
```

测试并生成配置文件：

```bash
rm -rf /etc/openldap/slapd.d/*
slaptest -f /etc/openldap/slapd.conf -F /etc/openldap/slapd.d
chown -R ldap:ldap /etc/openldap/slapd.d
```

启动服务：

```bash
service slapd start
service slapd restart
chkconfig slapd on
```

查看 LDAP 数据库结构：

```bash
ldapsearch -x -H ldap://127.0.0.1 -b 'dc=52os,dc=net'
```

### 用户迁移

创建测试用户：

```bash
useradd test
echo "pwdpwd" | passwd --stdin test
```

安装迁移工具：

```bash
yum install migrationtools
```

编辑 `/usr/share/migrationtools/migrate_common.ph`：

```bash
$DEFAULT_MAIL_DOMAIN = "52os.net";
$DEFAULT_BASE = "dc=52os,dc=net";
```

生成 LDIF 文件：

```bash
./migrate_base.pl > /tmp/base.ldif
./migrate_passwd.pl /etc/passwd > /tmp/passwd.ldif
./migrate_group.pl /etc/group > /tmp/group.ldif
```

导入到 LDAP 数据库：

```bash
ldapadd -x -D "cn=admin,dc=52os,dc=net" -W -f /tmp/base.ldif
ldapadd -x -D "cn=admin,dc=52os,dc=net" -W -f /tmp/passwd.ldif
ldapadd -x -D "cn=admin,dc=52os,dc=net" -W -f /tmp/group.ldif
```

## 二、客户端配置

### 安装

```bash
yum install -y openldap openldap-clients nss-pam-ldapd pam_ldap
```

### 方法一：图形化配置（推荐）

运行 `authconfig-tui` 或 `setup`，选择 Authentication configuration，勾选 Use LDAP 和 Use LDAP Authentication，输入服务器地址和 BASE DN。

### 方法二：手动配置

编辑 `/etc/openldap/ldap.conf`：

```ini
URI ldap://10.11.15.78/
BASE dc=52os,dc=net
TLS_CACERTDIR /etc/openldap/cacerts
```

编辑 `/etc/nslcd.conf`：

```ini
uri ldap://10.11.15.78/
base dc=52os,dc=net
ssl no
tls_cacertdir /etc/openldap/cacerts
```

编辑 `/etc/nsswitch.conf`：

```ini
passwd: files ldap
shadow: files ldap
group: files ldap
netgroup: files ldap
automount: files ldap
```

编辑 `/etc/pam.d/system-auth`：

```bash
auth sufficient pam_ldap.so use_first_pass
account required pam_unix.so broken_shadow
account [default=bad success=ok user_unknown=ignore] pam_ldap.so
password sufficient pam_ldap.so use_authtok
session required pam_unix.so
session optional pam_ldap.so
session optional pam_mkhomedir.so skel=/etc/skel/ umask=0022
```

编辑 `/etc/sysconfig/authconfig`：

```ini
USELDAPAUTH=yes
USELDAP=yes
```

启动服务：

```bash
service nslcd start
chkconfig nslcd on
```

验证（test 用户应可查到）：

```bash
id test
getent passwd | grep test
```

## 三、其他设置

### 日志配置

编辑 `/etc/openldap/slapd.conf`：

```ini
loglevel 1
```

编辑 `/etc/rsyslog.conf` 最后加入：

```bash
local4.* /var/log/slapd.log
```

重启服务：

```bash
service rsyslog restart
service slapd restart
```

### sudo 管理

服务端：复制 sudo schema

```bash
cp /usr/share/doc/sudo-1.8.6p3/schema.OpenLDAP /etc/openldap/schema/sudo.schema
```

编辑 `/etc/openldap/slapd.conf` 加入：

```bash
include /etc/openldap/schema/sudo.schema
```

重新生成配置：

```bash
rm -rf /etc/openldap/slapd.d/*
sudo -u ldap slaptest -f /etc/openldap/slapd.conf -F /etc/openldap/slapd.d
service slapd restart
```

创建 sudo.ldif 文件：

```ldif
dn: ou=Sudoers,dc=52os,dc=net
objectClass: top
objectClass: organizationalUnit
ou: Sudoers

dn: cn=defaults,ou=Sudoers,dc=52os,dc=net
objectClass: top
objectClass: sudoRole
cn: defaults
sudoOption: !visiblepw
sudoOption: always_set_home
sudoOption: env_reset
sudoOption: requiretty

dn: cn=test,ou=Sudoers,dc=52os,dc=net
objectClass: top
objectClass: sudoRole
cn: test
sudoCommand: ALL
sudoHost: ALL
sudoOption: !authenticate
sudoRunAsUser: ALL
sudoUser: test
```

导入：

```bash
ldapadd -x -D "cn=admin,dc=52os,dc=net" -W -f sudo.ldif
```

客户端配置 `/etc/sudo-ldap.conf`：

```ini
uri ldap://10.11.15.78
sudoers_base ou=Sudoers,dc=52os,dc=net
```

编辑 `/etc/nsswitch.conf` 加入：

```bash
Sudoers: files ldap
```

### 用户目录自动挂载

需要服务端 NFS 和客户端 autofs。

**服务端：**

```bash
yum install nfs-utils
service rpcbind start
service nfslock start
service nfs start
chkconfig nfs on
```

编辑 `/etc/exports`：

```bash
/home *(rw,sync)
```

验证：

```bash
showmount -e localhost
```

**客户端：**

```bash
yum install nfs-utils autofs
```

编辑 `/etc/auto.master`，加入：

```bash
/home /etc/auto.nfs
```

创建 `/etc/auto.nfs`：

```bash
* -fstype=nfs 10.11.15.78:/home/&
```

启动：

```bash
service autofs start
```

验证（用户目录应自动挂载）：

```bash
su - test
mount | grep /home/test
```

## 四、常见问题

1. **用户不能建立宿主目录**：提示 `could not chdir to home directory /home/user: No such file or directory`

   在 `/etc/pam.d/password-auth` 和 `/etc/pam.d/system-auth` 加入：
   ```bash
   session optional pam_mkhomedir.so skel=/etc/skel/ umask=0022
   ```

2. **导入 ldif 报错**：`ldap_bind: Invalid credentials (49)`

   管理员密码或 rootdn 信息错误。

3. **autofs 切换用户报错**：`Creating directory '/home/test'. Unable to create and initialize directory '/home/test'.`

   NFS 服务器 `/home` 下没有该用户的宿主目录，或权限不正确。

