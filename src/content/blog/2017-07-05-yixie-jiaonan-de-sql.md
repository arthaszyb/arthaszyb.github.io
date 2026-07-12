---
title: 一些较难的sql
date: '2017-07-05'
description: >-
  一些较难的 sql 2017 年 7 月 5 日 22:32 按天统计累积值 select realdonedate,(select count(1)
  from t2017first395sersnew t where t.realdonedate <
category: database
tags: []
draft: false
source: evernote-local-db
lang: zh
---
一些较难的
sql
2017
年
7
月
5
日
22:32
按天统计累积值
select real_done_date,(select count(1) from t_2017_first_395_sers_new t where t.real_done_date
<
t_2017_first_395_sers_new.real_done_date) as b from t_2017_first_395_sers_new where ok_rate=100 group by
real_done_date;
