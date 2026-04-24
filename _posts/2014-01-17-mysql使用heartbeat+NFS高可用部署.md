---
title: "mysql使用heartbeat+NFS高可用部署"
date: 2014-01-17 18:15:10 +0000
categories: ["MySQL [2]"]
tags: ["Pages"]
description: "Friday, January 17, 2014 6:15 PM 0.配置各机器的hostname，uname -n检查。 1.配置NFS共享存储。注意所有机器的mysql用户uid一致。挂载共享存储。 vi /etc/export /share_mysql_data *(rw,sync,anonuid=501,ano"
source: "evernote-local-db"
---

mysql使用heartbeat+NFS高可用部署
Friday, January 17, 2014
6:15 PM
0.配置各机器的hostname，uname -n检查。

1.配置NFS共享存储。注意所有机器的mysql用户uid一致。挂载共享存储。
vi /etc/export

/share_mysql_data *(rw,sync,anonuid=501,anongid=501)

2.所有mysql服务器设置data目录为挂载的共享存储。

3.测试各服务器的mysql启动是否正常。注意共享存储情况下每次只能单独启动一个mysql。

4.1.groupadd haclient ； useradd -g haclient hacluster
4.2.安装heartbeat。
yum -y install bison bison-devel docbook-style-xsl flex gettext gettext-devel gnutls gnutls-devel intltool OpenIPMI OpenIPMI-devel
yum install cluster-glue
yum install resource-agents
yum install pacemaker（可选）
rpm -ivh PyXML-0.8.4-19.el6.x86_64.rpm
rpm -ivh heartbeat-libs-3.0.4-1.el6.x86_64.rpm --nodeps
rpm -ivh heartbeat-3.0.4-1.el6.x86_64.rpm
rpm -ivh heartbeat-devel-3.0.4-1.el6.x86_64.rpm

5.配置ha.cf和haresource。注意挂载nfs的配置文件类型为nfs，如下：
vi haresource
host003 IPaddr::192.168.9.85/24/eth0:1 Filesystem::192.168.9.82:/share_mysql_data::/var/mysql/data::
nfs
mysql

6.启动heartbeat，测试

已使用 Microsoft OneNote 2016 创建。
