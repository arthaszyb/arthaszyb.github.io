---
title: "set names utf8的内部执行原理"
date: 2015-01-21 17:41:36 +0000
categories: ["MySQL [2]"]
tags: ["Pages"]
description: "Wednesday, January 21, 2015 5:41 PM 解决乱码的方法，我们经常使用“ set names utf8 ”,那么为什么加上这句代码就可以解决了呢？下面跟着我一起来深入set names utf8的内部执行原理 先说MySQL的字符集问题。Windows下可通过修改my.ini内的 PHP代"
source: "evernote-local-db"
---

set names utf8的内部执行原理
Wednesday, January 21, 2015
5:41 PM
set names utf8的内部执行原理

解决乱码的方法，我们经常使用“
set names utf8
”,那么为什么加上这句代码就可以解决了呢？下面跟着我一起来深入set names utf8的内部执行原理
先说MySQL的字符集问题。Windows下可通过修改my.ini内的
PHP代码
[mysql]
default-character-set=utf8 //
客户端的默认字符集

[mysqld]
default-character-set=utf8 //服务器端默认的字符集
假设我们把两个都设为
utf8
，然后在
MySQL Command Line Client
里面输入
“show variebles like“character_set_%”;”
，可看到如下字符：

character_set_client latin1

character_set_connection latin1

character_set_database utf8

character_set_results latin1

character_set_server utf8

character_set_system utf8

要是我们通过采用
UTF-8
的
PHP
程序从数据库里读取数据，很有可能是一串
“?????”
或者是其他乱码。
解决办法是，在连接数据库之后，读取数据之前，先执行一项查询“SET NAMES UTF8”，即在PHP里为
mysql_query("SET NAMES UTF8");
//该句话一定要放在数据库服务器连接语句【$connection=mysql_connect($db_host,$db_user,$db_psw)or die("连接服务器失败");】之后
即可显示正常（只要数据库里信息的字符正常）。
到MySQL命令行输入“SET NAMES UTF8;”，然后执行“show variebles like“character_set_%”;”，发现原来为latin1的那些变量“character_set_client”、“character_set_connection”、“character_set_results”的值全部变为utf8了，原来是这3个变量在捣蛋。
查阅手册，上面那句等于：
SET character_set_client = utf8;
SET character_set_results = utf8;
SET character_set_connection = utf8;
看看这
3
个变量的作用：

信息输入路径：
client
→
connection
→
server
；

信息输出路径：
server
→
connection
→
results
。

换句话说，每个路径要经过
3
次改变字符集编码。以出现乱码的输出为例，
server
里
utf8
的数据，传入
connection
转为
latin1
，传入
results
转为
latin1
，
utf-8
页面又把
results
转过来。如果两种字符集不兼容，比如
latin1
和
utf8
，转化过程就为不可逆的，破坏性的。
但这里要声明一点，“SET NAMES UTF8”作用只是临时的，MySQL重启后就恢复默认了。
接下来就说到
MySQL
在服务器上的配置问题了。岂不是我们每次对数据库读写都得加上
“SET NAMESUTF8”
，以保证数据传输的编码一致？能不能通过配置
MySQL
来达到那三个变量默认就为我们要想的字符集？手册上没说，我在网上也没找到答案。所以，从服务器配置的角度而言，是没办法省略掉那行代码的。

总结：为了让你的网页能在更多的服务器上正常地显示，还是加上
“SET NAMES UTF8”
吧，即使你现在没有加上这句也能正常访问。
转载自：
http://hi.baidu.com/myt1988/blog/item/335786808ab7b8ce9123d9b7.html

已使用 Microsoft OneNote 2016 创建。
