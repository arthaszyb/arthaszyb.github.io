---
title: "Druid的发送数据和查询数据 - CSDN博客"
date: 2018-04-12 10:38:35 +0000
categories: ["监控告警"]
tags: []
description: "博客 学院 下载 GitChat 论坛 问答 商城 VIP 活动 招聘 ITeye 码云 CSTO .   写博客  发Chat 登录 注册 北京小辉的博客 学习是一种享受，也是一种痛苦，更是一种回忆！！！ . 目录视图 摘要视图 订阅 . . Druid的发送数据和查询数据 标签： 数据 2017年03月17日"
source: "evernote-local-db"
---

博客

学院

下载

GitChat

论坛

问答

商城

VIP

活动

招聘

ITeye

码云

CSTO

.




写博客


发Chat

登录
注册

北京小辉的博客

学习是一种享受，也是一种痛苦，更是一种回忆！！！

.

目录视图

摘要视图

订阅

.

.

Druid的发送数据和查询数据

标签：

数据

2017年03月17日 16:56:18

2650人阅读

评论
(0)

收藏

举报

.

分类：

【数据库】Druid
（6）

.

版权声明：本文为博主原创文章，出处为 http://blog.csdn.net/silentwolfyh https://blog.csdn.net/silentwolfyh/article/details/62891763

目录
(?)
[+]

目录：

1、需求

2、参考

3、数据和配置

4、展现

5、注意事项

————————————————————————————–

1、需求

参考官网，使用Linux向Druid发送数据和查询数据

2、参考

数据来源–Formatting the Data

http://druid.io/docs/0.9.2/ingestion/data-formats.html

配置来源 : 使用druid的默认配置文件

/home/druid/druid-0.9.2/quickstart/wikiticker-index.json

3、数据和配置

1、将官网的数据中的日期修改为当前日期，我只修改了YYYY-MM-DD

2、将basicdata.json放入到HDFS，路径为：/user/druid/basicdata.json

3、将默认配置的dimensions列名，修改为basicdata.json的列名

测试的数据 ：basicdata.json

{"
timestamp
":
"2017-03-17T01:02:33Z"
, "
page
":
"Gypsy Danger"
, "
language
" :
"en"
, "
user
" :
"nuclear"
, "
unpatrolled
" :
"true"
, "
newPage
" :
"true"
, "
robot
":
"false"
, "
anonymous
":
"false"
, "
namespace
":
"article"
, "
continent
":
"North America"
, "
country
":
"United States"
, "
region
":
"Bay Area"
, "
city
":
"San Francisco"
, "
added
":
57
, "
deleted
":
200
, "
delta
":
-
143
}
{"
timestamp
":
"2017-03-17T03:32:45Z"
, "
page
":
"Striker Eureka"
, "
language
" :
"en"
, "
user
" :
"speed"
, "
unpatrolled
" :
"false"
, "
newPage
" :
"true"
, "
robot
":
"true"
, "
anonymous
":
"false"
, "
namespace
":
"wikipedia"
, "
continent
":
"Australia"
, "
country
":
"Australia"
, "
region
":
"Cantebury"
, "
city
":
"Syndey"
, "
added
":
459
, "
deleted
":
129
, "
delta
":
330
}
{"
timestamp
":
"2017-03-17T07:11:21Z"
, "
page
":
"Cherno Alpha"
, "
language
" :
"ru"
, "
user
" :
"masterYi"
, "
unpatrolled
" :
"false"
, "
newPage
" :
"true"
, "
robot
":
"true"
, "
anonymous
":
"false"
, "
namespace
":
"article"
, "
continent
":
"Asia"
, "
country
":
"Russia"
, "
region
":
"Oblast"
, "
city
":
"Moscow"
, "
added
":
123
, "
deleted
":
12
, "
delta
":
111
}
{"
timestamp
":
"2017-03-17T11:58:39Z"
, "
page
":
"Crimson Typhoon"
, "
language
" :
"zh"
, "
user
" :
"triplets"
, "
unpatrolled
" :
"true"
, "
newPage
" :
"false"
, "
robot
":
"true"
, "
anonymous
":
"false"
, "
namespace
":
"wikipedia"
, "
continent
":
"Asia"
, "
country
":
"China"
, "
region
":
"Shanxi"
, "
city
":
"Taiyuan"
, "
added
":
905
, "
deleted
":
5
, "
delta
":
900
}
{"
timestamp
":
"2017-03-17T12:41:27Z"
, "
page
":
"Coyote Tango"
, "
language
" :
"ja"
, "
user
" :
"cancer"
, "
unpatrolled
" :
"true"
, "
newPage
" :
"false"
, "
robot
":
"true"
, "
anonymous
":
"false"
, "
namespace
":
"wikipedia"
, "
continent
":
"Asia"
, "
country
":
"Japan"
, "
region
":
"Kanto"
, "
city
":
"Tokyo"
, "
added
":
1
, "
deleted
":
10
, "
delta
":
-
9
}
1
2
3
4
5

测试的配置： data_schema.json

{
"
type
" :
"index_hadoop"
,
"
spec
" :
{
"
ioConfig
" :
{
"
type
" :
"hadoop"
,
"
inputSpec
" :
{
"
type
" :
"static"
,
"
paths
" :
"/user/druid/basicdata.json"

}

}
,
"
dataSchema
" :
{
"
dataSource
" :
"silentwolf"
,
"
granularitySpec
" :
{
"
type
" :
"arbitrary"
,
"
segmentGranularity
" :
"day"
,
"
queryGranularity
" :
"none"
,
"
intervals
" :
[
"2017-03-17/2017-03-18"
]

}
,
"
parser
" :
{
"
type
" :
"hadoopyString"
,
"
parseSpec
" :
{
"
format
" :
"json"
,
"
dimensionsSpec
" :
{
"
dimensions
" :
[

"page"
,

"language"
,

"user"
,

"unpatrolled"
,

"newPage"
,

"robot"
,

"anonymous"
,

"namespace"
,

"continent"
,

"country"
,

"region"
,

"city"

]

}
,
"
timestampSpec
" :
{
"
format
" :
"auto"
,
"
column
" :
"timestamp"

}

}

}
,
"
metricsSpec
" :
[
{
"
name
" :
"count"
,
"
type
" :
"count"

},
{
"
name
" :
"added"
,
"
type
" :
"longSum"
,
"
fieldName
" :
"added"

},
{
"
name
" :
"deleted"
,
"
type
" :
"longSum"
,
"
fieldName
" :
"deleted"

},
{
"
name
" :
"delta"
,
"
type
" :
"longSum"
,
"
fieldName
" :
"delta"

}
]

}
,
"
tuningConfig
" :
{
"
type
" :
"hadoop"
,
"
jobProperties
" :
{}

}

}

}
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72

测试的查询配置：queryall.json

{
"
queryType
":
"timeseries"
,
"
dataSource
":
"silentwolf"
,
"
intervals
":
[
"2017-03-17/2017-03-18"
]
,
"
granularity
":
"day"
,
"
aggregations
":
[
{"
type
":
"count"
, "
name
":
"count"
},
{ "
name
" :
"deleted"
,"
type
" :
"longSum"
, "
fieldName
" :
"deleted"
},
{ "
name
" :
"delta"
,"
type
" :
"longSum"
,"
fieldName
" :
"delta"
}
]

}
1
2
3
4
5
6
7
8
9
10
11
12

4、展现

发送命令

[root
@tagtic
-master boke]# curl -X
'POST'
-H
'Content-Type: application/json'
-d
@data
_schema.json tagtic-master:
18090
/druid/indexer/v1/task
1

查询命令

[root
@tagtic
-master boke]# curl -X POST
'tagtic-slave01:18082/druid/v2/?pretty'
-H
'Content-Type:application/json'
-d
@queryall
.json
1

发送、查询、数据展现

数据发送状态

5、注意事项

1、找到Druid集群中broker的server和端口，我的broker的端口为18082

[root@tagtic-slave01 yuhui]
# ps -ef | grep broker

druid
52680

52675

1

2
月
20
?
06
:
31
:
04
java -server -Xms16g -Xmx16g -XX:MaxDirectMemorySize=
4096
m -Duser
.timezone
=UTC -Dfile
.encoding
=UTF-
8
-Djava
.io
.tmpdir
=var/tmp -Djava
.util
.logging
.manager
=org
.apache
.logging
.log
4j
.jul
.LogManager
-
cp
conf/druid/_common:conf/druid/broker:lib
/* io.druid.cli.Main server broker
root 89216 67823 0 17:03 pts/0 00:00:00 grep --color=auto broker
1
2
3

2、测试数据要放到HDFS上面

3、dimensions中的列名不要和metricsSpec中的name一样

如果您喜欢我写的博文，读后觉得收获很大，不妨小额赞助我一下，让我有动力继续写出高质量的博文，感谢您的赞赏！！！

上一篇

用shell脚本监控进程是否存在 不存在则启动的实例

下一篇

2017 Pycharm激活码

您还没有登录,请
[登录]
或
[注册]

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

【个人简介】

姓名：余辉

地点：北京昌平

学历：中科院硕士

QQ ：348835027

微信：silentwolfyh

（京东）
（天猫）
（当当）

个人资料

silentwolfyh

博客专家

.

原创

286

粉丝

450

喜欢

166

评论

101

.

等级：

访问量：

56万+

积分：

8301

排名：

3033

.

博客专栏

数据结构

文章：13篇

阅读：8588

文章分类

【重 要】常用资料

(4)

【项目管理及框架】

(4)

【JAVA】Java基础

(13)

【JAVA】JavaWeb

(3)

【JAVA】Java集合

(7)

【JAVA】Java面向对象

(11)

【大数据】实战演练

(2)

【大数据】MapReduce

(9)

【大数据】Scala

(11)

【大数据】Spark

(21)

【大数据】Kafka

(11)

【大数据】Hadoop

(8)

【大数据】Flume

(9)

【大数据】CDH管理及优化

(9)

【大数据】Hive

(8)

【大数据】Hbase

(7)

【大数据】Hbase-Phoenix

(8)

【大数据】Zookeeper

(1)

【大数据】区块链

(2)

【数据库】DB2

(20)

【数据库】Druid

(7)

【数据库】ElasticSearch

(5)

【数据库】Mongodb

(1)

【数据库】Redis

(3)

【数据结构】排序

(12)

【数据结构】查找

(1)

【工 具】英语

(29)

【工 具】工具类

(23)

【工 具】错误集合

(6)

【工 具】杂文

(28)

【工 具】Linux

(20)

【工 具】正则

(3)

【工 具】日志采集

(1)

【工 具】OFFICE

(2)

【工 具】Python

(15)

【工 具】设计模式

(3)

【工 具】Docker

(3)

【工具】SBT

(3)

【工具】GIT

(2)

阅读排行

北京一环 二环 三环 四环 五环 六环 周长和面积

(26157)

Intellij IDEA 2017.2 社区版和商业版：安装和配置

(21918)

Linux：使用awk命令获取文本的某一行，某一列

(21860)

Intellij IDEA15：建立Python 工程

(17677)

Linux：Centos7升级内核

(16597)

Intellij IDEA15： 带着参数 运行

(10547)

IntelliJ IDEA打开多个项目且相互调用代码

(10204)

Intellij IDEA15：安装和配置（svn）

(9989)

详解Mysql数据导入到SQLServer数据库中

(9794)

Docker：bash: vi: command not found

(9541)

联系我们

请扫描二维码联系客服

webmaster@csdn.net
400-660-0108

QQ客服

客服论坛

关于
招聘
广告服务

百度

©1999-2018 CSDN版权所有

京ICP证09002463号

经营性网站备案信息

网络110报警服务

中国互联网举报中心

北京互联网违法和不良信息举报中心

.

.



.



.



.

关闭
