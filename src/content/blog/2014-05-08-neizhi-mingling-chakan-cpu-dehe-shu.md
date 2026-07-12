---
title: 内置命令查看CPU的核数
date: '2014-05-08'
description: 一般的奸商会误导消费者说单核双线程的CPU说成双核，或者双核双线程说成四核。  总得来说单核分为单核单线程和单核超线程，双核分为双核单线程和双核超线程。
category: misc
tags: []
draft: false
source: evernote-local-db
lang: zh
---
一般的奸商会误导消费者说单核双线程的CPU说成双核，或者双核双线程说成四核。

总得来说单核分为单核单线程和单核超线程，双核分为双核单线程和双核超线程。

我使用的CPU是双核单线程的，如图：

![](/images/legacy/legacy-361d886d95.jpg)

下面使用windows内置命令查看cpu核数，

运行cmd，输入wmic

## 内置命令查看CPU的核数

一般的奸商会误导消费者说单核双线程的CPU说成双核，或者双核双线程说成四核。

总得来说单核分为单核单线程和单核超线程，双核分为双核单线程和双核超线程。

我使用的CPU是双核单线程的，如图：

![](/images/legacy/legacy-361d886d95.jpg)

下面使用windows内置命令查看cpu核数，

运行cmd，输入wmic

再输入cpu get \*

如图

![](/images/legacy/legacy-acdc5beddf.jpg)

鼠标拉动下面的滑动条，你会看到numberofcores,numberoflogicalprocessors。

![](/images/legacy/legacy-619c8eb7bb.jpg)

意思是，双核单线程

下面是参考表：

![](/images/legacy/legacy-ddb8d06225.jpg)

再输入cpu get \*

如图

![](/images/legacy/legacy-acdc5beddf.jpg)

鼠标拉动下面的滑动条，你会看到numberofcores,numberoflogicalprocessors。

![](/images/legacy/legacy-619c8eb7bb.jpg)

意思是，双核单线程

下面是参考表：

![](/images/legacy/legacy-ddb8d06225.jpg)
