---
title: nginx php-fpm响应长排查
date: '2015-10-28'
description: application shang 2年前 (2014-04-24) 4254浏览 0评论 说明： web页面响应时间长，要怎么排查？
category: php
tags:
  - nginx
  - php
  - vim
draft: false
source: evernote-local-db
lang: zh
---
# [nginx php-fpm响应长排查](http://coolnull.com/2941.html)

[application](http://coolnull.com/category/application) [shang](http://coolnull.com/author/youknow) 2年前 (2014-04-24) 4254浏览 [0评论](http://coolnull.com/2941.html#comments)

**说明：**

**web页面响应时间长，要怎么排查？**

![](/images/legacy/legacy-7656483a60.jpg)

因为是lnmp系统，可以通过设置nginx日志，记录nginx处理请求的时间、开启php慢执行来排查

**解决：**

**一、修改nginx.conf日志格式，记录nginx响应时间**

**# vim /usr/local/nginx/conf/nginx.conf //添加$request\_time $upstream\_response\_time参数**

log\_format access '$remote\_addr - $remote\_user \[$time\_local\] "$request" '

'$request\_time $upstream\_response\_time '

'$status $body\_bytes\_sent "$http\_referer" '

'"$http\_user\_agent" $http\_x\_forwarded\_for';

$request\_time: request processing time in seconds with a milliseconds resolution;time elapsed between the first bytes were read from the client and the log write after the last bytes were sent to the client$request\_time。nginx处理请求的时间，指的就是从接受用户请求数据到发送完回复数据的时间。

$upstream\_response\_time: keeps servers response times in seconds with a milliseconds resolution. Several responses are also separated by commas and colons. $upstream\_response\_timephp-cgi的响应时间，说的有点模糊，它指的是从Nginx向后端建立连接开始，到接受完数据然后关闭连接为止的时间。因为会有重试，它可能有多个时间段。一般来说，$upstream\_response\_time 会比$request\_time时间短。（其实也可以加上upstream\_status的状态返回值）

截取部份日志，可以看到客户端获取test.php。nginx共花费了5.308s(这个时间包括了php后端处理的时间)，php后端处理也花费了5.308s。这说明响应慢很有可能是因为php程序的原因。接下就就是排查php

$request\_time时间比$upstream\_response\_time长，这有可能是因为web页面通过post上传较大的数据，nginx一直在接收数据。

116.21.154.139 \- \- \[17/Jan/2014:16:20:51 +0800\] "GET /index.php HTTP/1.1" 5.308 5.308 200 6364 "[http://coolnull.com/test.php](http://coolnull.com/test.php)" "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)" \-

二、查看php-fpm慢查询日志。php-fpm提供了慢执行日志，可以将执行比较慢的脚本的调用过程dump到日志中。

配置比较简单，PHP 5.3.3 之前设置如下：

The timeout (in seconds) for serving of single request after which a php backtrace will be dumped to slow.log file

'0s' means 'off'<value name\="request\_slowlog\_timeout"\>1s</value>

The log file for slow requests

<value>logs/slow.logs</value\>

PHP 5.3.3 之后设置以下如下：

; The timeout for serving a single request after which a PHP backtrace will be

; dumped to the 'slowlog' file. A value of '0s' means 'off'.; Available units: s(econds)(default), m(inutes), h(ours), or d(ays); Default Value: 0

request\_slowlog\_timeout \= 1s

; The log file for slow requests

; Default Value: /usr/local/php/log/php\-fpm.log.slow

slowlog \= /usr/local/php/log/php\-fpm.log.slow

还可以将执行时间太长的进程直接终止，设置下执行超时时间即可。

PHP 5.3.3 之前版本：The timeout (in seconds) for serving a single request after which the worker process will be terminated

Should be used when 'max\_execution\_time' ini option does not stop script execution for some reason

'0s' means 'off'<value name\="request\_terminate\_timeout"\>10s</value\>

PHP 5.3.3 之后设置以下如下：

; The timeout for serving a single request after which the worker process will

; be killed. This option should be used when the 'max\_execution\_time' ini option

; does not stop script execution for some reason. A value of '0' means 'off'.; Available units: s(econds)(default), m(inutes), h(ours), or d(ays); Default Value: 0

request\_terminate\_timeout \= 10s

加上慢执行日志后，基本可以从慢执行日志中看出问题所在，比如：

Feb 07 19:00:30.378095 pid 27012 (pool default)

script\_filename \= /www/adshow/a.php

\[0x000000000115ea08\] flock() /www/backend/parser/logs.class.php:260\[0x0000000001159810\] lock\_stats() /www/adshow/a.php:126

Feb 07 19:00:31.033073 pid 27043 (pool default)

script\_filename \= /www/adshow/a.php

\[0x00000000012686e8\] flock() /www/backend/parser/logs.class.php:260\[0x00000000012634f0\] lock\_stats() /www/adshow/a.php:126

很明显是程序中产生了死锁，导致各个 PHP-CGI 进程互相等待资源而锁死。据此，再进行进一步的程序分析，就更具方向性了。有时候php-fpm慢执行日志只会给出执行长的php程序，具体还得程序那边配合排查。

当然，还可以通过xhprof来精准定位。具体可以参考[php性能监测模块XHProf安装与测试](http://coolnull.com/2326.html)
