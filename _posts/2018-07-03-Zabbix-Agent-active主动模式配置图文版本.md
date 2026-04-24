---
title: "Zabbix Agent active主动模式配置图文版本"
date: 2018-07-03 08:16:27 +0000
categories: ["监控告警"]
tags: []
description: "linuxsec点cn 1 人评论 1263人阅读 2017-03-16 09:56:16 当zabbix-server监控主机过多时候，由于server端去搜集信息，zabbix会出现严重的性能问题，比如： 1，当监控端到一个量级的时候，web操作界面很卡，容易出现502 2，图层断裂 3，开启的进程太多，即使ite"
source: "evernote-local-db"
---

Zabbix Agent active主动模式配置图文版本
linuxsec点cn
1
人评论
1263人阅读
2017-03-16 09:56:16
当zabbix-server监控主机过多时候，由于server端去搜集信息，zabbix会出现严重的性能问题，比如：
1，当监控端到一个量级的时候，web操作界面很卡，容易出现502
2，图层断裂
3，开启的进程太多，即使item数量减少，以后加一定量的机器也会出现问题
所以主要往2个优化方面考虑：
1，添加proxy节点或者node模式做分布式监控
2，调整agentd为主动模式
由于第一个方案需要加物理机器，所以尝试第二个方案。
主动模式流程：
主动模式一定要记得设置ServerActive=ServerIP
Agent向Server建立一个TCP连接
Agent请求需要检测的数据列表
Server响应Agent，发送一个Items列表
Agent允许响应
TCP连接完成本次会话关闭
Agent开始周期性地收集数据
一．被监控端zabbix_agentd.conf的配置调整
1
2
3
4
5
6
7
8
$
sudo

vim
/etc/zabbix/zabbix_agentd
.conf
StartAgents=0
#客户端的anent的模式，0表示关闭被动模式，zabbix-agentd不监控本地端口，所以看不到zabbix_agentd进程。
#Server=172.16.100.84 #如果设置纯被动模式，应该注释掉这行
ServerActive=172.16.100.84
#主动模式的serverip地址
Hostname=172.16.100.47
#客户端的hostname，不配置则使用主机名
RefreshActiveChecks=120
#被监控端到服务器获取监控项的周期，默认120S
BufferSize=200
#被监控端存储监控信息的空间大小
Timeout=3
#超时时间
纯主动监控模式下的zabbix agent，只能支持zabbix agent (active)类型的监控项
二．调整监控模版
克隆一个temple os linux模版来修改
克隆之后，修改名称，点击添加
进入模版列表找到刚到添加的模版，并点击监控项
全选
然后找到最下方的批量更新
类型打勾，选择主动式，然后更新
更新自动发现规则的监控项

按照刚才的方法更新监控项
把不支持主动式的监控项暂停
添加主机
配置模版
添加完成之后，你会发现zabbix的Z灯不亮，因为服务器是基于被动模式的。
可以查看主动模式自动提交的item
查看监控的图像
#主动监控模式下监控不出现硬盘和网卡情况解决#
点击模版-主动监控的模板-自动发现规则
点击
监控项原型
-进去之后一个个点击，修改成主动式监控，在模版修改只，主动就会自动应用
在图形界面查看：网卡情况和硬盘情况都出来了。
