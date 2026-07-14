---
title: Nginx Location 正则表达式与匹配优先级
date: '2018-09-06'
description: >-
  Nginx location 正则表达式与匹配优先级的详细说明。包括等号、波浪号、脱字符等各种匹配符的用法和优先级规则。
category: web-infra
tags:
  - nginx
draft: false
source: evernote-local-db
lang: zh
---
Nginx location 正则表达式与匹配优先级
## 基本语法

```nginx
location [ = | ~ | ~* | ^~ ] uri { ... }
location @name { ... }
```

- 默认值：-
- 上下文：server, location
## 匹配符详解

### 1. 等号（=）- 完全匹配

表示完全匹配规则才执行操作。

```nginx
location = /index {
    [ configuration A ]
}
```

只有 URL 为 `http://{domain_name}/index` 时才执行。

### 2. 波浪号（~）- 正则匹配，区分大小写

```nginx
location ~ /page/\d{1,2} {
    [ configuration B ]
}
```

URL 为 `http://{domain_name}/page/1` 或 `/page/99` 时配置生效。

### 3. 波浪号与星号（~*）- 正则匹配，不区分大小写

```nginx
location ~* /\.(jpg|jpeg|gif) {
    [ configuration C ]
}
```

匹配所有以 jpg、jpeg、gif 结尾的 URL 时配置生效。

### 4. 脱字符与波浪号（^~）- 前缀匹配，普通字符

表示普通字符匹配，前缀匹配有效。

```nginx
location ^~ /images/ {
    [ configuration D ]
}
```

URL 为 `http://{domain_name}/images/1.gif` 时配置生效。

### 5. @符号 - 内部重定向

定义一个 location，用于处理内部重定向。

```nginx
location @error {
    proxy_pass http://error;
}
error_page 404 @error;
```
## 匹配优先级

```
= > ^~ > ~/~*
```

当 `~/~*` 中有多个正则匹配时，选择正则表达式最长的配置执行。

## 实战案例

配置 301 重定向到另一个域名时，发现 HTML 正常转发，但 CSS 和 JS 等静态文件均 404 错误。

问题所在：

```nginx
location /301yy/ {
    proxy_pass http://node_haici/;
}
```

静态文件根据匹配优先级走到了后面的 location 上去了。因为 `~*` 的优先级大于普通前缀匹配，所以加上 `^~` 后优先级就高于 `~*` 了：

```nginx
location ^~ /301yy/ {
    proxy_pass http://node_haici/;
}
```

这样就一并转发走了，问题解决。配置 nginx 时需要注意匹配优先级。
