---
title: IP与字符串转换
date: '2017-02-09'
description: IP 地址字符串与整数的双向转换，使用 Python struct 和 socket 模块。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
---
IP 地址字符串与整数的相互转换。

## IP 字符串转整数

```python
import struct, socket
struct.unpack("=I", socket.inet_aton("203.205.179.171"))[0]
# 3398356427
```

## 整数转 IP 字符串

```python
import struct, socket
socket.inet_ntoa(struct.pack("=I", 3398356427))
# '203.205.179.171'
```

注：SQL 中的 `INET_ATON()` 等函数也可转换，但字节顺序可能不同。
