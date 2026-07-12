---
title: ps 和 top cpu 占用区别
date: '2015-12-09'
description: >-
  标签： standardssolarisflash工作up 2012-10-10 17:52 1682人阅读 评论(0) 收藏 举报 分类：
  linux\常用命令（11） ps和topcpu 占用区别：
  但试了一会发现个不小的问题，把包含flash的网页关掉后，ps显示它的cpu占用率还是居高不下。
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
# [ps 和 top cpu 占用区别](http://blog.csdn.net/beginning1126/article/details/8057527)

标签： [standards](http://www.csdn.net/tag/standards)[solaris](http://www.csdn.net/tag/solaris)[flash](http://www.csdn.net/tag/flash)[工作](http://www.csdn.net/tag/%e5%b7%a5%e4%bd%9c)[up](http://www.csdn.net/tag/up)

2012-10-10 17:52 1682人阅读 [评论](http://blog.csdn.net/beginning1126/article/details/8057527#comments)(0) 收藏 [举报](http://blog.csdn.net/beginning1126/article/details/8057527#report)

![](/images/legacy/legacy-aa9dcc4478.jpg)

分类：

linux\_常用命令_（11）_

![](/images/legacy/legacy-cfa9180f6a.jpg)

**ps和topcpu 占用区别：**

但试了一会发现个不小的问题，把包含flash的网页关掉后，ps显示它的cpu占用率还是居高不下。奇怪了，难道它还在后台工作吗？我又用top看了下，更奇怪了，top显示flash占用的cpu分明是0。又等了一会，ps显示的还是好几十。

以前好像也发现过这样的问题，但以为是误差等问题也没细想，但今天看这显然和误差什么的没关系。

上网找了找，终于明白了。

看看man ps里的相关内容：

CPU usage is currently expressed as the percentage of time spent

running during the entire lifetime of a process. This is not ideal,

and it does not conform to the standards that ps otherwise conforms to.

CPU usage is unlikely to add up to exactly 100%.

再看看top的：

k: %CPU -- CPU usage

The task's share of the elapsed CPU time since the last screen

update, expressed as a percentage of total CPU time. In a true

SMP environment, if 'Irix mode' is Off, top will operate in

'Solaris mode' where a task's cpu usage will be divided by the

total number of CPUs. You toggle 'Irix/Solaris' modes with the

'I' interactive command.

就不难理解了。ps是从进程开始就开始算的，是平均的占用率；而top是从上次刷新开始算的，一般几秒钟一刷，可以认为是即时的。而桌面系统我们一般更关注即时的，所以top的cpu占用率才是我需要的。而且top默认cpu的占用率的和并不是100%，而是核数x100%，所以有时会有一个进程占用超过100%的情况。
