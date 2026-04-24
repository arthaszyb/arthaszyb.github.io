---
title: "原sql语句中join on和where用法的区别和联系"
date: 2017-07-18 02:01:11 +0000
categories: ["BigData"]
tags: ["新分区 1"]
description: "2017 年 7 月 18 日 10:01 原 sql语句中join on和where用法的区别和联系 收藏 一个破名想半年 发表于 8个月前 阅读 375 收藏 0 点赞 0 评论 0 摘要: join称为显性连接，where称为隐性连接 对于要达到同一查询结果而言，join和where的用法是语句格式不一样，查询的"
source: "evernote-local-db"
---

2017
年
7
月
18
日
10:01
原
sql语句中join on和where用法的区别和联系

收藏
一个破名想半年

发表于 8个月前

阅读 375

收藏 0

点赞 0

评论 0

摘要: join称为显性连接，where称为隐性连接
对于要达到同一查询结果而言，join和where的用法是语句格式不一样，查询的结果是一样的。
先来看看join的语句分类：
left join :左连接，返回左表中所有的记录以及右表中连接字段相等的记录。
right join :右连接，返回右表中所有的记录以及左表中连接字段相等的记录。
inner join: 内连接，又叫等值连接，只返回两个表中连接字段相等的行。
full join:外连接，返回两个表中的行：left join + right join。
cross join:结果是笛卡尔积，就是第一个表的行数乘以第二个表的行数。
关键字: on
数据库在通过连接两张或多张表来返回记录时，都会生成一张中间的临时表，然后再将这张临时表返回给用户。
在使用left jion时，on和where条件的区别如下：
1、 on条件是在生成临时表时使用的条件，它不管on中的条件是否为真，都会返回左边表中的记录。
2、where条件是在临时表生成好后，再对临时表进行过滤的条件。这时已经没有left join的含义（必须返回左边表的记录）了，条件不为真的就全部过滤掉。
在使用INNER JOIN时会产生一个结果集，WHERE条件在这个结果集中再根据条件进行过滤，如果把条件都放在ON中，在INNER JOIN的时候就进行过滤了，比如
SELECT

*

FROM

A

INNER JOIN

B

ON

B.ID = A.ID

AND

B.State =

1

INNER JOIN

C

ON

B.ID = C.ID
在联查B表时，就把状态不等于1的忽略掉了，这样对于状态不等于1的就不需要去联查C表了
而
SELECT

*

FROM

A

INNER JOIN

B

ON

B.ID = A.ID

INNER JOIN

C

ON

B.ID = C.ID

WHERE

B.State =

1
则不管B的状态是否满足，都去联查C，最后再将B状态满足的查出来。
这样一分析，得出的
结论就是inner join on 比直接where的查询效率要高。
inner join on 后面的条件已经把结果过滤了一遍，而where 则是把限制条件放到最后，执行最后一次查询前结果里值变多了，查询起来变慢了，效率自然变低了。
然而，对于一般的内联接来说，就是没用例如上面的b.state=1这类的多一层限制，它和where的效率是一样的。而且where在写法上简单，因此对单表的查询一般都用where即可。

来自

<
https://my.oschina.net/jun24bryant/blog/787375
>

已使用 Microsoft OneNote 2016 创建。
