---
title: mysql一个无法启动解决方法
date: '2014-10-27'
description: "MySQL启动失败时排查/etc/nsswitch.conf配置的方法，通过临时移除LDAP认证配置实现快速恢复。"
category: database
tags:
  - mysql
draft: false
source: evernote-local-db
lang: zh
---
## 问题现象

MySQL启动失败，可能与系统的LDAP认证配置冲突。

## 解决步骤

编辑 `/etc/nsswitch.conf` 配置文件：
```bash
vim /etc/nsswitch.conf
```

找到以下行：
```
passwd: files ldap
group:  files ldap
shadow: files ldap
```

**临时修复：** 注释掉LDAP部分，改为：
```
passwd: files
group:  files
shadow: files
```

然后启动MySQL。启动成功后，可以恢复原配置（将ldap部分加回）。

这样做是因为MySQL启动时可能依赖用户认证，LDAP服务不可用时会阻止启动。通过临时禁用LDAP认证，可以让MySQL先启动恢复，随后再恢复完整的认证配置。
