---
title: "hive查询任务出现no reduce operator错误解决办法"
date: 2017-05-25 01:45:10 +0000
categories: ["BigData"]
tags: ["新分区 1"]
description: "hive 查询任务出现no reduce operator错误解决办法 2017 年 5 月 25 日 9:45 执行简单的 fetch 任务： hive (default)> select regexp_extract(src_ip,'(\\\\d+\\\\.\\\\d+)\\\\.(\\\\d+\\\\.\\\\d+)',1) from u_"
source: "evernote-local-db"
---

hive
查询任务出现no reduce operator错误解决办法
2017
年
5
月
25
日
9:45
执行简单的
fetch
任务：
hive (default)> select regexp_extract(src_ip,'(\\d+\\.\\d+)\\.(\\d+\\.\\d+)',1) from

u_wsd.t_sd_beacon_term_ip_port_new_raw limit 2;
Query ID = mqq_20170525093726_262ffc43-e05e-48de-a98a-fc9eaf3605c9
Total jobs = 1
Launching Job 1 out of 1
Number of reduce tasks is set to 0 since there's no reduce operator

解决方法：
hive (default)>
set hive.fetch.task.conversion=more;
hive (default)> select regexp_extract(src_ip,'(\\d+\\.\\d+)\\.(\\d+\\.\\d+)',1) from

u_wsd.t_sd_beacon_term_ip_port_new_raw limit 2;
OK
183.207
183.207
Time taken: 37.587 seconds, Fetched: 2 row(s)

已使用 Microsoft OneNote 2016 创建。
