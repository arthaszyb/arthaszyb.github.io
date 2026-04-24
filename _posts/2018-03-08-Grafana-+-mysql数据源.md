---
title: "Grafana + mysql数据源"
date: 2018-03-08 04:02:33 +0000
categories: ["监控告警"]
tags: []
description: "2017年10月18日 21:18:53 3185人阅读 评论 (2) 收藏 举报 分类： 【监控】 （3） 版权声明：转载请注明出处，谢谢 http://blog.csdn.net/sweatOtt/article/details/78278011 1.首先去官网下载 grafana 传送官网 2.解压后进入 con"
source: "evernote-local-db"
---

Grafana + mysql数据源
2017年10月18日 21:18:53
3185人阅读

评论
(2)

收藏

举报

分类：
【监控】
（3）

版权声明：转载请注明出处，谢谢
http://blog.csdn.net/sweatOtt/article/details/78278011
1.首先去官网下载
grafana

传送官网

2.解压后进入
conf
目录，修改
default.ini
(虽然官网不推荐直接修改这个文件)，要使用
mysql
作为数据源，需要修改的内容:
[database]
# You can configure the database connection by specifying type, host, name, user and password
# as separate properties or as on string using the url property.
# Either "mysql", "postgres" or "sqlite3", it's your choice
type = mysql
host = 127.0.0.1:3306
name =
user =
# If the password contains # or ; you have to wrap it with triple quotes. Ex """#password;"""
password =
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
官网推荐添加一个有
SELECT
权限的账号即可，但是根据使用，
grafana
会创建表，所以还需要
CREATE
权限，鉴于比较麻烦，直接创建一个
ALL
权限的数据库账号。
3.
./bin/grafana-server
启动
grafana

4.访问
localhost:3000
首先配置数据源

根据自己选项配置信息。
5.创建
dashboard
，选一个需要的类型，这里以
graph
为例。

点击
Panel Title
(当然点上面一条黑的都可以)，会弹出对话框选择
edit
，弹出一个配置框

根据提示写
SQL
,
<
time_column>
是一个时间戳，也就是说你的数据里要带有一个这样的字段。
<
value column>
表示要显示的数据，
<
series name column>
表示要显示哪一些数据，举个例子
part
字段有
2
个值，0、1，那么就会有2条线展示数据。
$__timeFilter
是宏定义，点击
show help
里面会有描述。之后只要
ctrl+s
保存配置信息就好。
看一下效果，因为这里只是随便展示，效果不是很好，因为同一个时间段出现了多个数据
