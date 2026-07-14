---
title: Confluence 的安装与迁移
date: '2015-06-03'
description: Confluence 服务器的全新安装步骤和迁移方法，包括文件目录配置、数据存储设置和数据库路径修改。
category: misc
tags:
  - 存储
draft: false
source: evernote-local-db
lang: zh
---

## 全新安装 Confluence
1. 将 atlassian-confluence-4.1.5.zip 复制到 /usr/local/project/confluence/ 目录
2. 解压 atlassian-confluence-4.1.5.zip
3. 执行启动脚本：

```bash
/usr/local/project/confluence/atlassian-confluence-4.1.5/bin/start-confluence.sh
```

   默认端口为 8090

4. 设置管理员用户名密码为 admin:admin
5. 首次访问配置数据文件存放地址为 /usr/local/project/confluence/confluence-data，选用 HSQL 数据库，数据库文件位置在 /usr/local/project/confluence/confluence-data/database

## 迁移 Confluence

1. 将 /usr/local/project/confluence 目录下全部内容复制到新机器新目录下

2. 修改 confluence.home 配置，编辑 ./confluence/atlassian-confluence-4.1.5/confluence/WEB-INF/classes/confluence-init.properties：

```properties
confluence.home=/usr/local/project/confluence/confluence-data
```

3. 修改 HSQLDB 配置，编辑 ./confluence/confluence-data/confluence.cfg.xml，修改数据库路径：

```xml
<property name=”hibernate.connection.url”>jdbc:hsqldb:/usr/local/project/confluence/confluence-data/database/confluencedb;hsqldb.tx=MVCC</property>
```
