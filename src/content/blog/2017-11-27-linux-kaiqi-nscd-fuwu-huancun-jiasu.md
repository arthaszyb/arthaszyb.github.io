---
title: linux开启nscd服务缓存加速
date: '2017-11-27'
description: >-
  2017年11月27日 16:59 linux开启nscd服务缓存加速 2014年8月23日admin发表评论阅读评论
  这个问题是我修改了hosts文件后发现curl仍未生效后查到的，是由于nscd提供了hosts缓存导致的。
category: linux
tags:
  - nginx
  - dns
  - php
draft: false
source: evernote-local-db
lang: zh
---
2017年11月27日

16:59

**linux开启nscd服务缓存加速**

2014年8月23日[admin](http://www.361way.com/author/admin)[发表评论](http://www.361way.com/linux-nscd-dns-cache/4265.html#respond)[阅读评论](http://www.361way.com/linux-nscd-dns-cache/4265.html#comments)

这个问题是我修改了hosts文件后发现curl仍未生效后查到的，是由于nscd提供了hosts缓存导致的。---yau

在我使用的阿里云主机上有观察到开启了一个服务nscd ，后来谷哥了下该服务的作用。了解到nscd会缓存三种服务passwd group hosts，所以它会记录三个库，分别对应源/etc/passwd, /etc/hosts 和 /etc/resolv.conf每个库保存两份缓存，一份是找到记录的，一份是没有找到记录的。每一种缓存都保存有生存时间（TTL）。其作用就是在本当中增加cache ，加快如DNS的解析等的速度。

**一、nscd的配置**

通过编辑/etc/nscd.conf文件，在其中增加如下一行可以开启本地DNS cache：

1. enable-cache hosts yes

阿里云主机上的配置如下：

1. \[root@361way ~\]\# cat /etc/nscd.conf

#logfile /var/log/nscd.log

2. threads 6

3. max\-threads 128

4. server\-user nscd

5. debug\-level 5

6. paranoia no

7. enable\-cache passwd no

8. enable\-cache group no

9. enable\-cache hosts yes

10. positive\-time\-to\-live hosts 5

11. negative\-time\-to\-live hosts 20

12. suggested\-size hosts 211

13. check\-files hosts yes

14. persistent hosts yes

15. shared hosts yes

16. max\-db\-size hosts 33554432

相关参数的解释如下：

**logfile** _debug-file-name_

指定调试信息写入的文件名。

**debug-level** _value_

设置希望的调试级别。

**threads** _number_

这是启动的等待请求的线程数。最少将创建5个线程。

**server-user** _user_

如果设置了该选项，nscd将作为该用户运行，而不是作为root。如果每个用户都使用一个单独的缓存（\-S参数），将忽略该选项。

**enable-cache** _service_ _<yes|no>_

启用或禁用制定的 _服务_ 缓存。

**positive-time-to-live** _service_ _value_

设置 _service_ 在指定缓存中正的项目（成功的请求）的TTL（存活时间）。 _Value_ 以秒为单位。较大的值将增加缓存命中率从而减低平均响应时间，但是将增加缓存的一致性问题。

**negative-time-to-live** _service_ _value_

设置 _service_ 在指定缓存中负的项目（失败的请求）的TTL（存活时间）。 _Value_ 以秒为单位。如果存在由不在系统数据库中的uid（用户ID）（例如在以root身份解包linux 内核源代码时）所拥有的文件将明显改善性能；应该维持较小的值以降低缓存一致性问题。

**suggested-size** _service_ _value_

这是内部散列表的大小， _value_ 应该保持一个素数以达到优化效果。

**check-files** _service_ _<yes|no>_

启用或禁用检查属于指定 _服务_ 的文件的改变。这些文件是 _/etc/passwd__，_ _/etc/group__，_ 以及_/etc/hosts__。_

**二、nscd** **服务查看和清除**

默认该服务在redhat或centos下是关闭的，可以通过services nscd start开启。缓存DB文件在/var/db/nscd下。可以通过nscd -g查看统计的信息，这里列出部分：

1. \[root@361way ~\]\# nscd -g

nscd configuration:

5 server debug level

2. 34d 23h 14m 18s server runtime

3. 6 current number of threads

4. 128 maximum number of threads

5. 0 number of times clients had to wait

no paranoia mode enabled

3600 restart internal

6. 5 reload count

passwd cache:

7. no cache is enabled

8. no cache is persistent

9. no cache is shared

0 suggested size

10. 0 total data pool size

11. 0 used data pool size

12. 3600 seconds time to live **for** positive entries

13. 20 seconds time to live **for** negative entries

14. 0 cache hits on positive entries

15. 0 cache hits on negative entries

16. 0 cache misses on positive entries

17. 0 cache misses on negative entries

18. 0% cache hit rate

19. 0 current number of cached values

20. 0 maximum number of cached values

21. 0 maximum chain length searched

22. 0 number of delays on rdlock

23. 0 number of delays on wrlock

24. 0 memory allocations failed

yes check /etc/passwd **for** changes

25. ……………………………………………………………………………………

清除缓存

1. nscd \-i passwd

2. nscd \-i group

3. nscd \-i hosts

除了上面的方法，重启nscd服务同样可以达到清理cache的目的。

**三、nscd的效果**

首先要看网络和dns服务器的能力,dns解析越慢,dns缓存的优势就越大.比如我们在北京用的dns服务器202.106.0.20和google的dns服务器8.8.8.8速度会差不少.

如果dns服务器比较稳定,那它对效率的影响就是一个常数.这个常数有多大呢?

我简单试了一下.在局域网内进行压力测试,压一个nginx下的静态页面,使用202.106.0.20这个dns服务器,不用dns缓存.平均一分钟可以访问27万次.压一个简单的php页面,平均一分钟可以访问22万次.加上nscd服务后,静态页面平均一分钟可以访问120万次,要快4倍多.php页面平均一分钟可以访问50万次,快一倍多.

如果是做搜索引擎或是一些代理服务类的项目,比如短信通道,数据推送服务,这个性能提升还是比较可观的.但在一般的项目中,一台服务器每分钟发22万次请求的情况是很少见的,所以这个性能提升也微呼其微.

但在追求极限的道路上,每一小步都至关重要噢~

来自 <[http://www.361way.com/linux-nscd-dns-cache/4265.html](http://www.361way.com/linux-nscd-dns-cache/4265.html)\>
