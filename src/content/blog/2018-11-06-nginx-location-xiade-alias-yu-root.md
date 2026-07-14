---
title: Nginx location中alias与root的用法
date: '2018-11-06'
description: >-
  Nginx location 中 alias 与 root 的区别和用法。两者都可以指定文件路径，但拼接方式不同，需要在不同场景选择正确指令。
category: web-infra
tags:
  - nginx
draft: false
source: evernote-local-db
origin_url: https://blog.csdn.net/u013948858/article/details/79459455
lang: zh
---

处理 location 时需要与 root 不同的路径时，会遇到 alias 和 root 的选择问题。

## alias 与 root 的区别

nginx 指定文件路径有两种方式：root 和 alias。两者主要区别在于 nginx 如何解释 location 后面的 uri，会使两者以不同的方式将请求映射到服务器文件上。说白了就是两者拼接文件路径的手段不一样。

## root 的用法

**句法：**

```nginx
root path;
```

**默认值：**`root html;`

**语境：**`http`, `server`, `location`, `if in location`

**示例：**

```nginx
location ^~ /request_path/dirt/ {
    root /local_path/dirt/;
}
```

当客户端请求 `/request_path/image/file.ext` 时，Nginx 把请求解析映射为：

```
/local_path/dirt/request_path/dirt/file.ext
```

## alias 的用法

**句法：**

```nginx
alias path;
```

**默认值：**-

**语境：**`location`

**示例：**

```nginx
location /request_path/dirt/ {
    alias /local_path/dirt/file/;
}
```

当客户端请求 `/request_path/dirt/file.ext` 时，Nginx 把请求映射为：

```
/local_path/dirt/file/file.ext
```

注意这里是 file 目录。alias 会把 location 后面配置的路径丢弃掉（比如 `/request_path/dirt/one.html`，到 alias 那里就剩 `one.html` 了），把当前匹配到的目录指向到指定的目录。

## 使用注意

1. 使用 alias 时，目录名后面一定要加 `/`，不然会认为是个文件。

2. alias 在使用正则匹配时，location 后 uri 中捕捉到的内容在指定的 alias 规则内使用：

```nginx
location ~ ^/users/(.+\.(?:gif|jpe?g|png))$ {
    alias /data/w3/images/$1;
}
```

3. alias 只能位于 location 块中，而 root 的权限不限于 location。

## 总结

遇到问题不是谁都能解决，但没有解决不了的问题。
