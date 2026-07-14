---
title: php安装扩展so
date: '2015-10-14'
description: 不重新编译 PHP 的方式安装扩展 .so 文件，通过配置 extension_dir 和 php.ini 加载已编译的扩展模块。
category: php
tags:
  - php
draft: false
source: evernote-local-db
lang: zh
---

无需重新编译 PHP 就能安装扩展 .so 文件的方法：

1. 查询 php 模块路径

```bash
grep 'extension_dir' /usr/local/php/etc/php.ini
```

![](/images/legacy/legacy-097e3534a7.png)

2. 将所需的 .so 文件复制到该目录，并确保有执行权限

```bash
chmod +x /path/to/extension.so
```

3. 在 php.ini 中添加扩展配置

```ini
extension=XXX.so
```

4. 重启 PHP 服务

如果必须以 root 身份启动，使用：

```bash
/usr/local/php/sbin/php-fpm -R
```
