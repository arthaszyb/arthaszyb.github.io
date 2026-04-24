---
title: "Zookeeper集群环境安装过程详解 - CSDN博客"
date: 2018-04-08 09:11:53 +0000
categories: ["监控告警"]
tags: []
description: "博客 学院 下载 GitChat 论坛 问答 商城 VIP 活动 招聘 ITeye 码云 CSTO .   写博客  发Chat 登录 注册 Zookeeper集群环境安装过程详解 原创 2014年02月10日 21:22:02 标签： zookeeper / 集群 / Hadoop / Linux . . Zo"
source: "evernote-local-db"
---

博客

学院

下载

GitChat

论坛

问答

商城

VIP

活动

招聘

ITeye

码云

CSTO

.




写博客


发Chat

登录
注册

Zookeeper集群环境安装过程详解

原创

2014年02月10日 21:22:02

标签：

zookeeper

/

集群

/

Hadoop

/

Linux

.

.

Zookeeper是一个分布式开源框架，提供了协调分布式应用的基本服务，它向外部应用暴露一组通用服务——分布式同步（Distributed Synchronization）、命名服务（Naming Service）、集群维护（Group Maintenance）等，简化分布式应用协调及其管理的难度，提供高性能的分布式服务。ZooKeeper本身可以以单机模式安装运行，不过它的长处在于通过分布式ZooKeeper集群（一个Leader，多个Follower），基于一定的策略来保证ZooKeeper集群的稳定性和可用性，从而实现分布式应用的可靠性。

本文将向大家主要介绍Zookeeper的安装与配置。

众所周知，Zookeeper有三种不同的运行环境，包括：单机环境、集群环境和集群伪分布式环境。

在此主要向大家介绍集群环境的安装与配置。

1.Zookeeper的下载与解压

通过后面的链接下载Zookeeper：

Zookeeper下载

在此我们下载
zookeeper-3.4.5

下载后解压至安装目录下，本文我们解压到目录：/home/haduser/zookeeper

$:tar -xzvf

zookeeper-3.4.5.tar.gz

如下图所示：

2.zookeeper的环境变量的配置：

为了今后操作方便，我们需要对Zookeeper的环境变量进行配置，方法如下：

在/etc/profile文件中加入如下的内容：

#set zookeeper environment

export ZOOKEEPER_HOME=/home/haduser/zookeeper/zookeeper-3.4.5

export PATH=$PATH:$ZOOKEEPER_HOME/bin:$ZOOKEEPER_HOME/conf

3.集群部署：

在Zookeeper集群环境下只要一半以上的机器正常启动了，那么Zookeeper服务将是可用的。
因此，集群上部署Zookeeper最好使用奇数台机器，这样如果有5台机器，只要3台正常工作则服务将正常使用。

下面我们将对Zookeeper的配置文件的参数进行设置：

进入zookeeper-3.4.5/conf：

$:cp zoo_sample.cfg zoo.cfg

$:vim zoo.cfg

可参考下图配置：

注意上图的配置中master，slave1分别为主机名，具体的对应的主机可参见之前的Hadoop的安装与配置的博文。

在上面的配置文件中"server.id=host:port:port"中的第一个port是从机器（follower）连接到
主机器（
leader）的端口号，第二个port是进行leadership选举的端口号。

接下来在dataDir所指定的目录下创建一个文件名为myid的文件，文件中的内容只有一行，为本主机对应的id值，也就是上图中server.id中的id。例如：在服务器1中的myid的内容应该写入1。

4.
远程复制分发安装文件

接下来将上面的安装文件拷贝到集群中的其他机器上对应的目录下：

haduser@master:~/zookeeper$ scp -r zookeeper-3.4.5/ slave1:/home/haduser/zookeeper/
zookeeper-3.4.5

haduser@master:~/zookeeper$ scp -r zookeeper-3.4.5/ slave2:/home/haduser/zookeeper/
zookeeper-3.4.5

拷贝完成后修改对应的机器上的myid。例如修改slave1中的myid如下：

haduser@slave1:~/zookeeper/zookeeper-3.4.5$ echo "2" > data/myid

haduser@slave1:~/zookeeper/zookeeper-3.4.5$ cat data/myid

2

5.
启动ZooKeeper集群

在ZooKeeper集群的每个结点上，执行启动ZooKeeper服务的脚本，如下所示：

haduser@master:~/zookeeper/zookeeper-3.4.5$ bin/zkServer.sh start

haduser@slave1:~/zookeeper/zookeeper-3.4.5$ bin/zkServer.sh start

haduser@slave2:~/zookeeper/zookeeper-3.4.5$ bin/zkServer.sh start

如下图所示：

其中，QuorumPeerMain是zookeeper进程，启动正常。

如上依次启动了所有机器上的Zookeeper之后
可以通过ZooKeeper的脚本来查看启动状态，包括集群中各个结点的角色（或是Leader，或是Follower），如下所示，是在ZooKeeper集群中的每个结点上查询的结果：

通过上面状态查询结果可见，slave1是集群的Leader，其余的两个结点是Follower。

另外，可以通过客户端脚本，连接到ZooKeeper集群上。对于客户端来说，ZooKeeper是一个整体（ensemble），连接到ZooKeeper集群实际上感觉在独享整个集群的服务，所以，你可以在任何一个结点上建立到服务集群的连接，例如：

6.
停止zookeeper进程：zookeeper-3.4.3/bin/zkServer.sh stop

至此，Zookeeper集群安装大功告成！

版权声明：本文为博主原创文章，未经博主允许不得转载。 https://blog.csdn.net/canlets/article/details/19046357


目前您尚未登录，请
登录
或
注册
后进行评论

.

m_3251388

2015-11-06 19:13

#1楼

回复

.

为什么zookeeper的全分布配置最好是奇数个，我只有两台机子，一主一从配置，总是开启不了zkServer.sh 服务 。。。

.

.

.

.

huangning2

2015-11-20 10:53

.

回复m_3251388：zookeeper集群可用,必须有一半实例可用,如果是偶数2n,那跟2n-1的效果是一样的,就是说偶尔就是冗余了一台

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

.

cruise2012

.

原创

64

粉丝

54

喜欢

6

评论

47

.

等级：

访问量：

36万+

积分：

4475

排名：

8222

.

博主最新文章

更多文章

.

十个值得一试的开源深度学习框架

.

Sublime text 2/3 中 Package Control 的安装与使用方法

.

Python安装第三方模块BeautifulSoup

.

Mac下Jupyter(即IPython-notebook)的搭建及使用

.

Mac下安装pip，virtualenv，IPython

.

.

文章分类

1.Java

37篇

.

2.C/C++

5篇

.

3.Linux/Unix

15篇

.

4.JAVA Web

15篇

.

5.Android

36篇

.

6.Python

7篇

.

7.Hadoop

4篇

.

8.Algorithm

3篇

.

9.IT trend

4篇

.

10.Maven

7篇

.

11.Mina

4篇

.

12.javascript

6篇

.

13.Data Mining

4篇

.

14.Machine Learning

2篇

.

15.OSGI

4篇

.

综合

25篇

.

展开


文章存档

2017年7月

1篇

.

2017年3月

4篇

.

2016年4月

3篇

.

2016年3月

10篇

.

2016年2月

1篇

.

2014年11月

1篇

.

2014年9月

4篇

.

2014年6月

13篇

.

2014年5月

21篇

.

2014年4月

1篇

.

2014年3月

2篇

.

2014年2月

8篇

.

2014年1月

4篇

.

2013年12月

9篇

.

2013年11月

12篇

.

2013年10月

14篇

.

2013年9月

6篇

.

2013年8月

38篇

.

2013年6月

1篇

.

2013年5月

1篇

.

2013年4月

1篇

.

2013年3月

6篇

.

2013年2月

7篇

.

展开


博主热门文章

数据库多表查询的几种方法


18957

Zookeeper集群环境安装过程详解


18944

JWT（JSON Web Tokens）的使用


12686

java实现冒泡、选择、快速排序算法


12494

Python爬虫抓取网页图片


11635

在java程序中动态设置java.library.path


10140

Mac下Jupyter(即IPython-notebook)的搭建及使用


10020

拦截器（Interceptor）中的invocation.invoke()是什么意思？


9738

基于MINA实现server端心跳检测（KeepAliveFilter）


9274

在cmd下用cl命令编译运行C/C++源文件


9117

联系我们

请扫描二维码联系客服

webmaster@csdn.net
400-660-0108

QQ客服

客服论坛

关于
招聘
广告服务

百度

©1999-2018 CSDN版权所有

京ICP证09002463号

经营性网站备案信息

网络110报警服务

中国互联网举报中心

北京互联网违法和不良信息举报中心

.



.



.



.

.

加入CSDN，享受更精准的内容推荐，与500万程序员共同成长！
登录
注册
.
.

