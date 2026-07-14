---
title: Python中文转换URL编码
date: '2017-06-07'
description: 使用 urllib 模块进行中文与 URL 编码的相互转换，处理不同字符集（GBK 和 UTF-8）的编码差异。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
origin_url: http://dashen2009.blog.51cto.com/714741/199157
---

## urllib 编码/解码

使用 urllib 模块中的 `quote()` 和 `unquote()` 处理中文 URL 编码：

```python
>>> import urllib
>>> data = '丽江'
>>> urllib.quote(data)
'%E4%B8%BD%E6%B1%9F'
>>> urllib.unquote('%E4%B8%BD%E6%B1%9F')
'\xe4\xb8\xbd\xe6\xb1\x9f'
>>> print urllib.unquote('%E4%B8%BD%E6%B1%9F')
丽江
```

## 处理不同编码

不同网站使用的字符集不同（百度贴吧使用 GBK，Google 等多数网站使用 UTF-8）。同一汉字在不同编码下的 URL 形式不同。

```python
>>> import sys, urllib
>>> s = '丽江'
>>> urllib.quote(s.decode(sys.stdin.encoding).encode('gbk'))
'%C0%F6%BD%AD'
>>> urllib.quote(s.decode(sys.stdin.encoding).encode('utf8'))
'%E4%B8%BD%E6%B1%9F'
```

## 脚本示例

```python
#!/usr/bin/python
import urllib
import sys

string = sys.argv[1]
string = unicode(string, "gbk")
utf8_string = string.encode("utf-8")
gbk_string = string.encode("gbk")
gbk = urllib.quote(gbk_string)
utf8 = urllib.quote(utf8_string)
print gbk
print utf8
```
