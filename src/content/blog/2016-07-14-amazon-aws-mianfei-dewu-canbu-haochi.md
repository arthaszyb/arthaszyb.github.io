---
title: Amazon AWS —— 免费的午餐不好吃
date: '2016-07-14'
description: >-
  免费资源那么多，为何只用 EC2？  EBS 好东西，天价 I/O 是问题 S3真高端，静态资源往里搬 RDS也帮忙，I/O 不再飞快涨
  免费服务很多，其他不再多说 众技术宅所周知，Amazon AWS 之前提供了“新用户凭有效信用卡免费试用一年”的活动，至今没有给出截止日期。
category: linux
tags:
  - mysql
  - redis
  - memcached
  - dns
  - php
draft: false
source: evernote-local-db
lang: zh
---
- [免费资源那么多，为何只用 EC2？](http://bropaul.com/post/amazon-aws-in-practice#toc_0)

- [EBS 好东西，天价 I/O 是问题](http://bropaul.com/post/amazon-aws-in-practice#toc_1)

- [S3真高端，静态资源往里搬](http://bropaul.com/post/amazon-aws-in-practice#toc_2)

- [RDS也帮忙，I/O 不再飞快涨](http://bropaul.com/post/amazon-aws-in-practice#toc_3)

- [免费服务很多，其他不再多说](http://bropaul.com/post/amazon-aws-in-practice#toc_4)

众技术宅所周知，Amazon AWS 之前提供了“新用户凭有效信用卡免费试用一年”的活动，至今没有给出截止日期。虽说免费的午餐很诱人，而且由于信用卡的门槛，也避免了一部分的滥用，但是要安心吃好这顿饭，没有第一个吃螃蟹的人提供一点经验，多多少少心里还是会没底的。那么，在消失了这么多天鼓捣本站彩蛋至今终于算是基本完成于是我又可以继续写博客之后（这半句可以简单理解为：我终于滚回来了），打算和大家分享一下这段时间使用 AWS 的一些经验，希望有所帮助。

预警：本文不适合**纯小白**（比如不知道啥是 AWS 的人），请确保至少是和博主一样的小白级别

AWS 和传统的 VPS 不太一样（这不是废话么(╯‵□′)╯︵┻━┻），因为把它当普通 VPS 一样直接在 EC2 上安装 WDCP 之类的管理后台，然后建站什么的就很容易超出免费套餐额度，从而被扣费。So, 请允许我先祭出免费使用 AWS 的终极奥义：[官方优惠信息介绍](http://aws.amazon.com/cn/free/) 。所有的免费额度请务必以该页面的说明为准，其他地方的信息很可能已经过时。

于是我要做的就是稍稍给大家解读一下了。接下来进入正题：

## 免费资源那么多，为何只用 EC2？

很多人可能只是把 AWS 当做免费一年的 VPS 使用，但是这往往只利用到了 AWS 中的 EC2。要知道 AWS 可是包含了 EC2, S3, RDS, CloudFront 等32种服务在内的豪华套餐啊，只用到其中的 EC2 岂不是太不符合社会主义节约型社会的建设了？

![](/images/legacy/legacy-83c6a82ca3.png)

有人可能会说，我的网站没什么访问量，有一个 VPS 够用。少年你图样图森破了好么！当初我也是这样想的，可是头一个月就收了我0.45刀，折合人民币2.754元啊，说好的免费一年呢？！来来来，看看官方怎么说的：

AWS 免费套餐包括为期一年每月 750 小时 Linux 和 Windows 微型实例的试用时间。

注意，是“和”，也就是说你可以同时运行一个 Linux 微型实例和一个 Windows 微型实例，各免费750小时。而且一个月最多也就24×31=744h，时间是肯定不用担心了。但是别高兴得太早。要用免费的你必须用微型实例，而微型实例只能使用以 EBS 作为存储的系统镜像；再看一下 EBS 的免费额度，区区30GB——鉴于所有 Windows 镜像要求最小存储容量为30GB，要同时再运行一个 Linux 实例就得为 EBS 埋单了。所以归根到底，Amazon只允许你**同时**运行一个微型实例。如果你想先用一会 Linux，再换 Windows 玩玩，这样也是可以的，只要保证运行新的实例之前已经彻底关闭(Terminate)旧的实例。所以别误会我大亚马逊是腾讯这一类小气货色，更何况 EC2 只是 AWS 免费套餐的（三十六分之）一部分，其他免费资源用起来啊！

## EBS 好东西，天价 I/O 是问题

其实我那0.45刀的费用就出自 EBS 的 I/O 上。根据官方信息，AWS 免费套餐包括

30 GB 的 Amazon Elastic Block Storage (EBS)，加上 2 百万个 I/O 和 1 GB 的快照存储

快照存储我还没研究，反正像我这种小站是够用的。30GB的 EBS 其实也够用，关键就在于 I/O 上。 I/O 简单说就是“磁盘读写操作”，不论读还是写都算数，而且读写的东西太大的话，还会分作几个小的区块来读写。像我之前只用 EC2，把它当 VPS， 静态文件、数据库什么的都在上面读写，I/O 一下就上去了。要知道，超过 200万 以后就按 0.12刀/ 100万I/O （不同数据中心的价格不一样）的价格给你算账了！我一个月居然超了约 375万 I/O ，最后收取 0.45刀的费用 (┬＿┬) 加上免费的200万，我一个月就 575万 I/O 啊，这数据你能忍？

路人甲：废话怎么这么多，到底怎么降低 I/O 你大爷的倒是说啊！

这位客官莫急！据说方法之一就是使用缓存技术，不过我昨天鼓捣了一天还是不知道怎么弄… 呃，前面这句话你们就当没看到吧= = 提示：AWS 支持 Memcached 和 Redis 缓存引擎，而 AWS 免费套餐包括：

750 小时的 Amazon ElastiCache 服务时间，足够整月持续运行微缓存节点。

所以还没用上这个服务的赶紧去开启吧，不要钱~~ 不过记得要和 EC2 一样使用“微型”实例，不然扣费！

## S3真高端，静态资源往里搬

降低 I/O 方法二，减少静态资源的读写。方法很简单啦，尽可能多地把静态资源放别处去。比如你有 BAE 开发者帐号，那就存点东西在 BCS 里；你有[七牛帐号](https://portal.qiniu.com/signup?code=2ar98c1y45k5t)，就把 (WordPress 的)图片、附件什么的同步到那边去；你买了又拍云，闲置在那做摆设不成？你要是啥都没有，也可以想办法把 (WordPress) 要用到的一些 js 文件（比如 jQuery）、css 文件（比如 Bootstrap）替换成 CDN 公共库的，比如[度娘的](http://cdn.code.baidu.com/)，[数字的](http://libs.useso.com/js.php)，以及[谷歌的](http://developers.google.com/speed/libraries/devguide)，能省一点是一点，对吧？当然别忘了，AWS 免费套餐包括

5 GB 的 Amazon S3 标准存储，20 000 个获取请求以及 2 000 放入请求。

所以有什么较大的附件就可以放在 S3 里面，因为容量大，却又限制获取次数，而对流量则没有限制。只放几张图片岂不亏大了？但是这又涉及到另一个问题了，注意防盗链，不然就可能像某位老外一样，一个月10000刀的账单寄到家了。

其实 S3 对存储内容的控制功能十分强大，比国内一些同类产品（比如 BCS）强大得多，你甚至可以把一个静态网站直接托管到 S3 上面。建议自己去体验一下，我就不多说了~

## RDS也帮忙，I/O 不再飞快涨

降低 I/O 方法三，“取消”数据库读写。既然是动态站，没有数据库读写是不可能的。只是，你的数据库完全不该像我一样放在 EC2 上，而应该放在 RDS 上。看看AWS免费套餐包括什么：

1. 750 小时的 Amazon RDS 单一可用区域微型数据库实例使用时间，此类型数据库上运行 MySQL、Oracle BYOL 或 SQL Server（运行 SQL Server Express Edition），这足够整月持续运行数据库实例

2. 20 GB 数据库存储

3. 1 000 万 I/O

4. 20 GB 备份存储，用于数据库自动备份和用户发起的数据库快照

懂了吧？或许一开始我用 WDCP 直接生成站点就是个错误，因为数据库是放在 EC2 上的，而这将消耗不少的 I/O 。可是 RDS 有1000万 I/O 啊，这还不够用？唯一需要你注意的就是加了颜色的字了，请务必遵守这些限制，不然就会和我一样杯具，运行一个实例，仅仅一天就被收1.4 刀，真是欲哭无泪了QAQ

![](/images/legacy/legacy-3df2c21dcb.png)

看到高亮区域了么？看不清就点一下图片看原图，一定要记住这些雷区啊！这是我用绳命实践出来的宝贵经验，请各位同志务必珍惜。不过也大可不必被我吓到，毕竟我是摸着石头过河，辛酸史是必须有的。如果你看了上图还是不知道该怎么办，请看下图，关于启用数据库实例（Step 3）时的注意事项：

![](/images/legacy/legacy-83b62ceba4.png)

1. 一定要选择 db.t1.micro ，默认给你选的是 large ，那个贼费钱！

2. 一定要选择 No，默认给你选的是 Yes，于是就有了我账单上的 Multi-AZ 字样... 选 No 以后可以无视右边的黄色感叹号。要高可用性还是要免费，自己掂量→\_→

3. 数据库容量。建议填一个不超过 AWS免费套餐中 “20 GB 数据库存储” 的数字，其实5GB就够用了吧...

4. 识别名。只要能让你自己搞清楚这是个什么数据库就行，随便填。不是数据库名！

5. 数据库用户名。2-16个字符

6. 数据库用户密码，至少8个字符

填好进入第四步然后填一下数据库名，其他默认就差不多了，一路点“下一步”吧。最后等个5分钟左右，等 Status 那一栏变成绿色的Available以后，就可以点击一下看到你的 Endpoint 了。那个就是你的数据库主机地址。如果是新安装 WordPress 什么的，主机地址不是填 localhost，而是填这里的这个地址哦~ 可以不加:3306端口号。

至于怎么管理，由于没有提供 phpmyadmin 这样的图形界面，不妨使用 Navicat 这款软件，应该很简单，多多探索吧~ 使用这个软件的时候，主机地址就要填一开始的 Endpoint 了，而不是 Private DNS。

## 免费服务很多，其他不再多说

至此，我只希望从今天起，我的 I/O 可以降下来→\_→

而你，勇敢的少年，如果对于 AWS 的其他免费服务还有兴趣，不妨自己实践探索。毕竟是按小时计费，随便玩玩也不会扣很多钱的，只要你记得彻底关闭(Terminate)不再使用的实例。

**2014年3月4日更新：**

贴一下我现在使用的实例的参数吧，其实我自己也只用到 AWS 中的 EC2 和 RDS 而已，连 S3 都没用上...

<table><tbody><tr><td><div><b><span><span>EC2 控制面板条目</span></span></b></div></td><td><div><b><span><span>数据</span></span></b></div></td></tr><tr><td><div><span><span>EC2 Region（地区）</span></span></div></td><td><div><span><span>Asia Pacific (Singapore)</span></span></div></td></tr><tr><td><div><span><span>EC2 Instance Type（实例类型）</span></span></div></td><td><div><span><span>t1.micro</span></span></div></td></tr><tr><td><div><span><span>EC2 Availability Zone（数据中心）</span></span></div></td><td><div><span><span>ap-southeast-1b</span></span></div></td></tr><tr><td><div><span><span>EBS Capacity（容量）</span></span></div></td><td><div><span><span>10GiB</span></span></div></td></tr><tr><td><div><span><span>EBS Zone（数据中心）</span></span></div></td><td><div><span><span>ap-southeast-1b</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><b><span><span>RDS 控制面板条目</span></span></b></div></td><td><div><b><span><span>数据</span></span></b></div></td></tr><tr><td><div><span><span>Multi-AZ（多数据中心容灾）</span></span></div></td><td><div><span><span>No</span></span></div></td></tr><tr><td><div><span><span>Class（实例类型）</span></span></div></td><td><div><span><span>db.t1.micro</span></span></div></td></tr><tr><td><div><span><span>Storage（容量）</span></span></div></td><td><div><span><span>20GB</span></span></div></td></tr><tr><td><div><span><span>Engine（数据库类型）</span></span></div></td><td><div><span><span>MySQL</span></span></div></td></tr><tr><td><div><span><span>Zone（数据中心）</span></span></div></td><td><div><span><span>ap-southeast-1b</span></span></div></td></tr></tbody></table>

要切换不同的控制面板，请点击左上角的Services，然后在一大堆列表里找你要的服务。

鉴于留言中有朋友询问最低月费用，感觉我用的已经是最低配置了，如果全部收费的话，Linux 实例按每个月（按31天不间断使用算）2000访客，每个访客平均查看3个页面，每个页面30个请求，数据库、EC2 均不作备份来计算，费用大概要：

- EC2实例：0.02x24x31=14.88

- EBS存储：0.08x10=0.8

- EBS I/O：0.08x2000x3x30/1000000=0.0144

- RDS实例：0.035x24x31=26.04

- RDS存储：0.11x10=1.1

- RDS I/O：0.11x2000x3x30/1000000=0.0198

- 总费用：14.88+0.8+0.0144+26.04+1.1+0.0198=42.8542，单位：美刀

- 结论：略贵

或者你可以试试不用 RDS，全靠 EBS 进行 I/O 操作，然后算算费用是多少，应该可以便宜不少。另外，EBS 和 RDS 存储可以相应降低一些，毕竟像我这样的小网站用不了那么多空间。当然，实在觉得博主实在不靠谱的也可以到[官方计算工具](http://calculator.s3.amazonaws.com/)自行计算~

就这样啦，谢谢围观，欢迎留言。
