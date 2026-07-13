---
title: 获取 URL 访问状态
date: '2015-09-24'
description: 用 curl 检查 URL 访问状态的命令，跟随 302 跳转后获取最终的 HTTP 状态码。
category: linux
tags:
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
---
检查 URL 访问状态，下面的命令可跟随 302 跳转获取到最终的 HTTP 状态码：

```bash
curl -I -s --retry 1 -m 3 -L $url -o /dev/null -w '%{http_code}'
```

参数说明：`-I` 只取响应头、`-s` 静默、`--retry 1` 失败重试一次、`-m 3` 超时 3 秒、`-L` 跟随跳转、`-o /dev/null` 丢弃正文、`-w '%{http_code}'` 只输出状态码。
