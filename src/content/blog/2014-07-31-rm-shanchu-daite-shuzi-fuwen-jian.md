---
title: rm删除带特殊字符文件
date: '2014-07-31'
description: >-
  如果文件名带 ‘-’ 或者‘--’这样的字符，删除办法为： rm -- 文件名 如文件名为：-h.tgz 如果用普通方法去删除：rm -h.tgz
  结果错误：rm: invalid option -- h Try \rm --help' for more information.
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
如果文件名带 ‘-’ 或者‘--’这样的字符，删除办法为：

rm -- 文件名

如文件名为：-h.tgz

如果用普通方法去删除：rm -h.tgz

结果错误：rm: invalid option -- h

Try \`rm --help' for more information.

可以用：rm -- -h.tgz，则能成功删除。
