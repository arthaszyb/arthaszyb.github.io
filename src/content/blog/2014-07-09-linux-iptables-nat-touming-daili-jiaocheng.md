---
title: Linux iptables NAT 透明代理教程
date: '2014-07-09'
description: >-
  时间: 2011-10-15 / 分类: 经验分享 / 浏览次数: 1,288人 / 0个评论 发表评论
  http://www.yimiju.com/articles/tag/NAT Linux的iptables功能太强大，也相当有深度。 
  不过我只需要用iptables实现“透明代理”功能。
category: linux
tags:
  - iptables
draft: false
source: evernote-local-db
lang: zh
---
## [Linux iptables NAT 透明代理教程](http://www.yimiju.com/articles/508.html)

时间: 2011-10-15 / 分类: [经验分享](http://www.yimiju.com/articles/category/experience) / 浏览次数: 1,288人 / [0个评论](http://www.yimiju.com/articles/508.html#comments) [发表评论](http://www.yimiju.com/articles/508.html#respond)

![](/images/legacy/legacy-ab7e1557a4.png)

[http://www.yimiju.com/articles/tag/NAT](http://www.yimiju.com/articles/tag/NAT)

Linux的iptables功能太强大，也相当有深度。

不过我只需要用iptables实现“透明代理”功能。

应用情景举例：

例如，我想在外网访问内网的某台服务器的某个端口或服务。

那可以现在某台同时具备外网和内网访问条件的接口服务器上部署iptables端口映射，

将外网需要访问的端口转发到内网服务器的端口上。

假设：

1、接口服务器的内网IP是192.168.1.2，外网IP是8.8.8.8；

2、需要访问的内网服务器的端口是1234，IP是192.168.1.3；

那么，我可以通过在接口服务器上使用iptables实现：

1)当我访问8.8.8.8的1234端口时，将数据包转发给192.168.1.3的1234端口上，只需要在接口服务器上执行：

<table><tbody><tr><td><div><span><span>1</span></span></div></td><td><div><span><span>#iptables -t nat -I PREROUTING -p tcp --dport 1234 -j DNAT --to 192.168.1.3:1234</span></span></div></td></tr></tbody></table>

2)如果还想实现“透明代理”，即内网也可以将数据传输至外网，那么再执行：

<table><tbody><tr><td><div><span><span>1</span></span></div></td><td><div><span><span>#iptables -t nat -I POSTROUTING -p tcp --dport 1234 -j MASQUERADE</span></span></div></td></tr></tbody></table>

3)查看当前iptables的nat表情况：

<table><tbody><tr><td><div><span><span>1</span></span></div></td><td><div><span><span>#iptables –t nat –L</span></span></div></td></tr></tbody></table>

4)删除当前iptables nat表的设置：

<table><tbody><tr><td><div><span><span>1</span></span></div></td><td><div><span><span>#iptables –t nat –F</span></span></div></td></tr></tbody></table>

5)开启Linux的路由功能：

将这条命令查到刚刚配置的iptables命令后面即可,运行命令如下：

<table><tbody><tr><td><div><span><span>1</span></span></div></td><td><div><span><span>#echo 1 > /proc/sys/net/ipv4/ip_forward</span></span></div></td></tr></tbody></table>

6)由于iptables的设置在服务器重启后就无效了，所以直接将配置写进/etc/rc.local以便每次启动都恢复我们所需的设置。

例如，一个实践可用的rc.local内容如下：

<table><tbody><tr><td><div><span><span>1</span></span></div></td><td><div><span><span>#!/bin/sh</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>2</span></span></div></td><td><div><span><span>#</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>3</span></span></div></td><td><div><span><span># rc.local</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>4</span></span></div></td><td><div><span><span>#</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>5</span></span></div></td><td><div><span><span># This script is executed at the end of each multiuser runlevel.</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>6</span></span></div></td><td><div><span><span># Make sure that the script will "exit 0" on success or any other</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>7</span></span></div></td><td><div><span><span># value on error.</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>8</span></span></div></td><td><div><span><span>#</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>9</span></span></div></td><td><div><span><span># In order to enable or disable this script just change the execution</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>10</span></span></div></td><td><div><span><span># bits.</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>11</span></span></div></td><td><div><span><span>#</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>12</span></span></div></td><td><div><span><span># By default this script does nothing.</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>13</span></span></div></td><td><div><span><span>iptables -t nat -I PREROUTING -p tcp --dport 1234 -j DNAT --to 192.168.1.3:1234</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>14</span></span></div></td><td><div><span><span>iptables -t nat -I POSTROUTING -p tcp --dport 1234 -j MASQUERADE</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>15</span></span></div></td><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>16</span></span></div></td><td><div><span><span>iptables -t nat -I PREROUTING -p tcp --dport 5678 -j DNAT --to 192.168.1.4:5678</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>17</span></span></div></td><td><div><span><span>iptables -t nat -I POSTROUTING -p tcp --dport 2222 -j MASQUERADE</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>18</span></span></div></td><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>19</span></span></div></td><td><div><span><span>iptables -t nat -I PREROUTING -p tcp --dport 80 -j DNAT --to 192.168.1.5:80</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>20</span></span></div></td><td><div><span><span>iptables -t nat -I POSTROUTING -p tcp --dport 80 -j MASQUERADE</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>21</span></span></div></td><td></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>22</span></span></div></td><td><div><span><span>echo 1 > /proc/sys/net/ipv4/ip_forward</span></span></div></td></tr></tbody></table>

<table><tbody><tr><td><div><span><span>23</span></span></div></td><td><div><span><span>exit 0</span></span></div></td></tr></tbody></table>

7)上面的rc.local代码中，我分别将接口服务器的1234端口转发给192.168.1.3:1234，5678端口转发给192.168.1.4:5678，80端口转发给192.168.1.5:80，这是可行的。
