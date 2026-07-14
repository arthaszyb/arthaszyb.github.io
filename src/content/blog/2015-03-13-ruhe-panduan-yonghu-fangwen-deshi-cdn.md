---
title: 如何判断用户访问的是CDN节点还是回源的
date: '2015-03-13'
description: '在浏览器开发者工具中通过 X-Cache 响应头判断访问是否命中 CDN 缓存：hit 表示 CDN 节点，miss 表示回源。'
category: network
tags:
  - cdn
draft: false
source: evernote-local-db
lang: zh
---

## 判断方法

使用浏览器开发者工具查看响应头中的 `X-Cache` 字段：

```text
X-Cache: hit   # 表示命中 CDN 缓存
X-Cache: miss  # 表示从源站回源
```

刷新页面后在开发者工具（Network 标签页）中查看响应头信息，据此判断是否经过 CDN 缓存节点。
