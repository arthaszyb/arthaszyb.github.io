---
title: redis集群使用密码验证-yau
date: '2018-01-24'
description: >-
  redis 集群使用密码验证 -yau 2018 年 1 月 24 日 11:46 所有 node 节点的 redis.conf
  增加如下配置（注意两个密码要一致）： #PASS masterauth 7jwjiHdux5djw82j requirepass
  7jwjiHdux5djw82j 重启各节点，即生效了。
category: database
tags:
  - redis
  - 集群
draft: false
source: evernote-local-db
lang: zh
---
redis
集群使用密码验证
-yau
2018
年
1
月
24
日
11:46
所有
node
节点的
redis.conf
增加如下配置（注意两个密码要一致）：
#PASS
masterauth 7jwjiHdux5djw82j
requirepass 7jwjiHdux5djw82j
重启各节点，即生效了。但是
做到这里还不够，现在我们执行
redis-trib.rb check 192.168.2.11:7001
检查集群状态的话，会报错如下图：
这是因为我们给
redis
配置密码导致的
redis-trib.rb
无法登陆，还要做如下修改：
vi /usr/local/ruby/lib/ruby/gems/2.3.0/gems/redis-3.3.1/lib/redis/client.rb
