---
title: 批量修改配置文件中的参数项
date: '2014-10-23'
description: 从配置文件列表中逐个读取文件，备份后使用 sed 命令批量修改参数值。
category: shell
tags:
  - mysql
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

循环读取配置文件列表，对每个文件先备份再用 sed 修改参数值。

```bash
#!/bin/bash
while read line; do
  cp -a $line ${line}_bak_20141022
  sed -i -e '/^mysqlhost/s/=.*/= 10.173.130.178/g' -e '/^mysqluser/s/=.*/= com_pcmgr/g' -e '/^mysqlpwd/s/=.*/= 2014@com_jasd7hfgGGk/' $line
done < /tmp/conf.txt
```
