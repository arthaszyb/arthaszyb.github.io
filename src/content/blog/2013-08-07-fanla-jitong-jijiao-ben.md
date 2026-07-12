---
title: 反垃圾统计脚本
date: '2013-08-07'
description: "Shell 脚本：统计日志中的反垃圾过滤情况，包括数据包总数、拒绝数、通过数和拒绝百分比。"
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

统计日志中的反垃圾过滤情况脚本。遍历日志文件，统计包含指定特征的数据包，输出总数、拒绝数、通过数和拒绝百分比。

```bash
for i in `ls`;
do t1=`grep -c -P ",cmd:DATA,.*Outside:1," $i`;
t2=`grep -c -P ",cmd:DATA,.*Outside:1,.*retcode:[45]" $i`;
t3=$[$t1-$t2];
echo "$i total:$t1, reject:$t2, pass:$t3, reject percent:$[$t2*100/$t1]";
done
```

其中 t1 为 DATA 命令且 Outside=1 的总数，t2 为其中返回码为 4 或 5（拒绝）的数，t3 为通过的数，最后输出拒绝百分比。
