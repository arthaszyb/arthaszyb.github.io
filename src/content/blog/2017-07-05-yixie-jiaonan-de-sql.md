---
title: 一些较难的sql
date: '2017-07-05'
description: "使用子查询和聚合函数实现按天统计累积值的 SQL 示例。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---

## 按天统计累积值

需求：统计每一天完成的记录数，同时计算到该天为止的累积数量。

```sql
select 
  real_done_date,
  (select count(1) 
   from t_2017_first_395_sers_new t 
   where t.real_done_date <= t_2017_first_395_sers_new.real_done_date
  ) as cumulative_count
from t_2017_first_395_sers_new 
where ok_rate = 100 
group by real_done_date;
```

核心思路：使用相关子查询，对于每一行，统计所有小于等于该行日期的记录数，从而得到累积值。
