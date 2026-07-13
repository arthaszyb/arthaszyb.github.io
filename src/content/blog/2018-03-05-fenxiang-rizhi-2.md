---
title: 分享日志
date: '2018-03-05'
description: >-
  Windows 7 虚拟 WiFi 配置方法（重复内容）。
category: misc
tags:
  - 网络排查
draft: true
source: evernote-local-db
lang: zh
---
2018年3月5日

10:26

- [分享日志](http://blog.renren.com/)

- [热门日志](http://blog.renren.com/category/hot/1)

- 将win7电脑变身WiFi热点

分享

# 将win7电脑变身WiFi热点
### 来源： 苏靖翔的日志

开启windows 7的隐藏功能：虚拟WiFi和SoftAP（即虚拟无线AP），就可以让电脑变成无线路由器，实现共享上网，节省网费和路由器购买费。iphone4亲测通过,比conncetify方便，稳定，网速好！

以操作系统为win7的笔记本或装有无线网卡的台式机作为主机。

主机设置如下：

**1、以管理员身份运行命令提示符：**

**“开始”---在搜索栏输入“cmd”----右键以“管理员身份运行”**

![](/images/legacy/legacy-494b72fe15.jpg)

**2启用并设定虚拟WiFi网卡：**

运行命令：netsh wlan set hostednetwork mode=allow ssid=wuminPC key=wuminWiFi

(注意：上边命令"ssid"后红字为网络名称，自己随便命名，比如wuminPC可改为MyWiFi等等，自己喜欢怎么命名都行

"Key"后边红字为密码，自己随便命名，比如wuminWiFi 可以改为12345678，总之自己命名就可以了，不一定非得这个网络名称，这个密码，密码8位以上最好）

此命令有三个参数，mode：是否启用虚拟WiFi网卡，改为disallow则为禁用。

ssid：无线网名称，最好用英文(以wuminPC为例)，即要设定的wifi名称。

key：无线网密码，八个以上字符(以wuminWiFi为例），即你要设定的wifi密码。

以上三个参数可以单独使用，例如只使用mode=disallow可以直接禁用虚拟Wifi网卡。

相信以前用过DOS的人都知道怎么运行命令了，那就是输入按回车**netsh wlan set hostednetwork mode=allow ssid=wuminPC key=wuminWiFi**

运行之后看到以下内容：

![](/images/legacy/legacy-944ab960cf.jpg)

然后再打开“网络和共享中心”--“更改适配器设置”看看是不是多了一项，若果有多出的这一项“Microsoft Virtual WiFi Miniport Adapter”，那么说明你前边的设置是真确的。

![](/images/legacy/legacy-6797259638.png)

开启成功，网络连接中会多出一个网卡为“Microsoft Virtual WiFi Miniport Adapter”的无线。

为方便起见，将其重命名为虚拟WiFi。若没有，只需更新无线网卡驱动就OK了。

**3、设置Internet连接共享：**

在“网络连接”窗口中，右键单击已连接到Internet的网络连接，选择“属性”→“共享”，勾上“允许其他······连接(N)”并选择“虚拟WiFi”。

![](/images/legacy/legacy-cd4143f841.jpg)

确定之后，提供共享的网卡图标旁会出现“共享的”字样，表示“宽带连接&rd
