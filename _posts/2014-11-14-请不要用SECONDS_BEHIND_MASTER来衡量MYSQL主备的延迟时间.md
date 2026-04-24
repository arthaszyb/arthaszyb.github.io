---
title: "请不要用SECONDS_BEHIND_MASTER来衡量MYSQL主备的延迟时间"
date: 2014-11-14 19:50:33 +0000
categories: ["MySQL [2]"]
tags: ["Pages"]
description: "Friday, November 14, 2014 7:50 PM 2013 年 12 月 6 日, 下午 3:47 MySQL 本身通过 show slave status 提供了 Seconds_Behind_Master ，用于衡量主备之间的复制延迟，但是今天碰到了一个场景，发现 Seconds_Behind_M"
source: "evernote-local-db"
---

请不要用SECONDS_BEHIND_MASTER来衡量MYSQL主备的延迟时间
Friday, November 14, 2014
7:50 PM
请不要用SECONDS_BEHIND_MASTER来衡量MYSQL主备的延迟时间
2013 年 12 月 6 日, 下午 3:47

MySQL 本身通过
show slave status
提供了
Seconds_Behind_Master
，用于衡量主备之间的复制延迟，但是今天碰到了一个场景，发现
Seconds_Behind_Master
为
0
， 备库的
show slave status
显示
IO/SQL
线程都是正常的 ， MySQL 的主库上的变更却长时间无法同步到备库上。如果没有人为干预，直到一个小时以后，
MySQL
才会自动重连主库，继续复制主库的变更。
影响范围：
MySQL
，
Percona
，
MariaDB
的所有版本。

虽然这种场景非常特殊，遇到的概率并不高，但是个人觉得有必要提醒一下使用
MySQL
的
DBA
们。通过对这个场景的分析，也有助于我们更加深入的理解
MySQL replication
重试机制。

一、重现步骤
搭建主备的复制，临时断开主库的网络，并
kill
掉主库
MySQL
的
binlog dump
线程。
此时观察备库的复制情况，
show slave status
中：
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
Seconds_Behind_Master: 0
但是此时你把网络恢复以后，在主库做任何变更，备库都无法获得数据更新了。而且备库上的
show slave status
显示：
IO
线程
SQL
线程一切正常，复制延迟一直是
0
。
一切正常，普通的监控软件都不会发现备库有数据延迟。

二、原理分析
MySQL 的
Replication
是区别于其他数据库很关键的地方。也是可扩展性和高可用的基础。它本身已经非常智能化，只需要我们调用
Change Master
指定
Binlog
文件名和偏移位置就可以搭建从主库到备库的复制关系。
MySQL 复制
线程

会自动将目前复制位置记录下来，在主备复制中断的时候自动连上主库，并从上次中断的位置重新开始复制。这些操作都是全自动化的，不需要人为的干预。这给了
MySQL DBA
带来了很多便利，同时却也隐藏了很多细节。
要真正的理解前面问题的真相以及怎么解决这个问题，我们还是需要真正的理解
MySQL
复制的原理。

2.1“推”还是“拉”
首先，
MySQL
的复制是“推”的，而不是“拉”的。“拉”是指
MySQL
的备库不断的循环询问主库是否有数据更新，这种方式资源消耗多，并且效率低。“推”是指
MySQL
的主库在自己有数据更新的时候推送这个变更给备库，这种方式只有在数据有变更的时候才会发生交互，资源消耗少。如果你是程序员出身，你一定会选择“推”的方式。
那么
MySQL
具体是怎么“推”的列，实际上备库在向主库申请数据变更记录的时候，需要指定从主库
Binlog
的哪个文件
( MASTER_LOG_FILE
) 的具体多少个字节偏移位置
( MASTER_LOG_POS
) 。对应的，主库会启动一个
Binlog dump
的线程，将变更的记录从这个位置开始一条一条的发给备库。备库一直监听主库过来的变更，接收到一条，才会在本地应用这个数据变更。

2.2 原因解析
从上面的分析，我们可以大致猜到为什么
show slave status
显示一切正常，但是实际上主库的变更都无法同步到备库上来：
出现问题的时候，
Binlog dump
程序被我们
kill
掉了。作为监听的一方，备库一直没有收到任何变更，它会认为主库上长时间没有任何变更，导致没有变更数据推送过来。备库是无法判断主库上对应的
Binlog dump
线程

到底是意外终止了，还是长时间没有任何数据变更的。所以，对这两种情况来说，备库都显示为正常。
当然，
MySQL
会尽量避免这种情况。比如：
l
在
Binlog dump
被
kill
掉时通知备库
线程

被
kill
掉了。所以我们重现时需要保证这个通知发送不到备库，也就是说该问题重现的关键在于
Binlog dump
被
kill
的消息由于网络堵塞或者其他原因无法发送到备库。
l
备库如果长时间没有收到从主库过来的变更，它会每隔一段时间重连主库。

2.3 问题避免
基于上面的分析，我们知道
MySQL
在这种情况下确实无法避免，那么我们可以有哪些办法可以避开列：
1. 被动处理：修改延迟的监控方法，发现问题及时处理。
2. 主动预防：正确设置
--master-retry-count
，
--master-connect-retry
，
--slave-net-timeout
复制重试参数。

l
被动处理
MySQL 的延迟监控大部分直接采集
show slave status
中的
Seconds_Behind_Master
。这种情况下，
Seconds_Behind_Master
就无法用来真实的衡量主备之间的复制延迟了。我们建议通过在主库轮询插入时间信息，并通过复制到备库的时间差来获得主备延迟的方案。
Percona
提供了一种类似的方案
pt-heartbeat
。
发现这个问题以后，我们只需要
stop slave; start slave;
重启复制就能解决这个问题。

l
主动预防
MySQL 可以指定三个参数，用于复制线程重连主库：
--master-retry-count
，
--master-connect-retry
，
--slave-net-timeout
。
其中
master-connect-retry
和
master-retry-count
需要在
Change Master
搭建主备复制时指定，而
slave-net-timeout
是一个全局变量，可以在
MySQL
运行时在线设置。
具体的重试策略为：备库过了
slave-net-timeout
秒还没有收到主库来的数据，它就会开始第一次重试。然后每过
master-connect-retry
秒，备库会再次尝试重连主库。直到重试了
master-retry-count
次，它才会放弃重试。如果重试的过程中，连上了主库，那么它认为当前主库是好的，又会开始
slave-net-timeout
秒的等待。
slave-net-timeout 的默认值是
3600
秒，
master-connect-retry
默认为
60
秒，
master-retry-count
默认为
86400
次。也就是说，如果主库一个小时都没有任何数据变更发送过来，备库才会尝试重连主库。这就是为什么在我们模拟的场景下，一个小时后，备库才会重连主库，继续同步数据变更的原因。
这样的话，如果你的主库上变更比较频繁，可以考虑将
slave-net-timeout
设置的小一点，避免主库
Binlog dump
线程

终止了，无法将最新的更新推送过来。
当然
slave-net-timeout
设置的过小也有问题，这样会导致如果主库的变更确实比较少的时候，备库频繁的重新连接主库，造成资源浪费。
沃趣科技的
Q
Monitor 监控中对主备复制的延迟监控，并不是通过
Seconds_Behind_Master
来监控主备的。它采用了类似于
pt-heartbeat
的方式对主备进行复制延迟监控。

对应故障:
Query partially completed on the master (error on master: 1317) and was aborted. There is a chance that your master is inconsistent at this point. If you are sure that your master is ok, run this query manually on the slave and then restart the slave with SET GLOBAL SQL_SLAVE_SKIP_COUNTER=1; START SLAVE; . Query: 'delete from t04_bug_stat where thetime>=""'
分析:
上面话的意思是: Query: 'delete from t04_bug_stat where thetime>=""'在主机上被部分执行并终止了,丛机因此终止同步,如果确认主机ok,请执行restart the slave with SET GLOBAL SQL_SLAVE_SKIP_COUNTER=1; START SLAVE;来重启同步.
解决方法:
stop slave;SET GLOBAL SQL_SLAVE_SKIP_COUNTER=1; START SLAVE;
T GLOBAL SQL_SLAVE_SKIP_COUNTER=1; START SLAVE;

已使用 Microsoft OneNote 2016 创建。
