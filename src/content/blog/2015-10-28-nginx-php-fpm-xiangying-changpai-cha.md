---
title: nginx php-fpm响应慢排查
date: '2015-10-28'
description: LNMP 环境下诊断网页响应时间慢的方法，包括 nginx 日志配置、php-fpm 慢查询日志、性能监测工具等。
category: php
tags:
  - nginx
  - php
draft: false
source: evernote-local-db
lang: zh
origin_url: http://coolnull.com/2941.html
---

## 方法一：通过 nginx 日志记录响应时间

修改 nginx.conf，在日志格式中加入 `$request_time` 和 `$upstream_response_time`：

```nginx
log_format access '$remote_addr - $remote_user [$time_local] "$request" '
                  '$request_time $upstream_response_time '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" $http_x_forwarded_for';
```

- `$request_time`：nginx 从接收请求到发送响应的总耗时
- `$upstream_response_time`：后端 PHP-CGI 的响应耗时（一般更短）

若两者接近，说明慢点在 PHP；若前者明显更长，可能是上传数据量大或网络问题。

## 方法二：php-fpm 慢查询日志

PHP 5.3.3 之后在 php-fpm.conf 中配置：

```ini
request_slowlog_timeout = 1s
slowlog = /usr/local/php/log/php-fpm.log.slow
```

也可设置执行超时：

```ini
request_terminate_timeout = 10s
```

慢查询日志会输出堆栈信息，帮助定位问题，例如可能发现程序死锁（flock 互等）。

## 方法三：性能监测工具

可使用 xhprof 等工具进行精准定位，具体见[php性能监测模块XHProf安装与测试](http://coolnull.com/2326.html)。
