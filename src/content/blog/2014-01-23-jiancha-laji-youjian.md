---
title: 检查垃圾邮件
date: '2014-01-23'
description: "从 anspam 反垃圾日志中提取指定字段和过滤，查看特定账户的邮件通过情况。"
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

进入 anspam 的日志目录，检查特定账户的邮件通过情况：

```bash
awk -F"," '{print $67,$70,$75}' *.log | grep Pass | grep chinaboqi
```

命令说明：
- `awk -F","` 指定逗号为分隔符
- `'{print $67,$70,$75}'` 提取第 67、70、75 列
- `grep Pass` 过滤出状态为"Pass"的行
- `grep chinaboqi` 进一步过滤出指定账户的记录
