---
title: "使用Google Cloud Platform(GCP GCE)安装SSR+BBR教程"
date: 2017-12-28 10:01:32 +0000
categories: ["科学上网"]
tags: ["新分区 1"]
description: "2017 年 12 月 28 日 18:01 技术 / 2017-05-29 / 34 条评论 文章目录 [隐藏] 一、注册GCP 二、创建实例 三、初步配置 四、配置SS以及BBR 五、效果 六、问题及参考 GCP是原GCE，其优美的界面和丰富的功能深得各类程序员的喜好。近日发现Google Cloud Platfo"
source: "evernote-local-db"
---

2017
年
12
月
28
日
18:01
使用Google Cloud Platform(GCP GCE)安装SSR+BBR教程
技术
/ 2017-05-29 /
34 条评论
文章目录
[隐藏]
一、注册GCP
二、创建实例
三、初步配置
四、配置SS以及BBR
五、效果
六、问题及参考
GCP是原GCE，其优美的界面和丰富的功能深得各类程序员的喜好。近日发现Google Cloud Platform对大陆优化好，并且送300美金（12个月）的礼品卡。特此一试，效果甚好，故收集教程并集合关于Google Cloud Platform(GCP GCE)安装SS+BBR。
一、注册GCP
进入
https://cloud.google.com/free/
，单击
Try it Free
接受条款 – 同意并继续
必须要有一张信用卡，并填入相关信息。

跳转后，如果你能看到页面顶部有一个“礼物
” 的小图标，或者说你收到了相应的邮件，说明试用金已到账。
二、创建实例
在左侧的菜单中找到
计算引擎 – VM 实例
通过
创建实例
或者单击加号来创建一个虚拟机。
名称：随意输入
地区：建议asia-east1-c
机器类型：小型（建议）/微型
启动磁盘单击更改 – Ubuntu 16.04 LTS
防火墙：允许HTTP流量，允许HTTPS流量
三、初步配置
左侧导航 – 计算 – 网络
外部IP地址 – 选择一个ip – 类型调整为静态
防火墙规则 – 创建防火墙规则（未提及的全部默认）：流量方向
入站
、来源ip地址
0.0.0.0/0
、协议和端口
全部允许
防火墙规则 – 创建防火墙规则（未提及的全部默认）：流量方向
出站
、来源ip地址
0.0.0.0/0
、协议和端口
全部允许（注意要创建两次防火墙规则，一次出站，一次入站）
四、配置SS以及BBR
进入实例控制台 – SSH – 在浏览器窗口中打开
获取root权限：

sudo su
安装SS（根据脚本提示来）：

wget -N --no-check-certificate

https://raw.githubusercontent.com/91yun/shadowsocks_install/master/shadowsocksR.sh

&
&
bash shadowsocksR.sh

默认加密为： chacha20

默认协议为： auth_sha1_v4

默认混淆为： tls1.2_ticket_auth
安装BBR加速：

wget --no-check-certificate

https://github.com/teddysun/across/raw/master/bbr.sh

chmod +x bbr.sh

./bbr.sh
重置VM实例：
重复第一步和第二步
，输入：

sysctl net.ipv4.tcp_available_congestion_control

若出现

net.ipv4.tcp_available_congestion_control = bbr cubic reno

类似含有
bbr
字样即成功。
第三第四步可以合并为一步，通过
ShadowsocksR+BBR加速一键安装包
五、效果
六、问题及参考
创建步骤参考自：
如何免费打造一个安全稳定超高速的科学上网环境
GOOGLE COMPUTE ENGINE(GCE)注册开VPS教程
拥有一架 Google 的小飞机是一种怎样的体验
SSR/SS相关问题：
SSR一键脚本
BBR相关问题：
一键安装最新内核并开启BBR脚本
--随缘箭·版权所有：
使用Google Cloud Platform(GCP GCE)安装SSR+BBR教程
--

来自

<
https://suiyuanjian.com/124.html
>

已使用 Microsoft OneNote 2016 创建。
