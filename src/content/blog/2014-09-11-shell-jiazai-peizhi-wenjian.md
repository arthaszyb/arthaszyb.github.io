---
title: shell加载配置文件
date: '2014-09-11'
description: 在 shell 脚本中加载外部配置文件的方法，使用 source 或点号命令。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

在 shell 中加载配置文件的方法。假设有配置文件 mail.ini：

```text
ftp=123.192.1.2
name=admin
ps=123456
```

可使用以下两种命令加载：

```bash
source mail.ini
```

或

```bash
. mail.ini
```

两种方式作用相同，都可以在当前 shell 环境中导入变量。
