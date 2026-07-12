---
title: 'Linux cpuinfo 详解2012-01-04 10:38:11'
date: '2015-12-11'
description: >-
  Linux cpuinfo 详解 2012-01-04 10:38:11 标签：linux命令 linux 休闲 cpuinfo 职场
  原创作品，允许转载，转载时请务必以超链接形式标明文章 原始出处 、作者信息和本声明。 否则将追究法律责任。
category: linux
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---
![](/images/legacy/legacy-9a2a4c3e45.jpg)

Linux cpuinfo 详解

2012-01-04 10:38:11

标签：[linux命令](http://blog.51cto.com/tag-linux%E5%91%BD%E4%BB%A4.html) [linux](http://blog.51cto.com/tag-linux.html) [休闲](http://blog.51cto.com/tag-%E4%BC%91%E9%97%B2.html) [cpuinfo](http://blog.51cto.com/tag-cpuinfo.html) [职场](http://blog.51cto.com/tag-%E8%81%8C%E5%9C%BA.html)

原创作品，允许转载，转载时请务必以超链接形式标明文章 [原始出处](http://icooke.blog.51cto.com/4123148/757555) 、作者信息和本声明。否则将追究法律责任。[http://icooke.blog.51cto.com/4123148/757555](http://icooke.blog.51cto.com/4123148/757555)

在Linux系统中，如何详细了解CPU的信息呢？ 当然是通过cat /proc/cpuinfo来检查了，但是比如几个物理CPU/几核/几线程，这些问题怎么确定呢？

经过查看，我的开发机器是1个物理CPU，4核8线程，Intel(R) Core(TM) i7 CPU 860 @ 2.80GHz

记录一下，判断的过程和知识。

判断依据：

1.具有相同core id的cpu是同一个core的超线程。

2.具有相同physical id的cpu是同一颗cpu封装的线程或者cores。

英文版：

1.Physical id and core id are not necessarily consecutive but they are unique. Any cpu with the same core id are hyperthreads in the same core.

2.Any cpu with the same physical id are threads or cores in the same physical socket.

echo "logical CPU number:"

#逻辑CPU个数

cat /proc/cpuinfo | grep "processor" | wc -l

echo "physical CPU number:"

#物理CPU个数：

cat /proc/cpuinfo | grep "physical id" | sort -u | wc -l

echo "core number in a physical CPU:"

#每个物理CPU中Core的个数：

cat /proc/cpuinfo | grep "cpu cores" | uniq | awk -F: '{print $2}'

#查看core id的数量,即为所有物理CPU上的core的个数

cat /proc/cpuinfo | grep "core id" | uniq | wc -l

#是否为超线程？

#如果有两个逻辑CPU具有相同的”core id”，那么超线程是打开的。或者siblings数目比cpu cores数目大。

#每个物理CPU中逻辑CPU(可能是core, threads或both)的个数：

cat /proc/cpuinfo | grep "siblings"

/proc/cpuinfo 文件包含系统上每个处理器的数据段落。/proc/cpuinfo 描述中有 6 个条目适用于多内核和超线程（HT）技术检查：processor, vendor id, physical id, siblings, core id 和 cpu cores。

processor 条目包括这一逻辑处理器的唯一标识符。

physical id 条目包括每个物理封装的唯一标识符。

core id 条目保存每个内核的唯一标识符。

siblings 条目列出了位于相同物理封装中的逻辑处理器的数量。

cpu cores 条目包含位于相同物理封装中的内核数量。

如果处理器为英特尔处理器，则 vendor id 条目中的字符串是 GenuineIntel。

1.拥有相同 physical id 的所有逻辑处理器共享同一个物理插座。每个 physical id 代表一个唯一的物理封装。

2.Siblings 表示位于这一物理封装上的逻辑处理器的数量。它们可能支持也可能不支持超线程（HT）技术。

3.每个 core id 均代表一个唯一的处理器内核。所有带有相同 core id 的逻辑处理器均位于同一个处理器内核上。

4.如果有一个以上逻辑处理器拥有相同的 core id 和 physical id，则说明系统支持超线程（HT）技术。

5.如果有两个或两个以上的逻辑处理器拥有相同的 physical id，但是 core id 不同，则说明这是一个多内核处理器。cpu cores 条目也可以表示是否支持多内核。

判断CPU是否64位，检查cpuinfo中的flags区段，看是否有lm标识。

Are the processors 64-bit?

A 64-bit processor will have lm ("long mode") in the flags section of cpuinfo. A 32-bit processor will not.
