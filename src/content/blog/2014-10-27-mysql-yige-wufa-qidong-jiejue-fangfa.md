---
title: mysql一个无法启动解决方法
date: '2014-10-27'
description: >-
  yabinji(季亚斌) 10-27 16:04:58 vim /etc sswitch.conf yaungzhou(周洋) 10-27 16:05:05
  改什么 yabinji(季亚斌) 10-27 16:05:09 进去先修改这个配置文件 yabinji(季亚斌) 10-27 16:05:19 50
category: database
tags:
  - mysql
  - ldap
  - vim
draft: false
source: evernote-local-db
lang: zh
---
yabinji(季亚斌) 10-27 16:04:58
vim /etc
sswitch.conf
yaungzhou(周洋) 10-27 16:05:05
改什么
yabinji(季亚斌) 10-27 16:05:09
进去先修改这个配置文件
yabinji(季亚斌) 10-27 16:05:19
50 passwd: files ldap
51 group: files ldap
52 shadow: files ldap
yabinji(季亚斌) 10-27 16:05:28
把ldap去掉
yabinji(季亚斌) 10-27 16:05:31
然后启动
yabinji(季亚斌) 10-27 16:05:37
启动完之后，再加回来
yaungzhou(周洋) 10-27 16:05:57
这个是啥意思
yabinji(季亚斌) 10-27 16:06:09
其实这里有提示信息的
yaungzhou(周洋) 10-27 16:06:33
哪里的
yabinji(季亚斌) 10-27 16:06:35
yabinji(季亚斌) 10-27 16:07:17
按照这段话来做，就OK了
