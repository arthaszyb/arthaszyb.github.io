---
title: Linux的IO性能监控工具iostat详解
date: '2014-08-21'
description: >-
  发表于: Linux, Tools, UNIX, 运维经验 | 作者: 谋万世全局者 标签: IO,iostat,Linux,工具,性能监控,详解
  Linux系统出现了性能问题，一般我们可以通过top、iostat、free、vmstat等命令来查看初步定位问题。
  其中iostat可以提供更丰富的IO性能状态数据。
category: linux
tags:
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---
## [Linux的IO性能监控工具iostat详解](http://www.ha97.com/4546.html)

发表于: [Linux](http://www.ha97.com/category/linux), [Tools](http://www.ha97.com/category/tools), [UNIX](http://www.ha97.com/category/unix), [运维经验](http://www.ha97.com/category/%e8%bf%90%e7%bb%b4%e7%bb%8f%e9%aa%8c) | 作者: [谋万世全局者](http://www.ha97.com/author/admin)

标签: [IO](http://www.ha97.com/tag/io),[iostat](http://www.ha97.com/tag/iostat),[Linux](http://www.ha97.com/tag/linux),[工具](http://www.ha97.com/tag/%e5%b7%a5%e5%85%b7),[性能监控](http://www.ha97.com/tag/%e6%80%a7%e8%83%bd%e7%9b%91%e6%8e%a7),[详解](http://www.ha97.com/tag/%e8%af%a6%e8%a7%a3)

**[Linux](http://www.ha97.com/category/linux)系统出现了性能问题，一般我们可以通过top、[iostat](http://www.ha97.com/tag/iostat)、free、[vmstat](http://www.ha97.com/tag/vmstat)等命令来查看初步定位问题。其中iostat可以提供更丰富的IO性能状态数据。**

1. 基本使用

$iostat -d -k 1 10

参数 \-d 表示，显示设备（磁盘）使用状态；\-k某些使用block为单位的列强制使用Kilobytes为单位；1 10表示，数据显示每隔1秒刷新一次，共显示10次。

$iostat -d -k 1 10

Device: tps kB\_read/s kB\_wrtn/s kB\_read kB\_wrtn

sda 39.29 21.14 1.44 441339807 29990031

sda1 0.00 0.00 0.00 1623 523

sda2 1.32 1.43 4.54 29834273 94827104

sda3 6.30 0.85 24.95 17816289 520725244

sda5 0.85 0.46 3.40 9543503 70970116

sda6 0.00 0.00 0.00 550 236 sda7 0.00 0.00 0.00 406 0

sda8 0.00 0.00 0.00 406 0

sda9 0.00 0.00 0.00 406 0

sda10 60.68 18.35 71.43 383002263 1490928140

Device: tps kB\_read/s kB\_wrtn/s kB\_read kB\_wrtn

sda 327.55 5159.18 102.04 5056 100

sda1 0.00 0.00 0.00 0 0

tps：该设备每秒的传输次数（Indicate the number of transfers per second that were issued to the device.）。“一次传输”意思是“一次I/O请求”。多个逻辑请求可能会被合并为“一次I/O请求”。“一次传输”请求的大小是未知的。

kB\_read/s：每秒从设备（drive expressed）读取的数据量；kB\_wrtn/s：每秒向设备（drive expressed）写入的数据量；kB\_read：读取的总数据量；kB\_wrtn：写入的总数量数据量；这些单位都为Kilobytes。

上面的例子中，我们可以看到磁盘sda以及它的各个分区的统计数据，当时统计的磁盘总TPS是39.29，下面是各个分区的TPS。（因为是瞬间值，所以总TPS并不严格等于各个分区TPS的总和）

2\. -x 参数

使用-x参数我们可以获得更多统计信息。

iostat -d -x -k 1 10

Device: rrqm/s wrqm/s r/s w/s rsec/s wsec/s rkB/s wkB/s avgrq-sz avgqu-sz await svctm %util

sda 1.56 28.31 7.80 31.49 42.51 2.92 21.26 1.46 1.16 0.03 0.79 2.62 10.28

Device: rrqm/s wrqm/s r/s w/s rsec/s wsec/s rkB/s wkB/s avgrq-sz avgqu-sz await svctm %util

sda 2.00 20.00 381.00 7.00 12320.00 216.00 6160.00 108.00 32.31 1.75 4.50 2.17 84.20

rrqm/s：每秒这个设备相关的读取请求有多少被Merge了（当系统调用需要读取数据的时候，VFS将请求发到各个FS，如果FS发现不同的读取请求读取的是相同Block的数据，FS会将这个请求合并Merge）；wrqm/s：每秒这个设备相关的写入请求有多少被Merge了。

rsec/s：每秒读取的扇区数；wsec/：每秒写入的扇区数。r/s：The number of read requests that were issued to the device per second；w/s：The number of write requests that were issued to the device per second；

await：每一个IO请求的处理的平均时间（单位是~微秒~毫秒）。这里可以理解为IO的响应时间，一般地系统IO响应时间应该低于5ms，如果大于10ms就比较大了。

%util：在统计时间内所有处理IO时间，除以总共统计时间。例如，如果统计间隔1秒，该设备有0.8秒在处理IO，而0.2秒闲置，那么该设备的%util = 0.8/1 = 80%，所以该参数暗示了设备的繁忙程度。一般地，如果该参数是100%表示设备已经接近满负荷运行了（当然如果是多磁盘，即使%util是100%，因为磁盘的并发能力，所以磁盘使用未必就到了瓶颈）。

3\. -c 参数

iostat还可以用来获取cpu部分状态值：

iostat -c 1 10

avg-cpu: %[user](http://www.ha97.com/tag/user) %nice %sys %iowait %idle

1.98 0.00 0.35 11.45 86.22

avg-cpu: %user %nice %sys %iowait %idle

1.62 0.00 0.25 34.46 63.67

4. 常见用法

$iostat -d -k 1 10 #查看TPS和吞吐量信息

iostat -d -x -k 1 10 #查看设备使用率（%util）、响应时间（await）

iostat -c 1 10 #查看cpu状态

5\. 实例分析

$iostat -d -k 1 |grep sda10

Device: tps kB\_read/s kB\_wrtn/s kB\_read kB\_wrtn

sda10 60.72 18.95 71.53 395637647 1493241908

sda10 299.02 4266.67 129.41 4352 132

sda10 483.84 4589.90 4117.17 4544 4076

sda10 218.00 3360.00 100.00 3360 100

sda10 546.00 8784.00 124.00 8784 124

sda10 827.00 13232.00 136.00 13232 136

上面看到，磁盘每秒传输次数平均约400；每秒磁盘读取约5MB，写入约1MB。

iostat -d -x -k 1

Device: rrqm/s wrqm/s r/s w/s rsec/s wsec/s rkB/s wkB/s avgrq-sz avgqu-sz await svctm %util

sda 1.56 28.31 7.84 31.50 43.65 3.16 21.82 1.58 1.19 0.03 0.80 2.61 10.29

sda 1.98 24.75 419.80 6.93 13465.35 253.47 6732.67 126.73 32.15 2.00 4.70 2.00 85.25

sda 3.06 41.84 444.90 54.08 14204.08 2048.98 7102.04 1024.49 32.57 2.10 4.21 1.85 92.24

可以看到磁盘的平均响应时间<5ms，磁盘使用率>80。磁盘响应正常，但是已经很繁忙了。

延伸：

**rrqm/s:** 每秒进行 merge 的读操作数目.即 delta(rmerge)/s

wrqm/s: 每秒进行 merge 的写操作数目.即 delta(wmerge)/s

r/s: 每秒完成的读 I/O 设备次数.即 delta(rio)/s

w/s: 每秒完成的写 I/O 设备次数.即 delta(wio)/s

rsec/s: 每秒读扇区数.即 delta(rsect)/s

wsec/s: 每秒写扇区数.即 delta(wsect)/s

rkB/s: 每秒读K字节数.是 rsect/s 的一半,因为每扇区大小为512字节.(需要计算)

wkB/s: 每秒写K字节数.是 wsect/s 的一半.(需要计算)

avgrq-sz: 平均每次设备I/O操作的数据大小 (扇区).delta(rsect+wsect)/delta(rio+wio)

avgqu-sz: 平均I/O队列长度.即 delta(aveq)/s/1000 (因为aveq的单位为毫秒).

await: 平均每次设备I/O操作的等待时间 (毫秒).即 delta(ruse+wuse)/delta(rio+wio)

svctm: 平均每次设备I/O操作的服务时间 (毫秒).即 delta(use)/delta(rio+wio)

%util: 一秒中有百分之多少的时间用于 I/O 操作,或者说一秒中有多少时间 I/O 队列是非空的.即 delta(use)/s/1000 (因为use的单位为毫秒)

**如果** **%util** **接近** **100%,说明产生的I/O请求太多,I/O系统已经满负荷,该磁盘**

**可能存在瓶颈.**

**idle小于70% IO压力就较大了,一般读取速度有较多的wait.**

**同时可以结合vmstat** **查看查看b参数(等待资源的进程数)和wa参数(IO等待所占用的CPU时间的百分比,高过30%时IO压力高)**

**另外** **await** **的参数也要多和** **svctm** **来参考.差的过高就一定有** **IO** **的问题.**

**avgqu-sz** **也是个做** **IO** **调优时需要注意的地方,这个就是直接每次操作的数据的大小,如果次数多,但数据拿的小的话,其实** **IO** **也会很小.如果数据拿的大,才IO** **的数据会高.也可以通过** **avgqu-sz × ( r/s or w/s ) = rsec/s or wsec/s.也就是讲,读定速度是这个来决定的.**

**另外还可以参考**

**svctm** **一般要小于** **await (因为同时等待的请求的等待时间被重复计算了),svctm** **的大小一般和磁盘性能有关,CPU/内存的负荷也会对其有影响,请求过多也会间接导致** **svctm** **的增加.await** **的大小一般取决于服务时间(svctm)** **以及** **I/O** **队列的长度和** **I/O** **请求的发出模式.如果** **svctm** **比较接近** **await,说明** **I/O** **几乎没有等待时间；如果** **await** **远大于** **svctm,说明** **I/O** **队列太长,应用得到的响应时间变慢,如果响应时间超过了用户可以容许的范围,这时可以考虑更换更快的磁盘,调整内核** **elevator** **算法,优化应用,或者升级** **CPU.**

**队列长度(avgqu-sz)也可作为衡量系统** **I/O** **负荷的指标,但由于** **avgqu-sz** **是按照单位时间的平均值,所以不能反映瞬间的** **I/O** **洪水.**

**别人一个不错的例子.(I/O** **系统** **vs.** **超市排队)**

举一个例子,我们在超市排队 checkout 时,怎么决定该去哪个交款台呢? 首当是看排的队人数,5个人总比20人要快吧? 除了数人头,我们也常常看看前面人购买的东西多少,如果前面有个采购了一星期食品的大妈,那么可以考虑换个队排了.还有就是收银员的速度了,如果碰上了连 钱都点不清楚的新手,那就有的等了.另外,时机也很重要,可能 5 分钟前还人满为患的收款台,现在已是人去楼空,这时候交款可是很爽啊,当然,前提是那过去的 5 分钟里所做的事情比排队要有意义 (不过我还没发现什么事情比排队还无聊的).

I/O 系统也和超市排队有很多类似之处:

r/s+w/s 类似于交款人的总数

平均队列长度(avgqu-sz)类似于单位时间里平均排队人的个数

平均服务时间(svctm)类似于收银员的收款速度

平均等待时间(await)类似于平均每人的等待时间

平均I/O数据(avgrq-sz)类似于平均每人所买的东西多少

I/O 操作率 (%util)类似于收款台前有人排队的时间比例.

我们可以根据这些数据分析出 I/O 请求的模式,以及 I/O 的速度和响应时间.
