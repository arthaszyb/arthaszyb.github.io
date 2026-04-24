---
title: "confulence 的安装与迁移"
date: 2015-06-03 09:27:56 +0000
categories: ["其他"]
tags: []
description: "2014年10月27日 by jeffrey | 0 comments 一、全新安装confluence 1、将 atlassian-confluence-4.1.5.zip copy 到 目录/usr/local/project/confluence/下 2、解压 atlassian-confluence-4.1.5"
source: "evernote-local-db"
---

confulence 的安装与迁移
2014年10月27日

by jeffrey
|
0 comments
一、全新安装confluence
1、将 atlassian-confluence-4.1.5.zip copy 到 目录/usr/local/project/confluence/下
2、解压 atlassian-confluence-4.1.5.zip
3、执行 /usr/local/project/confluence/atlassian-confluence-4.1.5/bin/start-confluence.sh，即可启动confluence 默认端口为8090
4、设置管理员的用户名密码：admin:admin
5、第一次访问confluence 会要求指定数据文件存放地址：我们的是/usr/local/project/confluence/confluence-data， 以及数据库我们选用HSQL , 数据库文件位置在 /usr/local/project/confluence/confluence-data/database

二、迁移confluence
如果要迁移confluence,：
1、将/usr/local/project/confluene 目录下全部内容，copy到新机器新目录下。
2、修改数据文件地址“confluence.home”，修改 ./confluence/atlassian-confluence-4.1.5/confluence/WEB-INF/classes/confluence-init.properties，找到下面一行，修改
confluence.home=/usr/local/project/confluence/confluence-data
3、修改 hsqldb配置： 修改 ./confluence/confluence-data/confluence.cfg.xml, 找到下面这一行，修改hsqldb存储的路径地址。

<
property name=”hibernate.connection.url”>
jdbc:hsqldb:/usr/local/project/confluence/confluence-data/database/confluencedb;hsqldb.tx=MVCC
<
/property>
