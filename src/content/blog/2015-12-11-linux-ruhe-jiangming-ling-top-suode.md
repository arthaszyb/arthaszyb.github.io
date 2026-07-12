---
title: Linux 如何将命令top所得的结果导入到文件
date: '2015-12-11'
description: >-
  分享| 2013-04-17 19:02匿名 | 浏览 1017 次 top a我试了，没问题你可以试试top |col -b a
  top是输出并实时刷新系统CPU和内存等负载的ps只是一锤子买卖，胡说八道的你如果真想看系统负载情况别用top，用vmstatvmstat
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
_分享_| 2013-04-17 19:02匿名 | 浏览 1017 次

top > a我试了，没问题你可以试试top |col -b >a top是输出并实时刷新系统CPU和内存等负载的ps只是一锤子买卖，胡说八道的你如果真想看系统负载情况别用top，用vmstatvmstat 1会以1秒钟一条的频率输出磁盘、内存、cpu等信息，那个爽歪歪了。 vmstat 1 >> a.txt不过此文件是unix文本，windows下的记事本打开显示不对，如果你想在windows下查看，用UltraEdit打开，并替换^n为^p这样就没问题了。

2013-04-17 19:25网友采纳

可以这样做

<table><tbody><tr><td><div><span><span>1</span></span></div></td><td><div><span><span>$ top -b -n 1 > a</span></span></div></td></tr></tbody></table>

\-b: 表示Batch-mode, 这样可以发送信息到文件

\-n 1: 表示输出1个循环的信息
