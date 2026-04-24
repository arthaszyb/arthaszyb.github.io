---
title: "Prometheus入门"
date: 2018-03-05 07:57:37 +0000
categories: ["监控告警"]
tags: []
description: "http://www.hi-linux.com/posts/25047.html 什么是TSDB？TSDB(Time Series Database)时序列数据库，我们可以简单的理解为一个优化后用来处理时间序列数据的软件，并且数据中的数组是由时间进行索引的。 时间序列数据库的特点 大部分时间都是写入操作。 写入操作几乎"
source: "evernote-local-db"
---

Prometheus入门
http://www.hi-linux.com/posts/25047.html
什么是TSDB？TSDB(Time Series Database)时序列数据库，我们可以简单的理解为一个优化后用来处理时间序列数据的软件，并且数据中的数组是由时间进行索引的。 时间序列数据库的特点 大部分时间都是写入操作。 写入操作几乎是顺序添加，大多数时候数据到达后都以时间排序。 写操作很少写入很久之前的数据，也很少更新数据。大多数情况在数据被采集到数秒或者数分钟后就会被写入数据库。 删除操
