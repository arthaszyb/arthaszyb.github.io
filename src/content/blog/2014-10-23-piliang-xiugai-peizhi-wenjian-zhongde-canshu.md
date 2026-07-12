---
title: 批量修改配置文件中的参数项
date: '2014-10-23'
description: '#!/bin/bash while read line;do done < /tmp/conf.txt'
category: shell
tags:
  - mysql
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---
#!/bin/bash
while read line;do
```bash
cp -a $line ${line}_bak_20141022
sed -i -e '/^mysqlhost/s/=.*/= 10.173.130.178/g' -e '/^mysqluser/s/=.*/= com_pcmgr/g' -e '/^mysqlpwd/s/=.*/= 2014@com_jasd7hfgGGk/' $line
```
done
<
/tmp/conf.txt
