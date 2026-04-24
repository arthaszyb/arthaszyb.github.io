---
title: "Druid Tranquility使用（上篇） - 翱翔fly"
date: 2018-04-13 09:55:57 +0000
categories: ["监控告警"]
tags: []
description: "首页 开源项目 问答 动弹 博客 翻译 资讯 专题 活动 招聘 码云 特惠 [ 登录 | 注册 ] 博客专区 > 翱翔fly 的博客 > 博客详情 Druid Tranquility使用（上篇） 翱翔fly 发表于8个月前 原 Druid Tranquility使用（上篇） 收藏 翱翔fly 发表于 8个月前 阅读 4"
source: "evernote-local-db"
---

首页

开源项目

问答

动弹

博客

翻译

资讯

专题

活动

招聘

码云
特惠

[
登录
|
注册
]

博客专区
>
翱翔fly
的博客
> 博客详情

Druid Tranquility使用（上篇）

翱翔fly

发表于8个月前

原
Druid Tranquility使用（上篇）

收藏

翱翔fly

发表于
8个月前

阅读
49

收藏
0

点赞
0

评论
0

【腾讯云】买域名送云解析+SSL证书+建站！>>>

1、Tranquility 是单独的http server服务，需要另行下载，下载地址

http://druid.io/downloads.html

2、启动tranquilty

nohup bin/tranquility server -configFile ./conf/pageviews.json >start.log
&

json 文件如下：

{

"dataSources"
: {

"pageviews"
: {

"spec"
: {

"dataSchema"
: {

"dataSource"
:
"pageviews"
,

"parser"
: {

"type"
:
"string"
,

"parseSpec"
: {

"timestampSpec"
: {

"column"
:
"time"
,

"format"
:
"auto"

},

"dimensionsSpec"
: {

"dimensions"
: [
"url"
,
"user"
],

"dimensionExclusions"
: [

"timestamp"
,

"value"

]
},

"format"
:
"json"

}
},

"granularitySpec"
: {

"type"
:
"uniform"
,

"segmentGranularity"
:
"hour"
,

"queryGranularity"
:
"none"

},

"metricsSpec"
: [
{

"name"
:
"views"
,

"type"
:
"count"

},
{

"name"
:
"latencyMs"
,

"type"
:
"doubleSum"
,

"fieldName"
:
"latencyMs"

}
]
},

"ioConfig"
: {

"type"
:
"realtime"

},

"tuningConfig"
: {

"type"
:
"realtime"
,

"maxRowsInMemory"
:
"100000"
,

"intermediatePersistPeriod"
:
"PT10M"
,

"windowPeriod"
:
"PT10M"

}
},

"properties"
: {

"task.partitions"
:
"1"
,

"task.replicants"
:
"1"

}
}
},

"properties"
: {

"zookeeper.connect"
:
"localhost"
,

"druid.discovery.curator.path"
:
"/druid/discovery"
,

"druid.selectors.indexing.serviceName"
:
"druid/overlord"
,

"http.port"
:
"8200"
,

"http.threads"
:
"8"

}
}

3、通过http 直接发送数据 http://192.168.2.41:8200/v1/post/pageviews

{"time": 1501650962363, "url": "/foo/bar", "user": "alice", "latencyMs": 32}

pageviews ：datasource

发送成功后 {
"result": {
"received": 5,
"sent": 5
}
}

如果 sent :0 则，数据未正常发送到druid ,未正常发送原因

1、druid 问题 检查middleManger overlord 节点配置内存

2、发送的时间戳，需要在10分钟内

© 著作权归作者所有

分类：
Druid

字数：
204

标签：

Druid

Tranquility

打赏

点赞

收藏

分享

举报

+ 关注

翱翔fly

高级程序员

济南

粉丝
14

|
博文
40

|
码字总数

6591

相关博客

druid metadata

张欢19933

35

0

druid常见配置

Wilsonp

188

0

druid单机部署

张欢19933

67

0

评论

(
0
)

Ctrl+Enter

社区

开源项目

技术问答

动弹

博客

开源资讯

技术翻译

专题

招聘

众包

项目大厅

软件与服务

接活赚钱

码云

Git代码托管

Team

PaaS

在线工具

活动

线下活动

发起活动

源创会

关注微信公众号

下载手机客户端

©开源中国(OSChina.NET)

关于我们

联系我们

@新浪微博

合作单位

开源中国社区是工信部
开源软件推进联盟
指定的官方社区

粤ICP备12009483号-3
深圳市奥思网络科技有限公司版权所有
