---
title: Linux下如何用mdadm实现软件RAID
date: '2014-03-28'
description: >-
  Linux下如何用mdadm实现软件RAID 2007年10月17日 - 03:28 评论关闭
  数据在现今企业中占有重要的地位,数据存储的安全性有而是人们使用计算机要注意的重要问题之一.通常情况下人们在服务器端采用各种冗余磁盘阵列RAID技术
category: linux
tags:
  - crontab
  - php
  - raid
  - cdn
  - 存储
draft: false
source: evernote-local-db
lang: zh
---
- [Linux](http://www.php-oa.com/2007/10/17/linux-mdadm-raid.html)[下如何用](http://www.php-oa.com/2007/10/17/linux-mdadm-raid.html)[mdadm](http://www.php-oa.com/2007/10/17/linux-mdadm-raid.html)[实现软件](http://www.php-oa.com/2007/10/17/linux-mdadm-raid.html)[RAID](http://www.php-oa.com/2007/10/17/linux-mdadm-raid.html)

2007年10月17日 - 03:28

评论关闭

数据在现今企业中占有重要的地位,数据存储的安全性有而是人们使用计算机要注意的重要问题之一.通常情况下人们在服务器端采用各种冗余磁盘阵列RAID技术

来保护数据,中高档的服务器一般都提供了昂贵的硬件RAID控制器,但是很多中小企业没有足够的经费承受这笔开销.我们有没有方法可以通过软件来实现RAID呢？

实际上在Linux下可以通过软件来实现硬件的RAID功能,这样既节省了投资,又能达到很好的效果.今天就由我为大家介绍如何在网络环境中实现带有一块Spare-disk的软RAID1（数据镜像）阵列.

小提示：什么是RAID1（数据镜像）？RAID1是比较可靠的数据存储方式,每一个磁盘都具有一个对应的镜像盘.对任何磁盘的数据写入都会被复制镜像盘中；系统可以从一组镜像盘中的任何一个磁盘读取数据,也就是说同一个数据会被重复写入两次,这样的磁盘镜像肯定会提高系统成本.因为我们所能使用的空间只是所有磁盘容量总和的一半.

由于本文中会使用mdadm软件,而该软件一般情况下都会集成在Redhat linux中,所以可以直接使用.如果系统中没有安装可以到http://www.cse.unsw.edu.au/~neilb/source /mdadm来下载mdadm-xxx.tgz进行编译安装,也可以到http://www.cse.unsw.edu.au/~neilb /source/mdadm/rpm下载mdadm-xxx.i386.rpm直接安装.

作为一个面向服务器的网络型操作系统,Linux对数据的安全和存取速度给予了高度重视,从2.4版内核开始Linux就实现了对软件RAID的支持,这让我们可以不必购买昂贵的硬件RAID设备,就能享受到增强的磁盘I/O性能和可靠性,进一步降低了系统的总体拥有成本.下面就让我们看一个

Redhat Linux AS 4下的软件RAID配置实例吧.

● 操作系统为RedHat Linux AS 4；

● 内核版本为2.6.9-5.EL；

● 支持RAID0、RAID1、RAID4、RAID5、RAID6；

● 五块36GB SCSI接口的磁盘,其中RedHat AS 4安装在第一块磁盘,其它四块组成RAID 5用来存放Oracle数据库.

在RedHatAS4下实现软件RAID是通过mdadm工具实现的,其版本为1.6.0,它是一个单一的程序,创建、管理RAID都非常方便,而且也很稳定.而在早期Linux下使用的raidtools,由于维护起来很困难,而且其性能有限,在RedHat AS 4下已经不支持了.

实现过程

一.几种常用RAID的简介

RAID是冗余磁盘阵列（Redundant Array of InexpensiveDisk）的简称.它是把多个磁盘组成一个阵列,当作单一磁盘使用.它将数据以分段(striping)的方式分散存储在不同的磁盘中,通过多个磁盘的同时读写,来减少数据的存取时间,并且可以利用不同的技术实现数据的冗余,即使有一个磁盘损坏,也可以从其他的磁盘中恢复所有的数据.简单地说,其好处就是：安全性高、速度快、数据容量大.

磁盘阵列根据其使用的技术不同而划分了等级,称为RAID level,目前公认的标准是RAID0～RAID 5.其中的level并不代表技术的高低,RAID 5并不高于RAID 4 ,RAID 0并不低于RAID 2,至于选择哪一种RAID需视用户的需求而定.下面分别对常用的RAID 0、RAID 1、RAID 5进行简单的介绍.

1．RAID 0

特点：它是将多个磁盘并列起来,成为一个大硬盘.在存取数据时,将数据按磁盘的个数来进行分段,然后同时将这些数据写进这些盘中.在所有的级别中,RAID 0的速度是最快的.但没有数据冗余,阵列中任何一个磁盘坏掉,意味着所有数据丢失.

磁盘利用数：n(假设有n个磁盘).

配置条件：最低两块磁盘,且分区大小尽量相同.

应用领域：对高磁盘容量及高速磁盘存取有特殊需求,而又不计较其高故障率的工作.当然,如果你正在使用集群,RAID 0 无疑是提高磁盘I/O性能的最好方法,因为在这种情况下,你就不用担心冗余的问题了.

2．RAID 1

特点：使用磁盘镜像(disk mirroring)的技术,在一个磁盘上存放数据的同时也在另一个磁盘上写一样的数据.因为有了备份磁盘,所以RAID1的数据安全性在所有的RAID 级别上来说是最好的.尽管其写入数据的速度比较慢,但因其数据是以分段的方式作储存,因而在读取时,它几乎和RAID0有同样的性能.

磁盘利用数：n/2.

配置条件：最低两块磁盘,且分区大小尽量相同.

应用领域：数据库、金融系统等一些对数据有着高可靠性要求的领域.再者就是系统中写数据量比较少,而读数据量又比较多的情况下可以采用这一模式.

3．RAID 5

特点：以数据的校验位来保证数据的安全,但它不是以单独硬盘来存放数据的校验位,而是将数据段的校验位交互存放于各个磁盘上.这样,任何一个磁盘损坏,都可以根据其他磁盘上的校验位来重建损坏的数据.并行读写数据,性能也很高.

磁盘利用数：n-1.

配置条件：最低三块硬盘,且分区大小尽量相同.

应用领域：适合于事务处理环境,如售票处、销售系统等.

_二、模式_

_mdadm有6种模式,前两种模式：Create、Assemble用于配置和激活阵列；Manage模式用于操作在活动阵列中的设备；Follow或 Monitor模式允许管理员对活动阵列配置事件提醒和动作；Build模式用于对旧阵列使用旧版本的md驱动；还有Grow模式可以扩展阵列；剩下的是 Misc模式,它包括对多种内部的任务和没有指定特殊模式的一些操作._

_三、部署_

_1、准备磁盘_

_只能使用Sofware RAID格式的磁盘才能组成阵列,所以,首先我们要把做好磁盘格式.正如上面提到的,除了系统盘sda外,我们需要对sdb、sdc、sdd进行操作_

_a）对sdb进行分区_

_fdisk /dev/sdb_

![](/images/legacy/legacy-58ec329aaa.jpg)

分区前状态：

![](/images/legacy/legacy-62809caeb7.jpg)

n,划分区：

![](/images/legacy/legacy-461918c903.jpg)

t,修改分区格式为fd：

![](/images/legacy/legacy-38695ec8b8.jpg)

w,保存：

![](/images/legacy/legacy-918993cfac.jpg)

b）同样的方法,对sdc、sdd进行分区和保存

最后状态如下：

![](/images/legacy/legacy-da4e97dc08.jpg)

**2、创建阵列**

**mdadm可以支持LINEAR、RAID0 (striping)、 RAID1(mirroring)、 RAID4、RAID5、RAID6和MULTIPATH的阵列模式.**

**创建命令格式如下：**

mdadm \[mode\] \[options\]

例如：创建一个RAID 0设备：

mdadm –create –verbose /dev/md0 –level=0 –raid-devices=3 /dev/sdb1 /dev/sdc1 /dev/sdd1

–level表示创建的阵列模式,–raid-devices表示参与阵列的磁盘数量.

![](/images/legacy/legacy-f471c283ce.jpg)

**也可以这样表达,意思是一样的：**

mdadm -Cv /dev/md0 -l0 -n3 /dev/sd\[bcd\]1

还可以增加-c128参数,指定chunk size为128K（默认64K） –_spare_\-devices是加入热备.

**3、配置文件**

**mdadm不采用/etc/mdadm.conf作为主要配置文件,它可以完全不依赖该文件而不会影响阵列的正常工作.**

**该配置文件的主要作用是方便跟踪软RAID的配置.对该配置文件进行配置是有好处的,但不是必须的.推荐对该文件进行配置.**

通常可以这样来建立：

**echo DEVICE /dev/sd\[bcd\]1 > /etc/mdadm.conf**

**mdadm -Ds >> /etc/mdadm.conf**

**mdadm –detail –scan >> /etc/mdadm.conf**

**4、格式化阵列**

**后续,只要你把/dev/md0作为一个单独的设备来进行操作即可：**

mkfs.ext3 /dev/md0

mkdir /mnt/test

mount /dev/md0 /mnt/test

**5、若要开机自动挂载,请加入/etc/fstab中：**

**/dev/md0 /mnt/tes auto defaults 0 0**

_四、监控和管理_

mdadm可以非常方便的对阵列进行监控和管理的操作,也包括了停止和启动阵列等常用维护.

**1、查看**

cat /proc/mdstat

可以查看所有使用md驱动的阵列的状态：

![](/images/legacy/legacy-5f6c4c11e7.jpg)

mdadm –detail /dev/md0

查看指定阵列的详细信息（-D）：

![](/images/legacy/legacy-ccc57ef0da.jpg)

**2、停止**

mdadm -S /dev/md0

停止指定阵列,并释放磁盘（–stop）：

![](/images/legacy/legacy-00c0198c4f.jpg)

**※注意：停止后,原组成阵列的磁盘将处于空闲状态,一旦吾操作这些磁盘,将不能再重启激活原阵列.**

**3、启动**

mdadm -A /dev/md0 /dev/sd\[bcd\]1

启动指定的阵列,也可理解为讲一个新阵列装配到系统中（–assemble）：

![](/images/legacy/legacy-6807651a31.jpg)

若你已经在上面配置了/etc/mdadm.conf文件,也可用-s查找：

mdadm -As /dev/md0

![](/images/legacy/legacy-214a6bbaf8.jpg)

**4、测试**

**如果你没有配置/etc/mdadm.conf文件,而且又忘了某磁盘属于那个阵列,则你可以使用检测：（–examine）**

mdadm -E /dev/sdb1

![](/images/legacy/legacy-121bae53cd.jpg)

获得UUID后,也可以这样激活阵列：

mdadm -Av /dev/md0 –uuid=8ba81579:e20fb0e8:e040da0e:f0b3fec8 /dev/sd\*

可以看到,只要磁盘没有损坏,这样装配是非常方便的：

![](/images/legacy/legacy-667723c23c.jpg)

**5、添加及删除磁盘**

**mdadm可以在Manage模式下,对运行中的阵列进行添加及删除磁盘.常用于标识failed磁盘,增加spare（冗余）磁盘,以及替换磁盘等.**

**例如：原来状态是：**

![](/images/legacy/legacy-f393bbca28.jpg)

则可以使用–fail指定坏磁盘,并–remove走：

mdadm /dev/md0 –fail /dev/sdc1 –remove /dev/sdc1

![](/images/legacy/legacy-c5e5da5caf.jpg)

![](/images/legacy/legacy-916c623827.jpg)

等待同步完成后,结果：

![](/images/legacy/legacy-4c95d2f858.jpg)

**※需要注意的是,对于某些阵列模式,如RAID0等,是不能用–fail和–remove的.**

![](/images/legacy/legacy-d27665e506.jpg)

增加一个新的阵列用磁盘

mdadm /dev/md0 –add /dev/sdc1

![](/images/legacy/legacy-9f9717fe4b.jpg)

**※需要注意的是,对于某些阵列模式,如RAID0等,是不能用–add的.**

**6、监控**

**在Follow或Monitor状态下,可以使用mdadm对阵列进行监控,例如当阵列出现问题的时候,发送邮件给管理员；或者当磁盘出现问题的时候进行自动的磁盘替换.**

nohup mdadm –monitor –mail=sysadmin –delay=300 /dev/md0 &

上述定义：没300秒监控一次,当阵列出现错误,会发送邮件给sysadmin用户.由于monitor启动后是不会自动退出的,所以需要加上nohup和&,使之持续在后台运行.

在Follow模式下,是允许共享冗余磁盘的.

例如,我们有两个阵列：/dev/md0、/dev/md1,而/dev/md0里面有一个spare磁盘.当我们在/etc/mdadm.conf中定义类似：

DEVICE /dev/sd\*

ARRAY /dev/md0 level=raid1 num-devices=3 spare-group=database

UUID=410a299e:4cdd535e:169d3df4:48b7144a

ARRAY /dev/md1 level=raid1 num-device=2 spare-group=database

UUID=59b6e564:739d4d28:ae0aa308:71147fe7

也就是定义一个spare-group组.并运行上面的monitor模式命令.这样,当组成/dev/md1的其中一个磁盘出现问题的时候,mdadm会自动从/dev/md0上移走spare磁盘,并加入/dev/md1中,而不需要人工干预**.（请注意,能实现这样工作的,只有在该阵列支持冗余的情况下才能实现,如raid1、raid5等.而对于raid0等阵列模式,是无效的）**

_五、其他_

_1、增加spare磁盘_

_可以通过在创建的时候指定冗余磁盘：_

mdadm -Cv /dev/md0 -l1 -n2 -x1 /dev/sd\[bcd\]1

\-x（–spare-devices）参数用于指定冗余磁盘的数量,结果：

![](/images/legacy/legacy-f393bbca28.jpg)

**另外,对于full的阵列（例如已经有2个磁盘的RAID1）,则直接使用-add参数,mdadm会自动把冗余的磁盘作为spare disk.**

**2、删除阵列**

mdadm -S /dev/md0

或

rm /dev/md0

修改/etc/mdadm.conf、/etc/fstab等配置文件,把相关的地方去掉；

最后,用fdisk对磁盘进行重新分区即可.

3、重建阵列

我们也可以在没有fdisk的情况下把使用过,但目前没有属于任何阵列的磁盘划分到新阵列中：

![](/images/legacy/legacy-50e9b3c9c5.jpg)

确认后即可.

_六、附录_

_[mdadm中文man文档](http://www.linuxfly.org/upload/mdadm%27s%20chs%20manual-1150268632.txt)_

_参考资料：_

_[mdadm: A New Tool For Linux Software RAID Management](http://www.linuxdevcenter.com/pub/a/linux/2002/12/05/RAID.html)_

1.启用阵列 #mdadm -As /dev/md0 -A 启用已存在的阵列 -s 以/etc/mdadm.conf为依据 没有创建mdadm.conf文件,则采用如下方法启用

#mdadm -A /dev/md0 /dev/sd\[bc\]1

2.停止阵列 #mdadm -S /dev/md0

3.显示阵列详细信息 #mdadm -D /dev/md0

删除RAID中的硬盘

mdadm –stop /dev/md0

mdadm –remove /dev/md0

mdadm –zero-superblock /dev/sda

[Linux](http://www.php-oa.com/tag/linux), [mdadm](http://www.php-oa.com/tag/mdadm), [RAID](http://www.php-oa.com/tag/raid)

### 分类目录

- [Perl](http://www.php-oa.com/category/perl) (169)

- [Perl 6](http://www.php-oa.com/category/perl/perl6) (12)

- [Perl Dancer](http://www.php-oa.com/category/perl/dancer-perl) (6)

- [Perl Moose](http://www.php-oa.com/category/perl/moose) (22)

- [Perl PSGI](http://www.php-oa.com/category/perl/psgi-perl) (26)

- [Perl](http://www.php-oa.com/category/perl/perl-talks) [](http://www.php-oa.com/category/perl/perl-talks)[交流](http://www.php-oa.com/category/perl/perl-talks) (18)

- [Perl](http://www.php-oa.com/category/perl/perl-app) [](http://www.php-oa.com/category/perl/perl-app)[应用](http://www.php-oa.com/category/perl/perl-app) (54)

- [Perl](http://www.php-oa.com/category/perl/perl-module) [](http://www.php-oa.com/category/perl/perl-module)[模块](http://www.php-oa.com/category/perl/perl-module) (34)

- [技术](http://www.php-oa.com/category/tech) (566)

- [CDN](http://www.php-oa.com/category/tech/cdn%e6%8a%80%e6%9c%af)[技术](http://www.php-oa.com/category/tech/cdn%e6%8a%80%e6%9c%af) (68)

- [Linux](http://www.php-oa.com/category/tech/linux%e6%8a%80%e6%9c%af)[技术](http://www.php-oa.com/category/tech/linux%e6%8a%80%e6%9c%af) (1)

- [归档日志](http://www.php-oa.com/category/tech/%e5%bd%92%e6%a1%a3%e6%97%a5%e5%bf%97) (33)

- [技术随笔](http://www.php-oa.com/category/tech/%e6%8a%80%e6%9c%af%e9%9a%8f%e7%ac%94) (11)

- [视频](http://www.php-oa.com/category/tech/%e6%8a%80%e6%9c%af%e9%9a%8f%e7%ac%94/%e8%a7%86%e9%a2%91) (11)

[日志处理](http://www.php-oa.com/category/tech/log-processing) (8)

- [版本管理](http://www.php-oa.com/category/tech/version-manage) (7)

- [软件工具](http://www.php-oa.com/category/tech/%e8%bd%af%e4%bb%b6%e5%b7%a5%e5%85%b7) (16)

- [生活](http://www.php-oa.com/category/%e7%94%9f%e6%b4%bb) (81)

- [修行成长](http://www.php-oa.com/category/%e7%94%9f%e6%b4%bb/%e4%bf%ae%e8%a1%8c%e6%88%90%e9%95%bf) (16)

- [兴趣娱乐](http://www.php-oa.com/category/%e7%94%9f%e6%b4%bb/%e5%85%b4%e8%b6%a3%e5%a8%b1%e4%b9%90) (12)

- [英文学习](http://www.php-oa.com/category/%e7%94%9f%e6%b4%bb/%e8%8b%b1%e6%96%87%e5%ad%a6%e4%b9%a0) (7)

- [项目管理](http://www.php-oa.com/category/%e9%a1%b9%e7%9b%ae%e7%ae%a1%e7%90%86) (1)

- [默认](http://www.php-oa.com/category/uncategorized) (94)

### 近期评论

- kindofu发表在《[使用进程锁来控制](http://www.php-oa.com/2009/02/25/flock.html#comment-29545)[linux](http://www.php-oa.com/2009/02/25/flock.html#comment-29545)[中的](http://www.php-oa.com/2009/02/25/flock.html#comment-29545)[crontab](http://www.php-oa.com/2009/02/25/flock.html#comment-29545)[执行的并发](http://www.php-oa.com/2009/02/25/flock.html#comment-29545)》

- zealrains发表在《[微软视频格式的研究](http://www.php-oa.com/2008/12/27/wmv.html#comment-29534)》

- james发表在《[我在](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29496) [](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29496)[2013](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29496) [](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29496)[年](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29496) [](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29496)[Perl](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29496) [](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29496)[大会主题的](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29496) [](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29496)[PPT](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29496)》

- batman发表在《[使用](http://www.php-oa.com/2013/11/05/writing-non-blocking-applications-with-mojolicious-part-1.html#comment-29495) [](http://www.php-oa.com/2013/11/05/writing-non-blocking-applications-with-mojolicious-part-1.html#comment-29495)[Mojolicious](http://www.php-oa.com/2013/11/05/writing-non-blocking-applications-with-mojolicious-part-1.html#comment-29495) [](http://www.php-oa.com/2013/11/05/writing-non-blocking-applications-with-mojolicious-part-1.html#comment-29495)[写非阻塞的应用](http://www.php-oa.com/2013/11/05/writing-non-blocking-applications-with-mojolicious-part-1.html#comment-29495)[: Part 1](http://www.php-oa.com/2013/11/05/writing-non-blocking-applications-with-mojolicious-part-1.html#comment-29495)》

- [简单](http://www.candou.com/)发表在《[HTML::TreeBuilder::XPath](http://www.php-oa.com/2009/09/24/perl-html-tree-builder-xpath.html#comment-29482) [](http://www.php-oa.com/2009/09/24/perl-html-tree-builder-xpath.html#comment-29482)[来解析网页内容](http://www.php-oa.com/2009/09/24/perl-html-tree-builder-xpath.html#comment-29482)》

- [www.server110.com](http://www.server110.com/)发表在《[Xbox One](http://www.php-oa.com/2014/02/04/xbox-one.html#comment-29471)》

- 云舒发表在《[我在](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29467) [](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29467)[2013](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29467) [](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29467)[年](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29467) [](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29467)[Perl](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29467) [](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29467)[大会主题的](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29467) [](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29467)[PPT](http://www.php-oa.com/2013/08/29/%e6%88%91%e5%9c%a8-2013-%e5%b9%b4-perl-%e5%a4%a7%e4%bc%9a%e4%b8%bb%e9%a2%98%e7%9a%84-ppt.html#comment-29467)》

- opsdddd发表在《[怎么让源当掉后](http://www.php-oa.com/2009/02/24/offline_mod.html#comment-29444)[squid](http://www.php-oa.com/2009/02/24/offline_mod.html#comment-29444)[还能提供内容给用户](http://www.php-oa.com/2009/02/24/offline_mod.html#comment-29444)》

### Perl

- [fayland](http://www.fayland.org/)

- [laird-sa](http://www.laird-sa.com/)

- [mooser.me](http://mooser.me/)

- [走走](http://www.iiiday.com/)[.](http://www.iiiday.com/)[停停](http://www.iiiday.com/)

- [陈钢](http://blog.yikuyiku.com/)[\-](http://blog.yikuyiku.com/)[新浪](http://blog.yikuyiku.com/)

### 技术

- [DBA Blog](http://www.dbasky.net/)

- [NMM](http://www.nmm-hd.org/)[视频技术论坛](http://www.nmm-hd.org/)

- [三斗室](http://chenlinux.com/)

- [余洪春](http://andrewyu.blog.51cto.com/)[(](http://andrewyu.blog.51cto.com/)[抚琴煮酒](http://andrewyu.blog.51cto.com/)[)](http://andrewyu.blog.51cto.com/)

- [鬼仔](http://huaidan.org/)['s Blog](http://huaidan.org/)

### 链接

- [LSA Notes](http://www.lsanotes.cn/)

- [MRuu Blog](http://blog.mruu.cn/)

- [wxd5981](http://blog.wxd5981.com/)

- [《](http://www.ourlinux.net/)[Ourlinux>](http://www.ourlinux.net/)[》杂志](http://www.ourlinux.net/)

- [张宴](http://blog.s135.com/)[\-](http://blog.s135.com/)[金山](http://blog.s135.com/)

Copyright © 2007-2014 扶凯. Powered by [WordPress](http://www.wordpress.org/). Theme by [大鹏](http://dapeng.me/).

[站长统计](http://www.cnzz.com/stat/website.php?web_id=3207370)
