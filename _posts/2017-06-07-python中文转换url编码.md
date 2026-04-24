---
title: "python中文转换url编码"
date: 2017-06-07 06:37:05 +0000
categories: ["python"]
tags: ["Pages"]
description: "2017 年 6 月 7 日 14:37 2009-09-05 21:45:43 标签： 休闲 中文转换url编码 职场 今天要处理百度贴吧的东西。想要做一个关键词的list，每次需要时，直接添加 到list里面就可以了。但是添加到list里面是中文的情况（比如‘丽江’），url的地址编码却是'%E4%B8%BD%E6"
source: "evernote-local-db"
---

2017
年
6
月
7
日
14:37
python中文转换url编码
2009-09-05 21:45:43
标签：
休闲

中文转换url编码

职场
今天要处理百度贴吧的东西。想要做一个关键词的list，每次需要时，直接添加 到list里面就可以了。但是添加到list里面是中文的情况（比如‘丽江’），url的地址编码却是'%E4%B8%BD%E6%B1%9F'，因此需 要做一个转换。这里我们就用到了模块urllib。
>>> import urllib
>>> data = '丽江'
>>> print data
丽江
>>> data
'\xe4\xb8\xbd\xe6\xb1\x9f'
>>>
urllib.quote
(data)
'%E4%B8%BD%E6%B1%9F'
那我们想转回去呢？
>>> urllib.unquote('%E4%B8%BD%E6%B1%9F')
'\xe4\xb8\xbd\xe6\xb1\x9f'
>>> print
urllib.unquote
('%E4%B8%BD%E6%B1%9F')
丽江
细心的同学会发现贴吧url中出现的是%C0%F6%BD%AD，而非'%E4%B8%BD%E6%B1%9F'，其实是编码问题。百度的是gbk，其他的一般网站比如google就是utf8的。所以可以用下列语句实现。
>>> import sys,urllib
>>> s = '丽江'
>>> urllib.quote(s.decode(sys.stdin.encoding).encode('gbk'))
'%C0%F6%BD%AD'
>>> urllib.quote(s.decode(sys.stdin.encoding).encode('utf8'))
'%E4%B8%BD%E6%B1%9F'
>>>
另一个方法
#
!/
usr
/
bin
/
python
import
urllib
import
sys
string
=
sys
.
argv
[
1
]
string
=
unicode
(
string
,
"gbk"
)
utf8_string
=
string
.
encode
(
"utf-8"
)
gbk_string
=
string
.
encode
(
"gbk"
)
gbk
=
urllib
.
quote
(
gbk_string
)
utf8
=
urllib
.
quote
(
utf8_string
)
print
gbk
print
utf8

来自

<
http://dashen2009.blog.51cto.com/714741/199157
>

已使用 Microsoft OneNote 2016 创建。
