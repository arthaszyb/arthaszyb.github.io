---
title: 路由修改 route
date: '2018-08-23'
description: "Linux 网络路由配置，使用 route 命令查看和修改路由表。"
category: linux
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---

2007-12-05 09:47 鸟哥 机械工业出版社华章公司 字号：T | T

综合评级：

[想读(47)](http://home.51cto.com/apps/book/index.php?s=/Index/book/bid/231/status/0) [在读(15)](http://home.51cto.com/apps/book/index.php?s=/Index/book/bid/231/status/1) [已读(11)](http://home.51cto.com/apps/book/index.php?s=/Index/book/bid/231/status/2) [品书斋鉴(1)](http://home.51cto.com/apps/book/index.php?s=/Index/book/bid/231/good/1) [已有73](http://home.51cto.com/apps/book/index.php?s=/Index/book/bid/231)[人发表书评](http://home.51cto.com/apps/book/index.php?s=/Index/book/bid/231)

![](/images/legacy/legacy-ee93cea367.gif)

《鸟哥的Linux私房菜——服务器架设篇》（第二版）第五章的主要介绍一些常见的网络命令，并新增了一些数据包捕获的命令。本文主要介绍的是路由修改route。

AD：[51CTO 网+ 第十二期沙龙：大话数据之美\_如何用数据驱动用户体验](http://mobile.51cto.com/mobile/mdsa12/)

**5.1.2 路由修改route**

我们在网络基础的时候谈过关于路由的问题，两台主机之间一定要有路由才能够互通TCP/IP的协议，否则就无法进行联机。一般来说，只要有网络接口，该接口就会产生一个路由，例如，在鸟哥实验室内部的主机有一个eth0及lo，所以：

<table><tbody><tr><td><div><span style="font-family: "Courier New", monospace;"><span>[root@linux ~]# route [-nee]</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>[root@linux ~]# route add [-net|-host] [网段或主机] netmask [mask] [gw|dev]</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>[root@linux ~]# route del [-net|-host] [网段或主机] netmask [mask] [gw|dev]</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>观察的参数：</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>-n，不要使用通信协议或主机名称，直接使用 IP 或 Port Number；</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>-ee，使用更详细的信息来显示；</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>增加 (add) 与删除 (del) 路由的相关参数；</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>-net，表示后面接的路由为一个网段；</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>-host，表示后面接的为连接到单台主机的路由；</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>Netmask，与网段有关，可以设置 netmask 决定网段的大小；</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>Gw，gateway 的简写，后续接的是 IP 的数值，与 dev 不同；</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>Dev，如果只是要指定由哪一块网卡联机出去，则使用这个设置，后面接 eth0 等。</span></span></div><div><br></div><div><span style="font-family: "Courier New", monospace;"><span>范例一：单纯的观察路由状态</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>[root@linux ~]# route -n</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>Kernel IP routing table</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>Destination Gateway Genmask Flags Metric Ref Use Iface</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>192.168.10.0 0.0.0.0 255.255.255.0 U 0 0 0 eth0</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>169.254.0.0 0.0.0.0 255.255.0.0 U 0 0 0 eth0</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>0.0.0.0 192.168.10.30 0.0.0.0 UG 0 0 0 eth0</span></span></div><div><br></div><div><span style="font-family: "Courier New", monospace;"><span>[root@linux ~]# route</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>Kernel IP routing table</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>Destination Gateway Genmask Flags Metric Ref Use Iface</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>192.168.10.0 * 255.255.255.0 U 0 0 0 eth0</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>169.254.0.0 * 255.255.0.0 U 0 0 0 eth0</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>default Server.cluster 0.0.0.0 UG 0 0 0 eth0</span></span></div></td></tr></tbody></table>

在上面的例子中仔细观察route与route -n的输出结果，你可以发现有加-n参数的主要是显示出IP，至于使用route，显示的则是“主机名称”。也就是说，在默认的情况下，route会去找出该IP的主机名称，如果找不到呢？就会显示得迟钝（有点慢），所以说，鸟哥通常都直接使用route-n了。由上面看起来，我们也知道default = 0.0.0.0/0.0.0.0，而上面的信息有哪些你需要知道的呢？

· Destination、Genmask：这两个术语就分别是Network与Netmask了。所以这两个东西就组合成为一个完整的网段了。

· Gateway：该网段是通过哪个Gateway连接出去的？如果显示0.0.0.0表示该路由是直接由本机传送，亦即可以通过局域网的MAC直接传输；如果有显示IP的话，表示该路由需要经过路由器（网关）的帮忙才能够传送出去。

· Flags：总共有多个标记，代表的意义如下。

Ø U（route is up）：该路由是启动的。

Ø H（target is a host）：目标是一台主机（IP）而非网段。

Ø G（use gateway）：需要通过外部的主机来传递数据包。

Ø R（reinstate route for dynamic routing）：使用动态路由时，恢复路由信息的标记。

Ø D（dynamically installed by daemon or redirect）：已经由服务器或转port功能设置为动态路由。

Ø M（modified from routing daemon or redirect）：路由已经被修改了。

Ø!（reject route）：这个路由将不会被接受（用来阻止不安全的网段）。

· Iface：这个路由传递数据包的接口。

此外，观察一下上面的路由排列顺序，依序是由小网段（192.168.10.0/24是Class C），逐渐到大网段（169.254.0.0/16 是Class B），最后则是默认路由（0.0.0.0/0.0.0.0）。然后当我们要判断某个网络数据包应该如何传送的时候，该数据包会经由这个路由的过程来判断。例如，我上头仅有三个路由，若我有一个传往192.168.10.20的数据包要传递，那首先会找192.168.10.0/24这个网段的路由，找到了，就直接由eth0传送出去。

如果是传送到Yahoo的主机呢？Yahoo的主机IP是202.43.195.52，我通过判断不是192.168.10.0/24，也不是169.254.0.0/16，结果到达0/0时，传出去了，通过eth0将数据包传给192.168.10.30那台Gateway主机。所以说，路由是有顺序的。

因此当你重复设置多个同样的路由时，例如，在你的主机上的两张网卡设置为相同网段的IP时，会出现什么情况？会出现如下的情况：

<table><tbody><tr><td><div><span style="font-family: "Courier New", monospace;"><span>Kernel IP routing table</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>Destination Gateway Genmask Flags Metric Ref Use Iface</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>192.168.10.0 0.0.0.0 255.255.255.0 U 0 0 0 eth0</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>192.168.10.0 0.0.0.0 255.255.255.0 U 0 0 0 eth1</span></span></div></td></tr></tbody></table>

也就是说，由于路由是依照顺序来排列与传送的，所以不论数据包是由哪个接口（eth0、eth1）所接收，都会由上述的eth0传送出去，所以，在一台主机上面设置两个相同网段的IP本身没有什么意义。多此一举。除非是类似虚拟主机（Xen、VMware等软件）所架设的多主机，才会有这个必要。

<table><tbody><tr><td><div><span style="font-family: "Courier New", monospace;"><span>范例二：路由的增加与删除</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>[root@linux ~]# route del -net 169.254.0.0 netmask 255.255.0.0 dev eth0</span></span></div><div><span style="font-family: "Courier New", monospace;"><span># 上面这个操作可以删除掉 169.254.0.0/16 这个网段</span></span></div><div><span style="font-family: "Courier New", monospace;"><span># 请注意，在删除的时候，需要将路由表上面出现的信息都写入</span></span></div><div><span style="font-family: "Courier New", monospace;"><span># 包括netmask、dev 等参数</span></span></div><div><br></div><div><span style="font-family: "Courier New", monospace;"><span>[root@linux ~]# route add -net 192.168.100.0 \</span></span></div><div><span style="font-family: "Courier New", monospace;"><span>> netmask 255.255.255.0 dev eth0</span></span></div><div><span style="font-family: "Courier New", monospace;"><span># 通过 route add 来增加一个路由。请注意，这个路由必须能够与你互通</span></span></div><div><span style="font-family: "Courier New", monospace;"><span># 例如，如果我下达下面的命令就会显示错误：</span></span></div><div><span style="font-family: "Courier New", monospace;"><span># route add -net 192.168.200.0 netmask 255.255.255.0 gw 192.168.200.254</span></span></div><div><span style="font-family: "Courier New", monospace;"><span># 因为我的环境内仅有 192.168.10.100 这个 IP ，所以不能与 192.168.200.254</span></span></div><div><span style="font-family: "Courier New", monospace;"><span># 这个网段直接使用 MAC 互通</span></span></div><div><br></div><div><span style="font-family: "Courier New", monospace;"><span>[root@linux ~]# route add default gw 192.168.10.30</span></span></div><div><span style="font-family: "Courier New", monospace;"><span># 增加默认路由的方法。请注意，只要有一个默认路由就够了</span></span></div><div><span style="font-family: "Courier New", monospace;"><span># 在这个地方如果你随便设置后，记得使用下面的命令重新设置你的网络</span></span></div><div><span style="font-family: "Courier New", monospace;"><span># /etc/init.d/network restart</span></span></div></td></tr></tbody></table>

如果是要进行路由的删除与增加，那就可以参考上面的例子了，其实，使用man route里面的信息就很丰富了。仔细查阅一下。你只要记得，当出现“SIOCADDRT: Network is unreachable”这个错误时，肯定是由于gw后面接的IP无法直接与你的网段沟通（Gateway并不在你的网段内），所以，赶紧检查一下输入的信息是否正确。
