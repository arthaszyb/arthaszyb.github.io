---
title: "[解决方法]MySql提示:The server quit without updating PID file(…)失败"
date: 2013-11-20 14:22:56 +0000
categories: ["MySQL [2]"]
tags: ["Pages"]
description: "Wednesday, November 20, 2013 2:22 PM Linux专题 REKFAN.COM 2012-08-13 14109浏览 2评论 服务器症状： 今天网站web页面提交内容到数据库，发现出错了，一直提交不了，数找了下原因，发现数据写不进去！第一反应，重启mysql数据库，一直执行中，停止不了也"
source: "evernote-local-db"
---

[解决方法]MySql提示:The server quit without updating PID file(…)失败
Wednesday, November 20, 2013
2:22 PM
[解决方法]MySql提示:The server quit without updating PID file(…)失败
Linux专题

REKFAN.COM
2012-08-13
14109浏览

2评论

服务器症状：

今天网站web页面提交内容到数据库，发现出错了，一直提交不了，数找了下原因，发现数据写不进去！第一反应，重启mysql数据库，一直执行中，停止不了也启动不了，直觉告诉我磁盘满了 ！用df命令查了下，果然磁盘满了，因为当时分区采用系统默认，不知道为什么不能自动扩容！以后在处理这个问题！如图所示：
[root@rekfan ~]# df

文件系统 1K-块 已用 可用 已用% 挂载点

/dev/mapper/vg_rekfan-lv_root

51606140 47734848 1249852 100% /

tmpfs 1953396 88 1953308 1% /dev/shm

/dev/sda1 495844 37062 433182 8% /boot

/dev/mapper/vg_rekfan-lv_home

229694676 191796 217835016 1% /home

[root@rekfan ~]#
删除了些没用的日志后，重新启动数据库还是出错。
http://blog.rekfan.com/?p=186
[root@rekfan mysql]# service mysql restart

MySQL server PID file could not be found![失败]

Starting MySQL…The server quit without updating PID file (/usr/local/mysql/data/rekfan.pid).[失败]
google了下 ，问题可能的原因有多种，具体什么原因最好的办法是先查看下错误日志：
1.可能是/usr/local/mysql/data/rekfan.pid文件没有写的权限
解决方法 ：给予权限，执行 “chown -R mysql:mysql /var/data” “chmod -R 755 /usr/local/mysql/data” 然后重新启动mysqld！
2.可能进程里已经存在mysql进程
解决方法：用命令“ps -ef|grep mysqld”查看是否有mysqld进程，如果有使用“kill -9 进程号”杀死，然后重新启动mysqld！
3.可能是第二次在机器上安装mysql，有残余数据影响了服务的启动。
解决方法：去mysql的数据目录/data看看，如果存在mysql-bin.index，就赶快把它删除掉吧，它就是罪魁祸首了。本人就是使用第三条方法解决的 ！
http://blog.rekfan.com/?p=186
4.mysql在启动时没有指定配置文件时会使用/etc/my.cnf配置文件，请打开这个文件查看在[mysqld]节下有没有指定数据目录(datadir)。
解决方法：请在[mysqld]下设置这一行：datadir = /usr/local/mysql/data
5.skip-federated字段问题
解决方法：检查一下/etc/my.cnf文件中有没有没被注释掉的skip-federated字段，如果有就立即注释掉吧。
6.错误日志目录不存在
解决方法：使用“chown” “chmod”命令赋予mysql所有者及权限
7.selinux惹的祸，如果是centos系统，默认会开启selinux
解决方法：关闭它，打开/etc/selinux/config，把SELINUX=enforcing改为SELINUX=disabled后存盘退出重启机器试试。

已使用 Microsoft OneNote 2016 创建。
