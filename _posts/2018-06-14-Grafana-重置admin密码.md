---
title: "Grafana 重置admin密码"
date: 2018-06-14 03:53:52 +0000
categories: ["监控告警"]
tags: []
description: "SA_小科 关注 0 人评论 13376人阅读 2018-05-24 13:49:07 不小心忘记了grafana web界面的密码后，使用官网的方式重置密码 http://docs.grafana.org/administration/cli/#reset-admin-password 但是并没有成功。 然后使用go"
source: "evernote-local-db"
---

Grafana 重置admin密码
SA_小科
关注
0
人评论
13376人阅读
2018-05-24 13:49:07
不小心忘记了grafana web界面的密码后，使用官网的方式重置密码
http://docs.grafana.org/administration/cli/#reset-admin-password

但是并没有成功。 然后使用google到的另外一个方法重置成功了，现在记录下来：
1.查找grafana.db文件
find / -name

"grafana.db"
PS:一般默认文件为/
var
/lib/grafana/grafana.db
2.使用sqlite3加载数据库文件
sqlite3 /
var
/lib/grafana/grafana.db
#.tables查看有那些表
.tables
#select查看表里面的内容
select

*

from

user;
#使用update更新密码
update user

set

password =

'59acf18b94d7eb0694c61e60ce44c110c7a683ac6a8f09580d626f90f4a242000746579358d77dd9e570e83fa24faa88a8a6'
, salt =

'F3FAxVm33R'

where

login =

'admin'
;
#修改完成后退出
.exit
3.update之后，账号密码将为admin/admin
