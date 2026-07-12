---
title: 检查网段内的ip占用情况
date: '2014-02-10'
description: >-
  #！ /bin/bash for i in $(seq 1 255); do ping 192.168.9.$i -c 1 -w 2 /dev ull 2
  & 1; if [ $?  != 0 ];then echo "$i is not online"; fi; done;
category: shell
tags: []
draft: false
source: evernote-local-db
lang: zh
---
#！/bin/bash
for i in $(seq 1 255);
do ping 192.168.9.$i -c 1 -w 2 >/dev
ull 2>
&
1;
if [ $? != 0 ];then
echo "$i is not online";
fi;
done;
