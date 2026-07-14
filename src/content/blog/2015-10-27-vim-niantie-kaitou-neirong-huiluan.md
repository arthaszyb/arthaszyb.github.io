---
title: VIM 粘贴 # 开头内容会乱
date: '2015-10-27'
description: 在 vim 中粘贴以 # 开头的内容出现自动缩进错乱时，用 set paste 关闭自动缩进即可解决。
category: linux
tags:
  - vim
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.cnblogs.com/jianyungsun/archive/2011/03/19/1988855.html
---
在 vim 中粘贴以 `#` 开头的内容时，自动缩进会把格式弄乱。进入 vim 后先执行：

```text
:set paste
```

再粘贴即可保持原格式。
