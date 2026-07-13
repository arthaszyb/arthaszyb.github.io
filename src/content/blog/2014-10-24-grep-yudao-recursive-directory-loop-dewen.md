---
title: grep遇到recursive directory loop的问题解决方法
date: '2014-10-24'
description: "grep递归搜索时如果目录含有符号链接会导致无限循环错误。使用-l标志排除符号链接可以解决此问题。"
category: linux
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

遇到无限循环错误的原因是目录含有符号链接。在 grep 中使用 `-l` 标志排除符号链接即可解决：

```bash
grep -R --include='*.sh' --include='*.conf' --include='*.py' --include='*.yaml' --include='*.php' -E '172.24.6.71' /data1/resource/ -l | grep -vP '[^:]+:\s*#'
```

参数说明：
- `-R`：递归搜索目录
- `--include='*.ext'`：仅搜索指定扩展名的文件
- `-E`：使用扩展正则表达式
- `-l`：仅列出匹配的文件名（避免符号链接导致的无限循环）
