---
title: "通过cp整个mysql程序目录快速安装mysql"
date: 2013-12-10 15:51:05 +0000
categories: ["MySQL [2]"]
tags: ["Pages"]
description: "Tuesday, December 10, 2013 3:51 PM 1.原mysqldata目录和my.cnf最好放在程序目录中，如mysql/data/，这样源程序tar打包比较方便； 2.目标机器上useradd mysql，yum remove mysql,删除/etc/my.cnf，因为默认会读取这里的cnf"
source: "evernote-local-db"
---

通过cp整个mysql程序目录快速安装mysql
Tuesday, December 10, 2013
3:51 PM
1.原mysqldata目录和my.cnf最好放在程序目录中，如mysql/data/，这样源程序tar打包比较方便；
2.目标机器上useradd mysql，yum remove mysql,删除/etc/my.cnf，因为默认会读取这里的cnf文件；
3.直接拷贝源程序的压缩包过来，解压到mysql目录中，保证mysql属主。
4.执行mysql启动程序mysql/mysqld_safe --defaults-file=mysql/my.cnf，启动成功；
5.至此新的mysql内数据与源数据一致，包括用户及权限。

已使用 Microsoft OneNote 2016 创建。
