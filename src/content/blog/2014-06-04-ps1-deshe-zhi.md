---
title: PS1 的设置
date: '2014-06-04'
description: 自定义 PS1 提示符，包含彩色主机名、用户名、IP地址、工作目录等信息。
category: linux
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

自定义 PS1 提示符，将以下命令添加到 /etc/profile：

```bash
export PS1="\[\e[31;1m\]`hostname`\[\e[31;1m\]\u\[\e[0m\]@\[\e[32;1m\]`/sbin/ifconfig em1|grep "inet addr:"|cut -d: -f 2|cut -d" " -f1`\[\e[0m\]:\[\e[35;1m\]\w\[\e[0m\]\\$ "
```

此配置显示：
- 红色主机名
- 红色用户名
- 绿色 IP 地址
- 紫色工作目录
- 提示符结尾带斜杠 `$`
