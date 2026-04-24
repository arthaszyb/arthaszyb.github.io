---
title: "mysql主从同步（对现有db增加新的slave）"
date: 2015-01-20 15:37:40 +0000
categories: ["MySQL [2]"]
tags: ["Pages"]
description: "Tuesday, January 20, 2015 3:37 PM 手动模式 1. flush tables with read lock 主 2.修改主和从配置文件 3.主给从赋权. 4.rsync 主的库文件到从 5.查看主的position,配置slave并启动同步 6.主 表解锁 缺点： 1. lock tab"
source: "evernote-local-db"
---

mysql主从同步（对现有db增加新的slave）
Tuesday, January 20, 2015
3:37 PM
手动模式

1. flush tables with read lock 主

2.修改主和从配置文件

3.主给从赋权.

4.rsync 主的库文件到从

5.查看主的position,配置slave并启动同步

6.主 表解锁

缺点：

1. lock table需要保持这个mysql连接，否则锁表即失效

2. 直接拷贝数据文件不安全，同时尚在内存中的db数据还没有存入硬盘，会造成数据不完整

3. 手动锁表和解锁比较麻烦

自动模式：

1. 主 mysqldump --master-data=1 该参数会在dump文件中记录锁表时的position信息，并且在从中导入后直接就对应好，无需重新制定对应的值。详情http://asmboy001.blog.51cto.com/340398/197750

2. 修改配置，主给从赋权.

3. 从导入dump文件，重启slave

导数据：mysqldump -h -P -u -p --default-character-set=binary --max-allowed-packet=512M --master-data=1 -A >xxx.dump
yabin：
/data1/mydumper/mydumper -h 10.161.11.185 -P 3306 -u 2015_repl -p 2015_repl -t 4 -G -R -E -A -o /data1/zhouyang > /data1/dump.log 2>
&
1
导出导入都使用--default-character-set=binary 即可忽略字符集问题，不会出现乱码

已使用 Microsoft OneNote 2016 创建。
