---
title: LNMP 中遇到的问题
date: '2013-08-07'
description: LNMP 环境编译安装中的两个常见问题及解决方案：fontconfig 在 64 位系统上的库路径问题，PHP 编译时 gd 库的结构体兼容性问题。
category: shell
tags:
  - php
draft: false
source: evernote-local-db
lang: zh
---

## fontconfig 编译问题

在 64 位系统上编译 fontconfig 时：

```bash
./configure --prefix=/usr/local/fontconfig \
  --with-freetype-config=/usr/local/freetype/bin/freetype-config
```

会报错。解决方法是在 configure 参数中添加 64 位库路径：

```bash
./configure --prefix=/usr/local/fontconfig \
  --with-freetype-config=/usr/local/freetype/bin/freetype-config \
  LDFLAGS="-L/usr/lib64 -L/lib64"
```

## PHP 编译 gd 库问题

编译 PHP 时如果遇到：

```text
错误：'struct gdIOCtx' 没有名为 'data' 的成员
```

需要修改 gd 库头文件 `<gd_dir>/include/gd_io.h`，在 gdIOCtx 结构体中添加 `void *data;`：

```c
typedef struct gdIOCtx
{
    int (*getC) (struct gdIOCtx *);
    int (*getBuf) (struct gdIOCtx *, void *, int);
    void (*putC) (struct gdIOCtx *, int);
    int (*putBuf) (struct gdIOCtx *, const void *, int);
    int (*seek) (struct gdIOCtx *, const int);
    long (*tell) (struct gdIOCtx *);
    void (*gd_free) (struct gdIOCtx *);
    void (*data);  /* 添加此行 */
} gdIOCtx;
```
