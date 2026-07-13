---
title: 修改 PHP 上传文件大小限制
date: '2015-02-01'
description: PHP 配置中 max_execution_time、post_max_size、upload_max_filesize 三个参数的作用和调整方法。
category: php
tags:
  - php
draft: false
source: evernote-local-db
lang: zh
origin_url: http://blog.csdn.net/a519640026/article/details/8587635
---

PHP 上传文件默认有大小限制，需要修改 php.ini 中的以下参数：

**1. max_execution_time - 脚本执行超时时间**

大文件上传需要足够的执行时间（默认 30 秒）。

```ini
max_execution_time = 0
```

0 表示无限制。

**2. post_max_size - POST 数据最大值**

影响到上传文件的最大大小（默认 2M），超过此值 $_POST 和 $_FILES 为空。

```ini
post_max_size = 150M
```

**3. upload_max_filesize - 文件上传最大值**

规定单个文件最大大小（默认 8M）。

```ini
upload_max_filesize = 100M
```

**配置建议：** post_max_size > upload_max_filesize
