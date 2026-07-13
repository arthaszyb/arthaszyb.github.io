---
title: 在vi中行首去掉#号
date: '2014-10-08'
description: "vi的自动缩进在粘贴代码时会在每行首加上#号。使用set paste命令禁用自动缩进，粘贴后再set nopaste恢复。"
category: linux
tags:
  - vim
draft: false
source: evernote-local-db
lang: zh
---

在 vi 中拷贝文字有时会默认在所有行首加上 `#` 号（自动缩进），只需输入以下命令即可禁用自动缩进：

```vim
set paste
```

粘贴代码后，恢复自动缩进：

```vim
set nopaste
```
