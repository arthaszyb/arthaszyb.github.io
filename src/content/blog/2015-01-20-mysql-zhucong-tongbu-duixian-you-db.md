---
title: mysql主从同步（对现有db增加新的slave）
date: '2015-01-20'
description: "为现有数据库增加从库的两种同步方式：手动模式（锁表 + rsync 复制）和自动模式（mysqldump）的步骤对比。"
category: database
tags:
  - mysql
  - mysql-replication
  - rsync
draft: false
source: evernote-local-db
lang: zh
---

## 手动模式

对现有 MySQL 主库添加从库的手动操作流程：

1. 主库执行 `flush tables with read lock` 锁表
2. 修改主和从配置文件
3. 主给从赋权
4. rsync 主的库文件到从
5. 查看主的 position，配置 slave 并启动同步
6. 主库解锁表

**缺点**：
- lock table 需要保持这个 mysql 连接，否则锁表失效
- 直接拷贝数据文件不安全，内存中的数据还没存入硬盘，会造成数据不完整
- 手动锁表和解锁比较麻烦

## 自动模式

使用 mysqldump 导出备份并在从库导入：

1. 主库执行 `mysqldump --master-data=1`，该参数会在 dump 文件中记录锁表时的 position 信息，从库导入后直接对应，无需重新指定
2. 修改配置，主给从赋权
3. 从库导入 dump 文件，重启 slave

```bash
# mysqldump 导数据
mysqldump -h <host> -P <port> -u <user> -p<password> \
  --default-character-set=binary \
  --max-allowed-packet=512M \
  --master-data=1 -A > xxx.dump

# mydumper 替代方案
/data1/mydumper/mydumper -h 10.161.11.185 -P 3306 \
  -u 2015_repl -p 2015_repl \
  -t 4 -G -R -E -A \
  -o /data1/zhouyang > /data1/dump.log 2>&1
```

**要点**：导出导入都使用 `--default-character-set=binary` 可忽略字符集问题，避免乱码。
