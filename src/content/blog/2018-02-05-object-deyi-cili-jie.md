---
title: object的一次理解
date: '2018-02-05'
description: >-
  JavaScript 中通过接口获得的 JSON 数据在 JS 中被当作 object（对象/字典）。介绍如何获取对象的 key 和遍历 key-value 对。
category: web-infra
tags: []
draft: false
source: evernote-local-db
lang: zh
---
JS 通过接口获得的 JSON 数据在 JS 中被当作 object（字典）。可通过 `console.log(typeof xxx)` 调试查看。

获取所有 key：

```javascript
Object.keys(xxx)
```

遍历所有 key 和 value：

```javascript
for (i in xxx) {
    // 注意：i 获取到的是 key，不包含 value
    v = xxx[i]
}
```
