---
title: 提取ip地址：
date: '2013-11-19'
description: >-
  [root@web41 ~]# ifconfig|grep "inet addr"|grep -o "[0-9.]\{1,\}"|head -n 1
  192.168.70.41 [root@web41 ~]# ifconfig|grep "inet addr"|grep -o
  "[0-9.]\{1,\}"|sed
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---
[root@web41 ~]# ifconfig|grep "inet addr"|grep -o "[0-9.]\{1,\}"|head -n 1
192.168.70.41
[root@web41 ~]# ifconfig|grep "inet addr"|grep -o "[0-9.]\{1,\}"|sed -n 1p
192.168.70.41
：的用法
```bash
[root@web41 ~]# a="www.nana.com"
[root@web41 ~]# b=${a:4}
[root@web41 ~]# echo $b
```
nana.com
[root@web41 ~]# b=${a:6}
&
&
echo $b
na.com
可依此提取域名后面的内容：
web_domain=$1
proto_head=`echo $domain|cut -d"." -f1`
_length=`expr length $proto_head` #expr length计算字符长度
mail_domain=`echo ${web_domain:$_length}`
