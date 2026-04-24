---
title: "Nginx虚拟主机根据不同的域名使用不同的root路径"
date: 2015-08-24 10:12:58 +0000
categories: ["Nginx [2]"]
tags: ["Pages"]
description: "Monday, August 24, 2015 10:12 AM [日期：2015-03-14] 来源：Linux社区 作者：john88wang [字体：大 中 小] 一 应用场景描述 应开发同事需求，需要在开发环境的Nginx能够根据不同的域名使用不同的root路径。 例如如果域名是linuxidc4.linuxi"
source: "evernote-local-db"
---

Nginx虚拟主机根据不同的域名使用不同的root路径
Monday, August 24, 2015
10:12 AM
Nginx虚拟主机根据不同的域名使用不同的root路径
[日期：2015-03-14]
来源：Linux社区 作者：john88wang
[字体：大 中 小]
一 应用场景描述

应开发同事需求，需要在开发环境的Nginx能够根据不同的域名使用不同的root路径。
例如如果域名是linuxidc4.linuxidc.com,就使用root路径为/data/public/linuxidc4
linuxidc5.linuxidc.com,就使用root路径为/data/public/linuxidc5
linuxidc6.linuxidc.com,就是用root路径为/data/public/linuxidc6
二 解决方法

server

{

listen 80;

server_name *.linuxidc.com;

set $linuxidc_name linuxidc4;

if ($host ~ "linuxidc5")

{

set $linuxidc_name linuxidc5;

}

if ($host ~ "linuxidc6")

{

set $linuxidc_name linuxidc6;

}

root /data/public/$linuxidc_name/;

client_max_body_size 5m;

autoindex off;

location / {

if (!-e $request_filename){

rewrite /(.*) /index.php last;

}

index index.php;

autoindex off;

}

location ~ \.php$ {

fastcgi_pass 127.0.0.1:9000;

fastcgi_index index.php;

fastcgi_param SCRIPT_FILENAME $document_root/$fastcgi_script_name;

include fastcgi_params;

}

}
这里设置变量$linuxidc_name,然后在root路径中使用这个变量
三 相关Nginx指令介绍

1.set指令

用于定义一个变量，并为变量赋值

作用范围为if,location,server
如以上的

set $linuxidc_name linuxidc4;
2.if指令

if(condition) {...}

作用范围为

如：

if ($host ~ "linuxidc-taiwan-5")

{

set $linuxidc_name linuxidc5;

}
if指令用于检查一个条件是否符合，如果条件符合，则执行大括号内的内容。if指令不支持嵌套，不支持多个
&
&
或||
可以指定的条件为：

1）变量名

2）变量比较可以使用 =（等于）和!=（不等于）

3）正则表达式匹配可以使用 ~（区分大小写匹配）和 ~* （不区分大小写匹配）

!~ 和 !~* 则表示不匹配

4）-f和!-f 用来判断文件是否存在

5) -d和!-d 用来判断目录是否存在

6) -e和!-e 用来判断文件或目录是否存在

7）-x和!-x 用来判断文件是否可以执行
3）Nginx内置变量

$host 请求的主机名
$request_filename 请求的文件名
4）rewrite指令

rewrite regex replacement flag;

用来重定向URL
if (!-e $request_filename){

rewrite /(.*) /index.php last;

}
rewrite最后一项为标记位，Nginx支持的标记为有：

last 表示完成rewrite

permanent 返回301永久重定向，浏览器地址栏会显示跳转后的URL

break 本条规则匹配完成后，终止其他规则的匹配
redirect 返回302临时重定向

last和break完成URL的重定向，浏览器上的地址不会变，但在服务器端上的位置发生了变化。permanent和redirect用来实现URL跳转，浏览器地址栏会显示跳转后的URL。

使用alias指令时必须使用last指令，使用proxy_pass指令时必须使用break指令

已使用 Microsoft OneNote 2016 创建。
