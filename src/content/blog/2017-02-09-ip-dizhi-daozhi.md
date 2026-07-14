---
title: IP地址倒置
date: '2017-02-09'
description: IP 地址倒置函数，将 IP 地址的四个数字段反序排列。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
---
IP 地址倒置函数：将 IP 地址的四个数字段反序排列，如 203.205.142.202 倒置为 202.142.205.203。

```python
def ip_reverse(src_ip):
    '''IP地址倒置'''
    ip_list = src_ip.split('.')
    ip_list.reverse()
    dst_ip = '.'.join(ip_list)
    return dst_ip
```
