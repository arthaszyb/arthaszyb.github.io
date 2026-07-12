---
title: IP地址倒置
date: '2017-02-09'
description: >-
  IP 地址倒置 2017 年 2 月 9 日 11:55 def ipreverse(srcip): '''ip 地址倒置，如
  203.205.142.202 转换为 202.142.205.203''' iplist=srcip.split('.')
  iplist.reverse()
category: python
tags: []
draft: false
source: evernote-local-db
lang: zh
---
IP
地址倒置
2017
年
2
月
9
日
11:55
def ip_reverse(src_ip):
'''ip
地址倒置，如
203.205.142.202
转换为
202.142.205.203'''
ip_list=src_ip.split('.')
ip_list.reverse()
dst_ip='.'.join(ip_list)
return dst_ip
