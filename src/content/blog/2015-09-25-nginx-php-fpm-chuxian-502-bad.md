---
title: nginx+php-fpm出现502 bad gateway错误解决方法
date: '2015-09-25'
description: 关于 nginx+php-fpm 常见的 502 错误原因的排查和解决方法，包括进程数、文件限制、脚本超时、缓存配置等优化建议。
category: php
tags:
  - nginx
  - php
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.nginx.cn/102.html
---

502 错误常见原因及解决方法整理：

## php-fpm 进程数不够

检查当前 fastcgi 进程个数：

```bash
netstat -napo | grep "php-fpm" | wc -l
```

如接近上限需要调高进程数。根据服务器内存情况，4G 内存可配置 200 个子进程。

## 提高 Linux 打开文件数量

```bash
echo 'ulimit -HSn 65536' >> /etc/profile
echo 'ulimit -HSn 65536' >> /etc/rc.local
source /etc/profile
```

## 脚本执行超时

在 nginx.conf 中调整：

```nginx
fastcgi_connect_timeout 300;
fastcgi_send_timeout 300;
fastcgi_read_timeout 300;
```

在 php-fpm.conf 中调整：

```ini
request_terminate_timeout = 10s
```

建议设置为 0，避免 php-fpm 直接杀掉进程导致前端返回 104 错误，影响体验。

## 缓存设置

在 nginx.conf 中增加或修改：

```nginx
proxy_buffer_size 64k;
proxy_buffers 512k;
proxy_busy_buffers_size 128k;
```

## Connection reset by peer 错误

程序层面要设置好超时，gethostbyname、curl、file_get_contents 等函数都要设置超时时间。如使用多说评论，过多会影响响应速度，可考虑关闭。
