---
title: 查看进程启动时间
date: '2015-04-17'
description: >-
  2010年5月29日wangyuanzheng Linux系统中通过ps命令查看进程状态，可以看到系统启动时间。 但如果启动超过一天，它会变成问号。
  那如何获取这些进程的启动时间呢？  在Linux系统中，时间管理有两个基本概念：xtime和jiffies。
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
2010年5月29日[wangyuanzheng](http://xiaoy.info/author/wangyuanzheng/)

Linux系统中通过ps命令查看进程状态，可以看到系统启动时间。但如果启动超过一天，它会变成问号。那如何获取这些进程的启动时间呢？

在Linux系统中，时间管理有两个基本概念：xtime和jiffies。

xtime主要给time系函数使用，结构比较简单(include\\linux\\time.h)：

<table><tbody><tr><td><div><span><span>1</span></span></div></td><td><div><span><span>struct</span></span><span><span>timespec {</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>2</span></span></div></td><td><div><span><span> time_t</span></span><span><span>tv_sec; /* seconds */</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>3</span></span></div></td><td><div><span><span> long</span></span><span><span>tv_nsec; /* nanoseconds</span></span><span style="font-family: "Microsoft YaHei";"><span>，</span></span><span style="font-family: "Microsoft YaHei";"><span>纳秒，以前的版本是微秒</span></span><span><span>*/</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>4</span></span></div></td><td><div><span><span>};</span></span></div></td></tr></tbody></table>

tv\_sec就是大家平常所说的unix时间戳，在CMOS中维护，关机时由电池维持正常运行。

系统启动时，通过get\_cmos\_time()取cmos时间赋值。运行时，通过设置系统定时器，每隔一段时间触发一个节拍，他们管这个节拍叫tick。每触发一次tick，就会通过update\_wall\_time\_one\_tick()来更新xtime。

而jiffies是内核中的一个全局变量，它的功能看起来很简单：记录从系统启动以来的tick数。但它就是解开我们问题的关键。

在/proc/<pid>/stat中( 源码请参考proc\_pid\_stat()，文件是fs/proc/array.c ），维护了进程的很多状态信息，其中第22项是进程启动时的jiffies值，通过它可以计算出进程启动时，系统已经开机的时间。把这个时间加上系统启动时间（/proc/stat)，就可以得到进程启动时间。

最后得到的脚本如下：

<table><tbody><tr><td><div><span><span>01</span></span></div></td><td><div><span><span>#!/bin/sh</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>02</span></span></div></td><td><div><span><span>function</span></span><span><span>show_start_time( )</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>03</span></span></div></td><td><div><span><span>{</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>04</span></span></div></td><td><div><span><span> pid=$1 </span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>05</span></span></div></td><td><div><span><span> JIFFIES=`cat</span></span><span><span>/proc/$pid/stat | cut</span></span><span><span>-d" "</span></span><span><span>-f22`</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>06</span></span></div></td><td><div><span><span> UPTIME=`grep</span></span><span><span>btime /proc/stat | cut</span></span><span><span>-d" "</span></span><span><span>-f2` </span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>07</span></span></div></td><td><div><span><span> START_SEC=$(( $UPTIME + $JIFFIES / 100 )) </span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>08</span></span></div></td><td><div><span><span> date</span></span><span><span>-d "1970-01-01 UTC $START_SEC seconds"</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>09</span></span></div></td><td><div><span><span>}</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>10</span></span></div></td><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>11</span></span></div></td><td><div><span><span>if</span></span><span><span>[ $# > 1 ]</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>12</span></span></div></td><td><div><span><span>then</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>13</span></span></div></td><td><div><span><span> for</span></span><span><span>pid in</span></span><span><span>$@; do</span></span><span><span>show_start_time ${#pid};done</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>14</span></span></div></td><td><div><span><span>fi</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>15</span></span></div></td><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>16</span></span></div></td><td><div><span><span>while</span></span><span><span>read</span></span><span><span>pid; do</span></span><span><span>show_start_time ${#pid}; done</span></span></div></td></tr></tbody></table>

脚本中100是“用户可见”的tick频率(tick\_rate)，它的值等于我们熟悉的常量CLOCKS\_PER\_SEC。为什么要说“用户可见”呢？实际上，新版本的内核tick\_rate，已经远高于100了(i386的是1000），但以前很多程序，都依赖于这个数。为了兼容，于是内核又做了一层封装。
