---
title: openldap的安装备份与迁移（数据导入导出）
date: '2017-12-15'
description: >-
  2017年12月15日 10:24 openldap的安装备份与迁移（数据导入导出） 2013年3月21日admin发表评论阅读评论 1、安装
  安装方式上可以通过源码包和二进制包，我这里选择的是通过centos 的yum 二进制包安装。 安装步骤十分简单。
category: linux
tags:
  - mysql
  - ldap
  - 备份恢复
draft: false
source: evernote-local-db
lang: zh
---
2017年12月15日

10:24

**openldap的安装备份与迁移（数据导入导出）**

2013年3月21日[admin](http://www.361way.com/author/admin)[发表评论](http://www.361way.com/openldap-bak-imp-move/2366.html#respond)[阅读评论](http://www.361way.com/openldap-bak-imp-move/2366.html#comments)

**1、安装**

安装方式上可以通过源码包和二进制包，我这里选择的是通过centos 的yum 二进制包安装。安装步骤十分简单。如下：

yum \-y install openldap\* db4\*

安装完成后，cp配置文件并启动ldap应用

cp /etc/openldap/DB\_CONFIG.example /var/lib/ldap/DB\_CONFIG

service ldap start

**2、生成密码**

密码的生成需要slappaasswd命令完成：

slappasswd

**New** password: 输入密码

**Re**\-enter new password: 再输入密码

生成一个随机的加密密码: {SSHA}**YAz5BrA9hdWVv7HM2Yhd2C2erVVI**/**VVc**

备注：相同的数字随机加密后会不同

**3、编辑slapd.conf文件**

ldap最为重要的一个配置文件应该就是slapd.conf了，我这里主要讲对密码的配置部分。修改内容如下:

suffix "dc=test,dc=com"

rootdn "cn=admin,dc=test,dc=com"

rootpw {SSHA}**YAz5BrA9hdWVv7HM2Yhd2C2erVVI**/**VVc**

备注：前两处视个人情况而修改，密码就是{ssha}后面的那一串。此处使用上面生成的密码替换。

**4、数据备份**

ldap数据备份的方式有两种：一种是通过ldapsearch ，一种是通过slapcat命令。我这里更倾向于使用后者。因为后都使用不涉及到密码输出等问题。直接一条命令搞定

/usr/sbin/slapcat \> /opt/ldap/ldapdbak.ldif

**5、数据的导入**

提到导出就不得不提下导入，ldap的导入命令也有两种：一种是通过ldapadd命令，一种是通过slapadd命令。同样，我倾向于使用后者。方法如下：

slapadd \-l /opt/ldap/ldapdbak.ldif

**6、数据的清空**

数据清空也有两种方式：一种是通过ldapdelete删除，一种通过直接清理物理文件（清理前先关闭ldap应用）。当然ldapdelete除了清空数据外，也可以用于删除部分数据。如果仅仅是清空数据的，我更倾向于使用清空物理文件的方式。默认通过yum安装的ldap的数据文件存放的路径是 /var/lib/ldap ，不过因为域的不同，在该目录下面可能又有根据不同的域命名的目录。有点类似于mysql 下不同的库使用不同的文件夹名字是一个道理 。而如果要清一个域的数据的方法就是直接将该域对应的物理文件删除即可。

**7、数据迁移**

其实在上面几个步骤中已经将迁移的操作都串联进去了。具体操作分两步：一步是源服务器上的导出，一步是目标服务器上的导入。详细如下：

源服务器：

/usr/sbin/slapcat \> /opt/ldap/ldapdbak.ldif

目标服务器：

/etc/init.d/slapd stop

rm \-rf /var/lib/ldap/\*

mkdir 361way.com (创建对应的域目录)

chown \-R ldap:ldap 361way.com

slapadd \-l /opt/ldap/ldapdbak.ldif

chown \-R ldap:ldap 361way.com

/etc/init.d/slapd start

来自 <[http://www.361way.com/openldap-bak-imp-move/2366.html](http://www.361way.com/openldap-bak-imp-move/2366.html)\>
