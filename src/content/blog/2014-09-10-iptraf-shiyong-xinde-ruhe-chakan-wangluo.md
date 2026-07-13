---
title: iptraf使用心得——如何查看网络流量
date: '2014-09-10'
description: "iptraf是网络流量监控工具，可通过IP traffic monitor、General interface statistics等功能查看实时网络流量分布。需要配置Reverse DNS lookups和TCP/UDP service names等选项以获得直观结果。"
category: linux
tags:
  - 监控告警
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---

前几天找到的iptraf真的让我爱不释手，今天抽空仔细把功能过了一遍，并且和三层交换机上统计的数据进行比较，基本弄清楚了数据含义和使用场景。这里分享一下我跟人觉得比较有用的内容，希望对大家能有帮助。

 1. Configure

这个非常重要，进行适当的配置可以让统计的结果更直观，信息更丰富。

1）Reverse DNS lookups：查看连接的ip所对应的域名，在IP traffic monitor的pkt captured对话框中就可以看到域名结果，这个不是很直观，开启后会有点点影响抓包性能。

2）TCP/UDP service names：在有端口的地方都会把端口号换成相应的服务名，非常有用，很直观。

3）Activity mode：显示流量是按Kbits/s还是Kbytes/s，建议改成后面的更符合习惯。

4）Additional ports：按端口号监控所额外需要监控的端口，默认只监控小于1024的。

 2. Filters：这个默认就行了，除非你有特殊需要。

 3. IP traffic monitor：根据连接查看网络流量，这个最好让他跑一段时间看统计总量的结构，如果单个连接占用大量带宽，就很容易看出来。同时根据IP还可以很容易分辨是和内网还是外网服务器进行交互。pkt captured可以看到mac地址。

 4. General interface statistics：查看每个网卡上的流量，注意一下，这个是网卡流量，包括内网和外网，单机是无法分辨内外网。

 5. Detailed interface statistics：根据协议进行统计，就只有IP, TCP, UDP等几个，感觉用处不大。

 6. Statistical breakdowns中的By TCP/UDP port：根据应用协议进行统计，比上面那个更实用。

 7. LAN station monitor：根据mac地址统计，但是感觉貌似不对劲，找不到我自己主机的mac，这个确实没搞懂。

总的来说，用好这个工具就能很好的分析网络了，确实是一大利器啊！
