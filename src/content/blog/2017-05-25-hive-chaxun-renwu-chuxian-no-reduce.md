---
title: hive查询任务出现no reduce operator错误解决办法
date: '2017-05-25'
description: 解决Hive在执行简单查询时出现"no reduce operator"错误，通过设置fetch任务转换参数来解决问题。
category: bigdata
tags:
  - hadoop
draft: false
source: evernote-local-db
lang: zh
---
在执行简单的SELECT LIMIT查询时，可能会遇到"Number of reduce tasks is set to 0 since there's no reduce operator"的错误。解决方法是配置Hive的fetch任务转换参数。

执行下列命令来设置参数：

```bash
hive (default)> set hive.fetch.task.conversion=more;
```

然后重新执行查询：

```sql
hive (default)> select regexp_extract(src_ip,'(\\d+\\.\\d+)\\.(\\d+\\.\\d+)',1) from
u_wsd.t_sd_beacon_term_ip_port_new_raw limit 2;
```

设置此参数后，简单的查询（如只有SELECT和LIMIT的操作）会直接从HDFS读取数据，而不需要经过reduce阶段。
