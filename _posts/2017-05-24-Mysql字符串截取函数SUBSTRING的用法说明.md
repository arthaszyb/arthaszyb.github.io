---
title: "Mysql字符串截取函数SUBSTRING的用法说明"
date: 2017-05-24 14:04:51 +0000
categories: ["MySQL [2]"]
tags: ["Pages"]
description: "Mysql 字符串截取函数 SUBSTRING 的用法说明 作者： 字体： [ 增加 减小 ] 类型：转载 时间： 2011-06-24 我要评论 今天建视图时，用到了 MySQL 中的字符串截取，很是方便。 感觉上 MySQL 的字符串函数截取字符，比用程序截取（如 PHP 或 JAVA ）来得强大，所以在这里做一个"
source: "evernote-local-db"
---

Mysql
字符串截取函数
SUBSTRING
的用法说明
Mysql字符串截取函数SUBSTRING的用法说明
作者： 字体：
[
增加

减小
]

类型：转载 时间：
2011-06-24

我要评论
今天建视图时，用到了
MySQL
中的字符串截取，很是方便。
感觉上
MySQL
的字符串函数截取字符，比用程序截取（如
PHP
或
JAVA
）来得强大，所以在这里做一个记录，希望对大家有用。

函数：

1
、从左开始截取字符串

left
（
str, length
）

说明：
left
（被截取字段，截取长度）

例：
select left
（
content,200
）

as abstract from my_content_t
2
、从右开始截取字符串

right
（
str, length
）

说明：
right
（被截取字段，截取长度）

例：
select right
（
content,200
）

as abstract from my_content_t
3
、截取字符串

substring
（
str, pos
）

substring
（
str, pos, length
）

说明：
substring
（被截取字段，从第几位开始截取）

substring
（被截取字段，从第几位开始截取，截取长度）

例：
select substring
（
content,5
）

as abstract from my_content_t
select substring
（
content,5,200
）

as abstract from my_content_t
（注：如果位数是负数 如
-5

则是从后倒数位数，到字符串结束或截取的长度）

4
、按关键字截取字符串

substring_index
（
str,delim,count
）

说明：
substring_index
（被截取字段，关键字，关键字出现的次数）

例：
select substring_index
（
"blog.jb51.net"
，
"
。
"
，
2
）

as abstract from my_content_t
结果：
blog.jb51
（注：如果关键字出现的次数是负数 如
-2

则是从后倒数，到字符串结束）

函数简介：
SUBSTRING(str,pos) , SUBSTRING(str FROM pos) SUBSTRING(str,pos,len) , SUBSTRING(str FROM pos FOR len)
不带有
len
参数的格式从字符串
str
返回一个子字符串，起始于位置
pos
。带有
len
参数的格式从字符串
str
返回一个长度同
len
字符相同的子字符串，起始于位置
pos
。 使用

FROM
的格式为标准

SQL

语法。也可能对
pos
使用一个负值。假若这样，则子字符串的位置起始于字符串结尾的
pos
字符，而不是字符串的开头位置。在以下格式的函数中可以对
pos
使用一个负值。
详情请查阅手册。
实例：
表
1
：
user
表
2
：
jl
期望效果：通过
user
表
jlid
字段存储的
id
值，读取
jl
表中的相应记录，这里想要读取，
jl
表中
id
为
1
、
2
的记录，首先想到用
in
，但是很遗憾由于
jlid
字段存储的
id
值有
2
个，尽管从形式上符合
in(1,2)
的格式，但是如果你使用
select jl.* from jl where jl.id in(select jlid from user where user.id=1)
来查询的话，是不行的，他总是返回
id
为
1
的记录。
那么怎么办呢？如果我们能够分别得到
1,2
中的
1
和
2
就行了。好在
mysql
也提供了字符串截取函数
SUBSTRING
。
sql
句法如下：
SELECT jl. *
FROM jl
WHERE jl.id = (
SELECT SUBSTRING( (
SELECT user.jlid
FROM user
WHERE user.id =1
), 1, 1 ) )
OR jl.id = (
SELECT SUBSTRING( (
SELECT user.jlid
FROM user
WHERE user.id =1
), 3, 1 )
)
LIMIT 0 , 30
简单解释一下：
SELECT SUBSTRING( (SELECT user.jlid FROM user WHERE user.id =1), 1, 1 ) )
这里用了子查询，首先查询
user
表中，
id
为
1
的
jlid
字段的值，返回的是字符串，然后使用
SUBSTRING
进行截取，得到字符串
1
SELECT SUBSTRING( (SELECT user.jlid FROM user WHERE user.id =1), 3, 1 ) )
这条语句得到
2
1
和
2
都得到了再通过主查询的
where
来查询，要注意我们需要查询
id=1
和
id=2
的记录，所以用到了
OR
，怎么样，是不是有点麻烦，
您的第一直觉是不是要用
2
条
sql
语句，中间再配合
php
的
explode
函数来查询呢？这样想是正常的，但是这两者之间谁的效率高，站长并没有测试，希望有心的你，可以帮忙哦！

来自

<
http://www.jb51.net/article/27458.htm
>

已使用 Microsoft OneNote 2016 创建。
