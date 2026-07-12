---
title: 反垃圾统计脚本
date: '2013-08-07'
description: >-
  for i in ls; do t1=grep -c -P ",cmd:DATA,.Outside:1," $i; t2=grep -c -P
  ",cmd:DATA,.Outside:1,.retcode:[45]" $i; t3=$[$t1-$t2]; echo "$i total:$t1,
  reject:$t2,
category: shell
tags: []
draft: false
source: evernote-local-db
lang: zh
---
for i in `ls`;
do t1=`grep -c -P ",cmd:DATA,.*Outside:1," $i`;
t2=`grep -c -P ",cmd:DATA,.*Outside:1,.*retcode:[45]" $i`;
t3=$[$t1-$t2];
echo "$i total:$t1, reject:$t2, pass:$t3, reject percent:$[$t2*100/$t1]";
done
