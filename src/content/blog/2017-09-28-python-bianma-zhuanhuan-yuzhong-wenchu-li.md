---
title: Python 编码转换与中文处理
date: '2017-09-28'
description: Python 编码转换与中文处理完整指南，涵盖编码声明、str/unicode 类型转换、编码检测等常见问题与解决方案。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.jianshu.com/p/53bb448fe85b
---

## 编码声明

Python 默认脚本文件为 ASCII 编码。当文件中有非 ASCII 字符时，需要在第一行或第二行指定编码声明：

```python
# -*- coding=utf-8 -*-
# 或
# coding=utf-8
```

可使用其他编码如 gbk、gb2312。不声明会报错：`SyntaxError: Non-ASCII character`。

## 字符串类型

Python 有两种字符串类型，都是 basestring 的派生类：
- **str**：包含 8-bit bytes 的序列，用于文件读取或网络数据
- **unicode**：每个 unit 是一个 unicode 对象

## 编码转换

### Unicode 转 GBK/UTF-8

```python
# -*- coding=UTF-8 -*-
s = u'中国'
s_gb = s.encode('gb2312')
s_utf8 = s.encode('UTF-8')
```

### GBK/UTF-8 转 Unicode

```python
# coding=UTF-8
s = '中国'  # UTF-8 编码的 str
s_unicode = s.decode('UTF-8')
```

### 直接转换 str 编码

```python
# coding=UTF-8
s = '中国'  # UTF-8 str
s_gb = s.decode('utf-8').encode('gb2312')
```

### 自动解码问题

直接执行 `s.encode('gb2312')` 时，Python 自动先用 `sys.defaultencoding` 解码再编码，默认为 ASCII，会导致错误。

解决方案：

```python
# 方案1：明确指定原编码
s.decode('utf-8').encode('gb2312')

# 方案2：修改系统默认编码
import sys
reload(sys)
sys.setdefaultencoding('utf-8')
s.encode('gb2312')
```

## 文件编码处理

### 读取不同编码的文件

```python
# coding=gbk
import codecs
# UTF-8 文件
print open("Test.txt").read().decode("utf-8")
```

### 处理 BOM（字节序标记）

某些编辑器（如 Notepad）在 UTF-8 文件开头插入 BOM（`0xEF 0xBB 0xBF`）：

```python
# coding=gbk
import codecs
data = open("Test.txt").read()
if data[:3] == codecs.BOM_UTF8:
    data = data[3:]
print data.decode("utf-8")
```

## Print 函数编码

Python print 直接将字符串传递给操作系统，需要与系统一致的编码。Windows 使用 CP936（近似 GBK）：

```python
# coding=utf-8
s = "中文"
print unicode(s, "cp936")
```

## 编码检测

使用 chardet 模块检测字符串/文件编码：

```python
>>> import urllib
>>> rawdata = urllib.urlopen('http://www.google.cn/').read()
>>> import chardet
>>> chardet.detect(rawdata)
{'confidence': 0.99, 'encoding': 'GB2312'}
```

## 处理非法字符

遇到非法字符导致解码失败时（如某些全角空格 `\xa3\xa0`、`\xa4\x57` 不是合法的 `\xa1\xa1`），使用 decode 的 errors 参数：

```python
# ignore：忽略非法字符
s.decode('gbk', 'ignore').encode('utf-8')

# replace：用 ? 代替非法字符
s.decode('gbk', 'replace').encode('utf-8')

# xmlcharrefreplace：使用 XML 字符引用
s.decode('gbk', 'xmlcharrefreplace').encode('utf-8')
```

decode 函数原型：`decode([encoding], [errors='strict'])`，errors 默认为 strict（遇到非法字符抛出异常）。

## 字符集备选方案

若 GBK 转换失败，尝试使用 gb18030：

```python
s.decode('gb18030')
```
