---
title: sql语句含特殊符号的处理
date: '2017-02-05'
description: 'sql 语句含特殊符号的处理 2017 年 2 月 5 日 11:44 sql 语句中含有逗号时只需写成两个 , 即可 ， ’ 同理 。'
category: database
tags: []
draft: false
source: evernote-local-db
lang: zh
---
sql
语句含特殊符号的处理
2017
年
2
月
5
日
11:44
sql
语句中含有逗号时只需写成两个
,
即可
，
’
同理
。如下（
py
）
country=content.get('data').get('country','unknow').replace("'","''").replace(",",",,")
prov=content.get('data').get('province','unknow').replace("'","''").replace(",",",,")
city=content.get('data').get('city','unknow').replace("'","''").replace(",",",,")
oper=content.get('data').get('oper','unknow').replace("'","''").replace(",",",,")
