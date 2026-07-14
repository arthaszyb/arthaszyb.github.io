---
title: Grafana 重置 admin 密码
date: '2018-06-14'
description: "忘记 Grafana Web 界面 admin 密码后的重置方法。通过直接操作 SQLite 数据库文件修改用户密码。"
category: monitoring
tags:
  - grafana
draft: false
source: evernote-local-db
lang: zh
---

官网的重置方法（http://docs.grafana.org/administration/cli/#reset-admin-password）未成功，改用数据库直接修改的方法。

## 步骤

1. 查找 grafana.db 文件（默认位置 `/var/lib/grafana/grafana.db`）

```bash
find / -name "grafana.db"
```

2. 使用 sqlite3 修改密码

```bash
sqlite3 /var/lib/grafana/grafana.db
```

在 sqlite3 提示符下执行：

```sql
.tables
select * from user;
update user set password = '59acf18b94d7eb0694c61e60ce44c110c7a683ac6a8f09580d626f90f4a242000746579358d77dd9e570e83fa24faa88a8a6', salt = 'F3FAxVm33R' where login = 'admin';
.exit
```

重启后密码为 `admin/admin`。
