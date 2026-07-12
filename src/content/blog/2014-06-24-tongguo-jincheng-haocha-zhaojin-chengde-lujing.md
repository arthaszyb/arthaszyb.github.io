---
title: 通过进程号查找进程的路径.
date: '2014-06-24'
description: '很多进程只能看到相对路径,想知道绝对路径可以通过查看/proc/Pid中exe所链接的地址即是 ll /proc/24331/'
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
很多进程只能看到相对路径,想知道绝对路径可以通过查看/proc/Pid中exe所链接的地址即是

ll /proc/24331/

![](/images/legacy/legacy-d34f4843e8.png)![](/images/legacy/legacy-81b934d909.png)
