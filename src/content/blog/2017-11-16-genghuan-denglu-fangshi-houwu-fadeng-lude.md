---
title: 更换登录方式后无法登录的解决方法
date: '2017-11-16'
description: >-
  2017年11月16日 11:48 触发场景： 重装系统，登录方式或密钥密码均不变。 登录失败。 提示如下 更换登录方式，比如从密钥登录变为密码登录。
  提示也一样。  IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
category: linux
tags:
  - ssh
draft: false
source: evernote-local-db
lang: zh
---
2017年11月16日

11:48

触发场景：

1. 重装系统，登录方式或密钥密码均不变。登录失败。提示如下

2. 更换登录方式，比如从密钥登录变为密码登录。提示也一样。

IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!

Someone could be eavesdropping on you right now (man-in-the-middle attack)!

It is also possible that a host key has just been changed.

The fingerprint for the RSA key sent by the remote host is

c4:4e:a1:56:ad:32:a0:c5:90:03:4e:b8:a9:ef:e4:a0.

Please contact your system administrator.

Add correct host key in /usr/local/app/.ssh/known\_hosts to get rid of this message.

Offending RSA key in /usr/local/app/.ssh/known\_hosts:20

RSA host key for \[111.230.197.74\]:36000 has changed and you have requested strict checking.

Host key verification failed.

原因：这两种情况都会导致登录客户端的~user/.ssh/known\_hosts文件中对应的ip的信息发生变化。如果不删除这段旧信息，登录就会用这段信息去登录，导致信息不匹配而失败。

解决方法：删除登录客户端的~user/.ssh/known\_hosts文件中更改过的ip的信息。
