---
title: "nginx+php-fpm配置后页面显示空白的解决方法"
date: 2018-10-23 12:02:30 +0000
categories: ["PHP"]
tags: []
description: "2016年10月09日 17:40:23 feiniao8651 阅读数：13210 标签： ubuntu nginx bug 更多 个人分类： 服务器配置 OS: Ubuntu 15.04 由于nginx与php-fpm之间的一个小bug，会导致这样的现象： 网站中的静态页面 *.html 都能正常访问，而 *.ph"
source: "evernote-local-db"
---

nginx+php-fpm配置后页面显示空白的解决方法
2016年10月09日 17:40:23

feiniao8651

阅读数：13210

标签：

ubuntu
nginx
bug

更多
个人分类：

服务器配置
OS: Ubuntu 15.04
由于nginx与php-fpm之间的一个小bug，会导致这样的现象： 网站中的静态页面 *.html 都能正常访问，而 *.php 文件虽然会返回200状态码， 但实际输出给浏览器的页面内容却是空白。 简而言之，原因是nginx无法正确的将 *.php 文件的地址传递给php-fpm去解析， 相当于php-fpm接受到了请求，但这请求却指向一个不存在的文件，于是返回空结果。 为了解决这个问题，需要改动nginx默认的fastcgi
params配置文件： vi /etc
ginx/fastcgi_
params 在文件的最后增加两行：
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
fastcgi_param PATH_INFO $fastcgi_script_name;
然后重启一下服务：
service php5-fpm reload service nginx reload

//重新加载各项配置改动。
