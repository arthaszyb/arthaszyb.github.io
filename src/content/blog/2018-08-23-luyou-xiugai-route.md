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

> 摘自《鸟哥的 Linux 私房菜——服务器架设篇》（第二版）第五章，介绍常见网络命令中的路由修改 route。

![](/images/legacy/legacy-ee93cea367.gif)

两台主机之间一定要有路由才能够互通 TCP/IP 的协议，否则就无法进行联机。一般来说，只要有网络接口，该接口就会产生一个路由。例如实验室内部的主机有一个 eth0 及 lo，route 命令用法如下：

```text
[root@linux ~]# route [-nee]
[root@linux ~]# route add [-net|-host] [网段或主机] netmask [mask] [gw|dev]
[root@linux ~]# route del [-net|-host] [网段或主机] netmask [mask] [gw|dev]

观察的参数：
-n，不要使用通信协议或主机名称，直接使用 IP 或 Port Number；
-ee，使用更详细的信息来显示；
增加 (add) 与删除 (del) 路由的相关参数：
-net，表示后面接的路由为一个网段；
-host，表示后面接的为连接到单台主机的路由；
Netmask，与网段有关，可以设置 netmask 决定网段的大小；
Gw，gateway 的简写，后续接的是 IP 的数值，与 dev 不同；
Dev，如果只是要指定由哪一块网卡联机出去，则使用这个设置，后面接 eth0 等。

范例一：单纯的观察路由状态
[root@linux ~]# route -n
Kernel IP routing table
Destination   Gateway        Genmask         Flags Metric Ref Use Iface
192.168.10.0  0.0.0.0        255.255.255.0   U     0      0   0   eth0
169.254.0.0   0.0.0.0        255.255.0.0     U     0      0   0   eth0
0.0.0.0       192.168.10.30  0.0.0.0         UG    0      0   0   eth0

[root@linux ~]# route
Kernel IP routing table
Destination   Gateway          Genmask         Flags Metric Ref Use Iface
192.168.10.0  *                255.255.255.0   U     0      0   0   eth0
169.254.0.0   *                255.255.0.0     U     0      0   0   eth0
default       Server.cluster   0.0.0.0         UG    0      0   0   eth0
```

仔细观察 route 与 route -n 的输出结果，加 -n 参数的主要是显示出 IP，至于使用 route，显示的则是「主机名称」。也就是说，默认情况下 route 会去找出该 IP 的主机名称，如果找不到就会显得迟钝（有点慢），所以通常都直接使用 route -n。由上面也知道 default = 0.0.0.0/0.0.0.0。各列含义：

- **Destination、Genmask**：分别是 Network 与 Netmask，两者组合成一个完整的网段。
- **Gateway**：该网段通过哪个 Gateway 连接出去。显示 0.0.0.0 表示该路由直接由本机传送（可通过局域网的 MAC 直接传输）；显示 IP 则表示需要经过路由器（网关）帮忙才能传送出去。
- **Flags**：常见标记含义如下：
  - `U`（route is up）：该路由是启动的。
  - `H`（target is a host）：目标是一台主机（IP）而非网段。
  - `G`（use gateway）：需要通过外部的主机来传递数据包。
  - `R`（reinstate route for dynamic routing）：使用动态路由时，恢复路由信息的标记。
  - `D`（dynamically installed by daemon or redirect）：已由服务器或转 port 功能设置为动态路由。
  - `M`（modified from routing daemon or redirect）：路由已经被修改了。
  - `!`（reject route）：这个路由将不会被接受（用来阻止不安全的网段）。
- **Iface**：这个路由传递数据包的接口。

此外，路由的排列顺序依序是由小网段（192.168.10.0/24 是 Class C），逐渐到大网段（169.254.0.0/16 是 Class B），最后是默认路由（0.0.0.0/0.0.0.0）。判断某个网络数据包如何传送时，会经由这个路由的过程来判断。例如传往 192.168.10.20 的数据包，首先找 192.168.10.0/24 这个网段的路由，找到了就直接由 eth0 传送出去。

如果是传送到 Yahoo 的主机（IP 202.43.195.52），判断不是 192.168.10.0/24 也不是 169.254.0.0/16，到达 0/0 时传出去，通过 eth0 将数据包传给 192.168.10.30 那台 Gateway 主机。所以说，路由是有顺序的。

因此当你重复设置多个同样的路由时（例如在主机的两张网卡设置为相同网段的 IP），会出现如下情况：

```text
Kernel IP routing table
Destination   Gateway   Genmask         Flags Metric Ref Use Iface
192.168.10.0  0.0.0.0   255.255.255.0   U     0      0   0   eth0
192.168.10.0  0.0.0.0   255.255.255.0   U     0      0   0   eth1
```

由于路由依照顺序排列与传送，不论数据包由哪个接口（eth0、eth1）接收，都会由上述的 eth0 传送出去。所以在一台主机上面设置两个相同网段的 IP 本身没有什么意义，多此一举。除非是类似虚拟主机（Xen、VMware 等软件）所架设的多主机，才会有这个必要。

路由的增加与删除：

```text
范例二：路由的增加与删除
[root@linux ~]# route del -net 169.254.0.0 netmask 255.255.0.0 dev eth0
# 上面这个操作可以删除掉 169.254.0.0/16 这个网段
# 请注意，在删除的时候，需要将路由表上面出现的信息都写入
# 包括 netmask、dev 等参数

[root@linux ~]# route add -net 192.168.100.0 \
> netmask 255.255.255.0 dev eth0
# 通过 route add 来增加一个路由。请注意，这个路由必须能够与你互通
# 例如，如果我下达下面的命令就会显示错误：
# route add -net 192.168.200.0 netmask 255.255.255.0 gw 192.168.200.254
# 因为我的环境内仅有 192.168.10.100 这个 IP，所以不能与 192.168.200.254
# 这个网段直接使用 MAC 互通

[root@linux ~]# route add default gw 192.168.10.30
# 增加默认路由的方法。请注意，只要有一个默认路由就够了
# 在这个地方如果你随便设置后，记得使用下面的命令重新设置你的网络
# /etc/init.d/network restart
```

其实使用 `man route` 里面的信息就很丰富，仔细查阅一下即可。你只要记得，当出现「SIOCADDRT: Network is unreachable」这个错误时，肯定是由于 gw 后面接的 IP 无法直接与你的网段沟通（Gateway 并不在你的网段内），所以赶紧检查一下输入的信息是否正确。
