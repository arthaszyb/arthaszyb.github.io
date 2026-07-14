---
title: Redis集群使用密码验证
date: '2018-01-24'
description: Redis 集群中配置密码验证的方法，包括在所有节点配置 masterauth 和 requirepass，以及修改 redis-trib.rb 脚本以支持密码登陆
category: database
tags:
  - redis
  - 集群
draft: false
source: evernote-local-db
lang: zh
---

## 配置 Redis 密码验证

在所有 node 节点的 redis.conf 中增加如下配置（注意两个密码要一致）：

```ini
#PASS
masterauth 7jwjiHdux5djw82j
requirepass 7jwjiHdux5djw82j
```

重启各节点即生效。

## redis-trib.rb 修改

但是做到这里还不够。当执行 `redis-trib.rb check 192.168.2.11:7001` 检查集群状态的话，会报错。这是因为我们给 redis 配置密码导致的 redis-trib.rb 无法登陆。

还要做如下修改：

```bash
vi /usr/local/ruby/lib/ruby/gems/2.3.0/gems/redis-3.3.1/lib/redis/client.rb
```
