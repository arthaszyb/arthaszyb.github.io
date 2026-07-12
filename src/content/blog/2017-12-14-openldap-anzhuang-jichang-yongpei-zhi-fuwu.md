---
title: openldap安装及常用配置（服务端配置亲测可用）
date: '2017-12-14'
description: >-
  2017年12月14日 11:14 openldap安装及常用配置（服务端配置亲测可用） April 20, 2015
  openLDAP是LDAP（轻量目录访问协议）在linux系统上的实现，和windows下的AD域是一回事，主要是用来构建集中的身份验证系统，提供高效的查找和管理信息服务
category: linux
tags:
  - dns
  - nfs
  - ldap
  - ssl-tls
  - 高可用
draft: false
source: evernote-local-db
lang: zh
---
2017年12月14日

11:14

**openldap安装及常用配置（服务端配置亲测可用）**

April 20, 2015

openLDAP是LDAP（轻量目录访问协议）在linux系统上的实现，和windows下的AD域是一回事，主要是用来构建集中的身份验证系统，提供高效的查找和管理信息服务，可以减少管理成本并保持数据一致性。

服务器环境：centos 6.6 64位

**一、配置OpenLDAP Server**

**1.安装**

服务器端所需的软件：

1. openldap 包含配置文件、库、文档等

2. openldap-server slapd服务器

3. openldap-client 客户端程序

4. openldap-devel 开发套件，供第三方程序调用

yum自带的源里就有了，直接yum安装：

yum install -y openldap openldap-servers openldap-clients openldap-devel

**2.配置slapd**

有两个文件要复制：slapd的配置文件和数据库文件，将openldap-servers自带的example复制到相应目录：

cp /usr/share/openldap-servers/slapd.conf.obsolete /etc/openldap/slapd.conf

cp /usr/share/openldap-servers/DB\_CONFIG.example /var/lib/ldap/DB\_CONFIG

chown -R ldap.ldap /etc/openldap

chown -R ldap.ldap /var/lib/ldap

使用slappasswd创建LDAP管理员密码，这个命令不会直接将密码写入配置，运行slappasswd后输入两次密码，会返回一串密文，复制下这个密文。

编辑/etc/openldap/slapd.conf，找到”database bdb“，按照自己的需求更改下面的：(如果没有该文件，去别的机器上考一个过来---yau)

suffix "dc=52os,dc=net"

rootdn "cn=admin,dc=52os,dc=net" //管理员为admin

rootpw {SSHA}QeLa25YmQt3csWI2eWcrXbtylxpq5FQ0 //复制的管理员的密码，也支持明文

测试并生成配置文件：

rm -rf /etc/openldap/slapd.d/\* //删除原文件

service slapd start //生成bdb文件

slaptest -f /etc/openldap/slapd.conf -F /etc/openldap/slapd.d //生成配置文件

chown -R ldap:ldap /etc/openldap/slapd.d

配置完成重启服务：

service slapd restart

chkconfig slapd on //设置开机自启动

经过上面的配置后，openldap server就配置好了。

查看LDAP数据库结构：

ldapsearch -x -H ldap://127.0.0.1 -b 'dc=52os,dc=net'

会返回类似：

\# extended LDIF

\# LDAPv3

\# base <dc=52os,dc=net> with scope subtree

\# filter: (objectclass=\*)

\# requesting: ALL

\# search result

search: 2

result: 32 No such object

\# numResponses: 1

**3.配置并迁移系统用户**

配置好的LDAP数据库是空的，需要将系统上的用户导入到LDAP数据库中。需要用migrationtools将系统用户转换为LDAP能识别的ldif文件。

先新建一个test用户作为测试用户：

useradd test

echo "pwdpwd" |passwd --stdin test

安装migrationtools：

yum install migrationtools

配置migrationtools：

编辑/usr/share/migrationtools/migrate\_common.ph ，按需更改下面两行：

$DEFAULT\_MAIL\_DOMAIN = "52os.net";

$DEFAULT\_BASE = "dc=52os,dc=net";

生成ldif文件：

./migrate\_base.pl >/tmp/base.ldif

./migrate\_passwd.pl /etc/passwd >/tmp/passwd.ldif

./migrate\_group.pl /etc/group >/tmp/group.ldif

如果有需要，也可以编辑passwd.ldif和group.ldif去掉不需要的条目。

将生成的ldif导入到LDAP数据库：

ldapadd -x -D "cn=admin,dc=52os,dc=net" -W -f /tmp/base.ldif

ldapadd -x -D "cn=admin,dc=52os,dc=net" -W -f /tmp/passwd.ldif

ldapadd -x -D "cn=admin,dc=52os,dc=net" -W -f /tmp/group.ldif

需要输入LDAP管理员密码，在用上面的ldapsearch命令就能查看到导入的数据。

**二、客户端配置**

客户端配置有两种方法：

1. 使用authconfig-tui ，也就是setup命令中的 "Authentication configuration"

2. 手动配置

无论哪种方式，都要先安装客户端：

yum -y install openldap openldap-clients nss-pam-ldapd pam\_ldap

第一种方法：

在命令行中输入authconfig-tui或者setup命令中选择"Authentication configuration"，选中 ”Use LDAP“和“Use LDAP Authentication”，之后点击NEXT，输入服务器地址和“BASE DN”即可。全部图形化添加，非常简单，推荐使用。

第二种方法需要修改文件较多：

编辑/etc/openldap/ldap.conf，加入：

URI ldap://10.11.15.78/ //LDAP服务器地址

BASE dc=52os,dc=net

TLS\_CACERTDIR /etc/openldap/cacerts

编辑/etc/nslcd.conf，加入：

uri ldap://10.11.15.78/

base dc=52os,dc=net

ssl no

tls\_cacertdir /etc/openldap/cacerts

系统命名服务（NSS）配置使用LDAP，编辑 /etc/nsswitch.conf，修改如下几项为：

passwd: files ldap

shadow: files ldap

group: files ldap

netgroup: files ldap

automount: files ldap

编辑/etc/pam.d/system-auth，修改如下几项为：

auth sufficient pam\_ldap.so use\_first\_pass

account required pam\_unix.so broken\_shadow

account \[default=bad success=ok user\_unknown=ignore\] pam\_ldap.so

password sufficient pam\_ldap.so use\_authtok

session required pam\_unix.so

session optional pam\_ldap.so #这一行要加在pam\_unix.so下面

session optional pam\_mkhomedir.so skel=/etc/skel/ umask=0022 #自动创建用户的宿主目录

编辑/etc/sysconfig/authconfig:

USELDAPAUTH=yes

USELDAP=yes

修改好之后启动nslcd服务，并设置开机启动

service nslcd start && chkconfig nslcd on

验证：

test用户只有在ldap server上有，在客户端如果也能查看到，就说明设置成功：

id test

或者使用：

getent passwd |grep test

这时就能用test账号登录客户端了。

**三、其它设置:**

**1.日志配置**

openLDAP默认是不打日志的，要配合rsyslog才能打日志。

在/etc/openldap/slapd.conf 中设置日志级别，加入：

loglevel 1

具体的loglevel解释，可以：

man slapd.conf

在/etc/rsyslog.conf最后加入：

local4.\* /var/log/slapd.log

重启rsyslog和slapd：

service rsyslog restart

service slapd restart

**2.sudo管理**

在openldap的服务器端拷贝sudo schema到openldap配置目录

cp /usr/share/doc/sudo-1.8.6p3/schema.OpenLDAP /etc/openldap/schema/sudo.schema

加载sudo schema，在/etc/openldap/slapd.conf　 添加：

include /etc/openldap/schema/sudo.schema

重新生产配置文件：

rm -rf /etc/openldap/slapd.d/\*

sudo -u ldap slaptest -f /etc/openldap/slapd.conf -F /etc/openldap/slapd.d

service slapd restart

新建一个sudo.ldif文件，内容为：

dn: ou=Sudoers,dc=52os,dc=net

objectClass: top

objectClass: organizationalUnit

ou: Sudoers

dn: cn=defaults,ou=Sudoers,dc=52os,dc=net

objectClass: top

objectClass: sudoRole

cn: defaults

sudoOption: !visiblepw

sudoOption: always\_set\_home

sudoOption: env\_reset

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

上面的内容按实际情况更改，注意每行最后不要有空格，ldif里的大小写不敏感。我允许sudo的用户是test，允许使用全部命令，允许所有主机sudo

导入sudo.ldif记录:

ldapadd -x -D "cn=admin,dc=52os,dc=net" -W -f sudo.ldif

设置客户端：

在/etc/sudo-ldap.conf中加入：

uri ldap://10.11.15.78

sudoers\_base ou=Sudoers,dc=52os,dc=net

在/etc/nsswitch.conf中加入：

Sudoers: files ldap

在客户端用切换到test用户，测试一下sudo是否可用

**3.用户目录自动挂载**

使用Openldap的好处就是在服务器端建好一个用户后，各个客户端去服务器端验证，不需要在创建该用户。验证通过后会在客户端/home目录下创建该用户的宿主目录，虽然是同一用户，但目前的配置来说，每个客户端和服务器之间宿主目录是独立的，并没有共享服务器端的宿主目录。举例来说，我在服务器端的宿主目录中上传了一份代码，如果客户端共享服务器的宿主目录，当用户在任意一个客户端登录时，都会看到服务器上宿主目录的代码，管理起来就十分方便了。

配置用户目录共享，需要在服务器端安装nfs，在客户端安装autofs。

安装并启动nfs：

yum install nfs-utils

service rpcbind start

service nfslock start

service nfs start

启动好后用chkconfig加入开机启动。

编辑/etc/exports文件，加入：

/home \*(rw,sync)

要注意用户需在nfs服务器/home下有宿主目录，否则autofs无法挂载。"\*"可以写成具体的ip或ip段，设置好后重启nfs服务，测试并查看：

showmount -e localhost

服务器端的nfs配置完成。

客户端要安装autofs和nfs-utils，但nfs服务不用启动:

yum install nfs-utils autofs

配置autofs，在/etc/auto.master最后加入：

/home /etc/auto.nfs

新建一个/etc/auto.nfs文件，内容为：

\* -fstype=nfs 10.11.15.78:/home/&

启动autofs：

service autofs start

用su - test测试是否正常切换,在用mount命令查看挂载：

10.11.15.78:/home/test on /home/test type nfs (rw,vers=4,addr=10.11.15.78,clientaddr=10.11.15.79)

说明挂载成功了，客户端的用户目录和服务器端的用户目录内容就能正常同步了

其它的一些设置，用到在写。

1.安全设置主要有两点：1.启用TLS加密 2.关闭匿名查询

2.主备高可用配置

3.web管理工具：phpldapadmin和LDAP Account Manager

**四、一些问题**

1.用户不能建立宿主目录

提示 “could not chdir to home directory /home/user: No such file or directory”

解决方法：

在 /etc/pam.d/password-auth 和/etc/pam.d/system-auth 都要加入：

session optional pam\_mkhomedir.so skel=/etc/skel/ umask=0022

2.导入ldif文件时报错

ldap\_bind: Invalid credentials (49)

这种情况是管理员密码错误或者rootdn信息错误

3.配置autofs后，切换su - test 报错

Creating directory '/home/test'.

Unable to create and initialize directory '/home/test'.

su: warning: cannot change directory to /home/test: No such file or directory

这是由于nfs服务器上/home下没有test用户的宿主目录造成的，且权限要正确，否则autofs无法挂载目录，用户也无法在客户端登录。

参考文章：

[http://www.zhukun.net/archives/7548](http://www.zhukun.net/archives/7548)

[http://54im.com/openldap/centos-6-yum-install-openldap-phpldapadmin-tls-%E5%8F%8C%E4%B8%BB%E9%85%8D%E7%BD%AE.html](http://54im.com/openldap/centos-6-yum-install-openldap-phpldapadmin-tls-%E5%8F%8C%E4%B8%BB%E9%85%8D%E7%BD%AE.html)

[http://www.ibm.com/developerworks/cn/linux/l-openldap/](http://www.ibm.com/developerworks/cn/linux/l-openldap/)

来自 <[https://www.52os.net/articles/openldap-install-and-settings.html](https://www.52os.net/articles/openldap-install-and-settings.html)\>
