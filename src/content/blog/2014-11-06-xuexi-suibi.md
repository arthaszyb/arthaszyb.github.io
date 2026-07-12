---
title: 学习随笔
date: '2014-11-06'
description: >-
  1.def中变量为单独，则返回单值，如为变量，则返回元组，如为变量，则变量需为a=XXx之类，返回字典 def add1(x): return x
  add1(1,23,232321) Traceback (most recent call last): File " < pyshell#73",
  line 1, in
category: python
tags: []
draft: false
source: evernote-local-db
lang: zh
---
1.def中变量为单独，则返回单值，如为*变量，则返回元组，如为**变量，则变量需为a=XXx之类，返回字典
>>> def add1(**x):
return x
>>> add1(1,23,232321)
Traceback (most recent call last):
File "
<
pyshell#73>", line 1, in
<
module>
add1(1,23,232321)
TypeError: add1() takes 0 positional arguments but 3 were given
>>> add1(a=23,b=22)
{'a': 23, 'b': 22}
>>> def add1(*x):
return x
>>> add1(1,23,4)
(1, 23, 4)
