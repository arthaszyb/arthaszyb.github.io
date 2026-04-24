---
title: "利用Python进行数据分析(7) pandas基础: Series和DataFrame的简单介绍"
date: 2017-08-09 09:02:04 +0000
categories: ["python"]
tags: ["Pages"]
description: "2017 年 8 月 9 日 17:02 利用 Python 进行数据分析 (7) pandas 基础 : Series 和 DataFrame 的简单介绍 一、 pandas 是什么 pandas 是基于 NumPy 的一个 Python 数据分析包，主要目的是为了 数据分析 。它提供了大量高级的 数据结构 和 对数"
source: "evernote-local-db"
---

2017
年
8
月
9
日
17:02
利用
Python
进行数据分析
(7) pandas
基础
: Series
和
DataFrame
的简单介绍
一、
pandas

是什么
pandas

是基于

NumPy

的一个

Python

数据分析包，主要目的是为了
数据分析
。它提供了大量高级的
数据结构
和
对数据处理
的方法。
pandas

有两个主要的数据结构：
Series
和
DataFrame
。
二、
Series
Series

是一个
一维数组对象
，类似于

NumPy

的一维

array
。它除了包含一组数据还包含一组索引，所以可以把它理解为一组带索引的数组。
将

Python

数组转换成

Series

对象：
将

Python

字典转换成

Series

对象：
当没有显示指定索引的时候，
Series

自动以

0

开始，步长为

1

为数据创建索引。
你也可以通过

index

参数显示指定索引：
对于

Series

对象里的单个数据来说，和普通数组一样，根据索引获取对应的数据或重新赋值；
不过你还可以传入一个索引的数组来获取数据或未数据重新赋值：
想要单独获取

Series

对象的索引或者数组内容的时候，可以使用
index
和
values
属性，例如：
对

Series

对象的运算（索引不变）：
三、
DataFrame
DataFrame

是一个
表格型
的数据结构。它提供
有序的列
和
不同类型的列值
。
例如将一个由

NumPy

数组组成的字典转换成

DataFrame

对象：
DataFrame

默认根据列名首字母顺序进行排序，想要指定列的顺序？传入一个列名的字典即可：
如果传入的列名找不到，它不会报错，而是产生一列

NA

值：
DataFrame

不仅可以以字典索引的方式获取数据，还可以以属性的方法获取，例如：
修改列的值：

删除某一列：
安装步骤已经在首篇随笔里写过了，这里不在赘述。
利用
Python
进行数据分析
(1)

简单介绍
接下来一篇随笔内容是：
利用
Python
进行数据分析
(8) pandas
基础
: Series
和
DataFrame
的基本操作
，有兴趣的朋友欢迎关注本博客，也欢迎大家添加评论进行讨论。
作者：
backslash112

出处：
http://sirkevin.cnblogs.com/

GitHub
：
https://github.com/backslash112/

本文版权归作者和博客园共有，欢迎转载，但未经作者同意必须保留此段声明，且在文章页面明显位置给出原文连接，否则保留追究法律责任的权利。

来自

<
http://www.cnblogs.com/sirkevin/p/5741853.html
>

已使用 Microsoft OneNote 2016 创建。
