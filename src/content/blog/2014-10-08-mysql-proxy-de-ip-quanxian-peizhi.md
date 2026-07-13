---
title: mysql-proxy的IP权限配置
date: '2014-10-08'
description: "使用mysql-proxy进行后台数据库代理时的权限配置要点，实际客户端权限由proxy自身配置而非后台数据库。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---
使用mysql-proxy代理后台数据库时，权限管理需要分层考虑：

- 后台数据库只需配置proxy服务器的连接权限
- 所有实际客户端的访问权限由proxy自身配置（包括哪些客户端IP和用户可以访问数据库）

这是因为后台数据库看到的连接来源总是proxy服务器的IP地址。权限配置步骤如下：

1. 通过proxy主配置文件找到对应的权限配置文件
2. 编辑权限配置文件，定义客户端IP和用户权限
3. 重启proxy进程使配置生效
