---
title: php扩展的安装问题
date: '2017-11-20'
description: PHP 扩展模块的编译安装步骤、常见问题及调试方法。
category: php
tags:
  - php
draft: false
source: evernote-local-db
lang: zh
---

## 标准安装步骤

1. 进入源码目录下的对应扩展目录（如 pgsql），执行 phpize 生成 configure 文件

```bash
cd php-source/ext/pgsql
/usr/local/app/php/bin/phpize
```

2. 配置扩展

```bash
./configure --with-php-config=/usr/local/app/php/bin/php-config --with-pgsql=/usr/local/app/pcmgr_enterprise/tools/pgsql
```

3. 编译

```bash
make
```

会在 `modules/` 目录生成 `.so` 文件，复制到 PHP 的扩展目录即可（不必执行 `make install`）。

4. 在 php.ini 中添加扩展配置

```ini
extension = "pgsql.so"
```

## 常见问题

模块编译成功但 `php -m` 仍未显示，且无报错，通常是 php.ini 路径不匹配。检查使用的配置文件：

```bash
php -c /path/to/php.ini -m
```

其他 PHP 执行脚本也需指定 `-c` 参数。用 `php-config` 查看 PHP 的安装配置信息。
