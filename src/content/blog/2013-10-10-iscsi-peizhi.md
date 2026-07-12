---
title: iscsi 配置
date: '2013-10-10'
description: >-
  一。 配置服务端 1.yum install scsi-target-utils 2.启动tgtd服务并设置自启动 service tgtd start
  checkconfig tgtd on 3\.
category: linux
tags:
  - vim
  - iscsi
draft: false
source: evernote-local-db
lang: zh
---
一。配置服务端

1.yum install scsi-target-utils

2.启动tgtd服务并设置自启动

service tgtd start

checkconfig tgtd on

3\. 配置服务端 vim /etc/tgt/targets.conf

<target iqn.2013-10.com.example.cluster1:iscsi>

backing-store /dev/sdc #指定要发布的设备（磁盘或分区）

initiator-address 192.168.70.41 #对客户端的访问控制

</target>

4.重启tgtd

可执行tgtadm --lld iscsi --op show --mode target查看结果

二。Linux客户端配置

1.yum install iscsi-initiator

2.service iscsi start

3.搜寻盘阵

iscsiadm --mode（或者-m） discovery --type（或者-t） sendtargets -p 192.168.70.52:3260

4.显示盘阵

iscsiadm --mode node

5.登陆盘阵

iscsiadm --mode node --targetname iqn.2013-10.com.example.cluster1:iscsi -p 192.168.70.52：3260 --login

至此挂载成功，可通过fdisk -l查看

6.退出盘阵

iscsiadm -m node -T iqn.2013-10.com.example.cluster1:iscsi -p 192.168.70.52:3260,1(壹) -u

完成以上步骤后可正常分区格式化。
