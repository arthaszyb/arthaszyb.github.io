---
title: 修改PHP上传文件大小限制
date: '2015-02-01'
description: >-
  HTML Content 修改PHP上传文件大小限制 Sunday, February 1, 2015 10:33 PM 分类：
  PHP常用类2013-02-18 13:43 234人阅读 评论(0) 收藏 举报
  <table<tbody<tr<td<div<table<tbody<tr<td<p
category: php
tags:
  - php
draft: false
source: evernote-local-db
lang: zh
---
HTML Content

修改PHP上传文件大小限制

Sunday, February 1, 2015

10:33 PM

# [修改PHP上传文件大小限制](http://blog.csdn.net/a519640026/article/details/8587635)

分类： [PHP常用类](http://blog.csdn.net/a519640026/article/category/1357398)2013-02-18 13:43 234人阅读 [评论](http://blog.csdn.net/a519640026/article/details/8587635#comments)(0) 收藏 [举报](http://blog.csdn.net/a519640026/article/details/8587635#report)

<table><tbody><tr><td><div><table><tbody><tr><td><p style="margin:0in;font-family:"Microsoft YaHei";font-size:11.0pt">摘要：修改PHP上传文件大小限制，上传大文件！</p></td></tr></tbody></table></div></td></tr><tr><td></td></tr><tr><td><p>PHP上传文件默认一般都是有限制的，有的时候我们需要上传打的文件，那么怎么修改PHP上传限制的大小呢<br>1. 一般的php文件上传,除非文件很小.就像一个5M的文件,很可能要超过一分钟才能上传完.<br>但在php中,默认的该页最久执行时间为 30 秒.就是说超过30秒,该脚本就停止执行.<br>这就导致出现 无法打开网页的情况.这时我们可以修改 max_execution_time<br>在php.ini里查找<br>max_execution_time<br><br>默认是30秒.改为<br>max_execution_time = 0<br>0表示没有限制<br>以上修改的是php上传文件中脚本执行超时时间<br>2. 修改 post_max_size 设定 POST 数据所允许的最大大小。此设定也影响到php上传文件。<br>php默认的post_max_size 为2M.如果 POST 数据尺寸大于 post_max_size $_POST 和 $_FILES superglobals 便会为空.<br>查找 post_max_size .改为<br>post_max_size = 150M<br><br>3. 很多人都会改了第二步.但php上传文件时最大仍然为 8M.<br>为什么呢.我们还要改一个参数upload_max_filesize 表示所上传的文件的最大大小。<br>查找upload_max_filesize,默认为8M改为<br>upload_max_filesize = 100M<br>另外要说明的是在php文件上传中,post_max_size 大于 upload_max_filesize 为佳.<br>对php文件上传有所需求的朋友可以参考下以上的设置！</p></td></tr></tbody></table>

<table><tbody><tr><td><div><table><tbody><tr><td><p style="margin:0in;font-family:"Microsoft YaHei";font-size:11.0pt">摘要：修改PHP上传文件大小限制，上传大文件！</p></td></tr></tbody></table></div></td></tr><tr><td></td></tr><tr><td><p>PHP上传文件默认一般都是有限制的，有的时候我们需要上传打的文件，那么怎么修改PHP上传限制的大小呢<br>1. 一般的php文件上传,除非文件很小.就像一个5M的文件,很可能要超过一分钟才能上传完.<br>但在php中,默认的该页最久执行时间为 30 秒.就是说超过30秒,该脚本就停止执行.<br>这就导致出现 无法打开网页的情况.这时我们可以修改 max_execution_time<br>在php.ini里查找<br>max_execution_time<br><br>默认是30秒.改为<br>max_execution_time = 0<br>0表示没有限制<br>以上修改的是php上传文件中脚本执行超时时间<br>2. 修改 post_max_size 设定 POST 数据所允许的最大大小。此设定也影响到php上传文件。<br>php默认的post_max_size 为2M.如果 POST 数据尺寸大于 post_max_size $_POST 和 $_FILES superglobals 便会为空.<br>查找 post_max_size .改为<br>post_max_size = 150M<br><br>3. 很多人都会改了第二步.但php上传文件时最大仍然为 8M.<br>为什么呢.我们还要改一个参数upload_max_filesize 表示所上传的文件的最大大小。<br>查找upload_max_filesize,默认为8M改为<br>upload_max_filesize = 100M<br>另外要说明的是在php文件上传中,post_max_size 大于 upload_max_filesize 为佳.<br>对php文件上传有所需求的朋友可以参考下以上的设置！</p></td></tr></tbody></table>
