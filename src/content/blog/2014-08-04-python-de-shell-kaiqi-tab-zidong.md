---
title: Python shell 开启 Tab 自动补齐
date: '2014-08-04'
description: 在 Python 交互式 shell 中启用 Tab 自动补齐功能，提高交互体验。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
---

在 Python 交互式 shell（REPL）中启用 Tab 自动补齐的方法：

```python
import rlcompleter, readline
readline.parse_and_bind('tab:complete')
```

可以将这段代码放在 Python 启动脚本中，每次进入 shell 时自动加载，提高代码编辑效率。
