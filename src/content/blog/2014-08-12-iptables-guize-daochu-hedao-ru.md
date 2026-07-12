---
title: '# iptables规则导出和导入'
date: '2014-08-12'
description: >-
  \# iptables规则导出和导入 Tuesday, August 12, 2014 2:57 PM \# iptables-save
  /root/iptables.save \# vi /etc/init.d/boot.local iptables-restore
  /root/iptables.save
category: linux
tags:
  - iptables
draft: false
source: evernote-local-db
lang: zh
---
# \# iptables规则导出和导入
\# iptables规则导出和导入

Tuesday, August 12, 2014

2:57 PM

\# iptables-save > /root/iptables.save

\# vi /etc/init.d/boot.local

iptables-restore /root/iptables.save #增加一条命令， 让系统的启动的时候自动恢复之前保存的防火墙规则....这样就OK
