---
title: "【MySQL实践经验】LOAD DATA INFILE 报错 ERROR 1148 (42000) 或 ERROR 1045 (28000)的解决办法"
date: 2014-07-30 16:07:02 +0000
categories: ["MySQL [2]"]
tags: ["Pages"]
description: "Wednesday, July 30, 2014 4:07 PM 分类： Database 2013-04-07 19:16 1202 人阅读 评论 (0) 收藏 举报 mysql load data 在部署在不同机器上的mysql数据库之间导数据时，load data infile是一个很高效的命令，从host1的d"
source: "evernote-local-db"
---

【MySQL实践经验】LOAD DATA INFILE 报错 ERROR 1148 (42000) 或 ERROR 1045 (28000)的解决办法
Wednesday, July 30, 2014
4:07 PM

【MySQL实践经验】LOAD DATA INFILE 报错 ERROR 1148 (42000) 或 ERROR 1045 (28000)的解决办法
分类：

Database
2013-04-07 19:16 1202
人阅读

评论
(0)
收藏

举报
mysql load data
在部署在不同机器上的mysql数据库之间导数据时，load data infile是一个很高效的命令，从host1的db1.table1通过select ... into outfile将数据导入文本文件，然后通过load data infile将数据导入host2的db2.table1。
使用过程中碰到一些典型问题及并最终找到解决方法。作为笔记，记录与此。
1. root
用户（这里只
mysql
的
root
，非
Linux
系统的
root
）在
mysql server
部署机器通过
load data infile
命令导入数据时，只要文件路径指定正确，一般不会有问题

2.

非
root
用户在
mysql server
部署机器通过
load data infile
命令导入数据时，报错：

ERROR 1045 (28000): Access denied for user 'xxx'@'xxx' (using password: YES)

可能原因：
这个一般是因为非
root
用户没有
FILE Privilege
，可以通过
show grants
查看当前登陆用户的权限，也可以通过
select mysql.user
查看某用户的权限，一般情况下，
normal user
是无
FILE
权限的

三种解决办法：

1
）命令加
local
参数，用
load data local infile 'filename' into table xxx.xxx
来导数据（推荐使用）

2
）给
normal user
开通
FILE Privilege
，注意：
FILE
权限与
SELECE/DELETE/UPDATE
等不同，后者是可以具体指定到某个
db
的某个表的，而
FILE
则是全局的，即只能通过
grant FILE on *.* to 'xxx'@'xxx'
才能使
FILE
权限对所有
db
的所有
tables
生效。通过
grant all on db.* to 'xxx'@'xxx'
不能使指定的
user
在指定的
db
上具有
FILE
权限。

根据最小权限原则（操作系统安全的概念），这个方法并不安全，故不推荐使用。

3
）修改
.my.cnf
中的配置，具体方法见
此处
3.

非
root
用户从
client
机器
load data local infile
至
remote mysql server
时，报错：

ERROR 1148 (42000): The used command is not allowed with this MySQL version

可能原因
（
from mysql reference manual
）：

If LOAD DATA LOCAL is disabled, either in the server or the client, a client that attempts to issue such a statement receives the following error message:

ERROR 1148: The used command is not allowed with this MySQL version

可见，出于安全考虑，默认是不允许从
client host
远程通过
load data
命令导数据的

解决办法：

For the mysql command-line client, enable LOAD DATA LOCAL by specifying the --local-infile[=1]option, or disable it with the --local-infile=0 option

也即，在需要从
client host
导数据的情况下，登陆
mysql
时，需用
--local-infile[=1]
显式指定参数，典型命令形式为：

mysql --local-infile
-u user -ppasswd

登陆成功后，执行
load data infile 'filename' into table xxx.xxx
即可

(
实践证明是错的
----
周洋
)
正确如下：mysql
--local-infile
-u user -ppasswd -e "load data local infile 'filename' into table xxx.xxx"

==================== EOF ===================

已使用 Microsoft OneNote 2016 创建。
