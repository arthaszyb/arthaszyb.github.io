---
title: "SQL中Left Join 与Right Join 与 Inner Join 与 Full Join的区别 - shadowyelling的专栏 - 博客频道 - CSDN.NET"
date: 2017-06-27 00:41:32 +0000
categories: ["BigData"]
tags: ["新分区 1"]
description: "星期二, 六月 27, 2017 12:41 上午 已剪辑自 : http://blog.csdn.net/shadowyelling/article/details/7684714 版权声明：本文为博主原创文章，未经博主允许不得转载。 首先看看Left Join 与Right Join 与 Inner Join 与 "
source: "evernote-local-db"
---

SQL中Left Join 与Right Join 与 Inner Join 与 Full Join的区别 - shadowyelling的专栏 - 博客频道 - CSDN.NET
星期二, 六月 27, 2017
12:41 上午
已剪辑自
:

http://blog.csdn.net/shadowyelling/article/details/7684714
版权声明：本文为博主原创文章，未经博主允许不得转载。
首先看看Left Join 与Right Join 与 Inner Join 与 Full Join对表进行操作后得到的结果。
在数据库中新建两张表，并插入要测试的数据。
新建表：
USE [Test]
GO
/******
对象
: Table [dbo].[EMP]
脚本日期
: 06/22/2012 15:37:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EMP](
[ENAME] [nchar](10) COLLATE Chinese_PRC_CI_AS NOT NULL,
[CITY] [nchar](10) COLLATE Chinese_PRC_CI_AS NULL
) ON [PRIMARY]

USE [Test]
GO
/******
对象
: Table [dbo].[SAL]
脚本日期
: 06/22/2012 15:38:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SAL](
[ENAME] [nchar](10) COLLATE Chinese_PRC_CI_AS NOT NULL,
[SALARY] [money] NULL
) ON [PRIMARY]

插入数据得到的表：
EMP表：
SAL表：

已使用 Microsoft OneNote 2016 创建。
