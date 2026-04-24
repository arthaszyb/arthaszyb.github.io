---
title: "windows+apache2.x+PHP5.3+fcgid fastcgi运行配置"
date: 2014-11-14 15:03:03 +0000
categories: ["Apache"]
tags: []
description: "博客分类： Apache 一、mod_fcgid概念说明以及mod_fastcgi和mod_fcgid的区别 mod_fcgid是一个跟mod_fastcgi二进制兼容的Apache module。 原来的mod_fastcgi因为实现方式的限制，所以可能会创建了很多不必要的进程，而实际上只需要更少的进程就能处理同样的"
source: "evernote-local-db"
---

windows+apache2.x+PHP5.3+fcgid fastcgi运行配置
博客分类：

Apache

一、mod_fcgid概念说明以及mod_fastcgi和mod_fcgid的区别
mod_fcgid是一个跟mod_fastcgi二进制兼容的Apache module。
原来的mod_fastcgi因为实现方式的限制，所以可能会创建了很多不必要的进程，而实际上只需要更少的进程就能处理同样的请求。 mod_fastcgi的另外一个问题是每一个CGI的多个进程都共享同一个管道文件，所有到同一个fastcgi的通讯都通过这个同名的管道文件进行， 这样当出现通讯错误的时候，根本不知道正在通讯的是哪一个fastcgi，于是也没有办法将这个有问题的进程杀死。
mod_fcgid尝试使用共享内存来解决这个问题。共享内存里面有当前每个fastcgi进程的信息（包括进程号，进程使用的管道文件名等），当 每次尝试请求fastcgi工作的时候，Apache将会首先在共享内存里面查询，只有在共享内存里面发现确实没有足够的fastcgi进程了，才会创建 新的进程，这样可以保证当前创建的进程数量刚好能够处理客户的请求。另外，由于每一个fastcgi进程使用不同名称的管道文件，所以可以在通讯失败的时 候知道到底哪个fastcgi进程有问题，而能够尽早的将其剔除。
二、程序实现的目标
1、跟mod_fastcgi二进制兼容
只要在Apache中用mod_fcgid替换了mod_fastcgi，就能工作。原来的fastcgi程序不用重新编译，立即可以工作。
2、更严格的控制进程的创建
Apache中每一个request handler都能通过共享内存知道当前系统fastcgi运行的情况，这样可以防止过度的创建fastcgi进程，无谓的消耗系统的资源。
3、简单清晰的进程创建速度控制策略
每一个fastcgi都会维护一个计数器，这个计数器在程序创建和程序结束的时候都会增加，而这个计数器每秒会减1，直到0。当计数器的值高于某个阀值的时候，程序就会停止创建，直到计数器的值回落。这样既可以保证在请求突然增多的时候能够快速反应（特别是Apache刚启动，需要大量创建程序的时 候），也能保证当fastcgi程序有问题，不断重起的时候，重起的速度不会过高而消耗过多的系统资源。
4、自动检测出有问题的进程
因为每个fastcgi使用自己特定的管道文件，所以在通讯错误的时候可以轻易知道哪一个程序出现问题，而尽早的将其剔除。
5、可移植性
遵照Apache2的习惯，所有可移植的代码都放到一起，所有不可移植的代码都在arch目录下分开存放。当前已经测试过的系统包括 Linux , FreeBSD(已经包含入FreeBSD4和FreeBSD5的port中), Solaris, Windows 2000.
6、支持FastCGI方式运行的PHP
可以直接支持以FastCGI方式运行的PHP。因为PHP现在还不能保证所有的扩展代码都是线程安全的，所以并不建议在Apache2的线程模式 下使用mod_php。而以FastCGI方式运行的PHP则是其中一个解决办法。另外，使用mod_fcgi还可以在不修改任何PHP代码的情况下，获得数据库连接池的功能，大大减少PHP进程到数据库的连接。
三、mod_fcgid配置说明
1、首先下载
mod_fcgid-2.3.5-win32-x86.zip
，将解压的“mod_fcgid.so”文件复制到apache的“modules”目录；
http://www.apachelounge.com/download/
2、打开apache的配置文件“httpd.conf”，文件最后加入如下配置：
LoadModule fcgid_module modules/mod_fcgid.so
<
IfModule mod_fcgid.c>
AddHandler fcgid-script .fcgi .php
#php.ini的存放目录
FcgidInitialEnv PHPRC "c:/xampp/php"
# 设置PHP_FCGI_MAX_REQUESTS大于或等于FcgidMaxRequestsPerProcess，防止php-cgi进程在处理完所有请求前退出
FcgidInitialEnv PHP_FCGI_MAX_REQUESTS 1000
#php-cgi每个进程的最大请求数
FcgidMaxRequestsPerProcess 1000
#php-cgi最大的进程数
FcgidMaxProcesses 5
#最大执行时间
FcgidIOTimeout 120
FcgidIdleTimeout 120
#php-cgi的路径
FcgidWrapper "c:/xampp/php/php-cgi.exe" .php
AddType application/x-httpd-php .php
<
/IfModule>

3.告诉APACHE执行方式。修改你的配置如下。

<
Directory "C:/www">

Options FollowSymLinks ExecCGI

Order allow,deny

Allow from all

AllowOverride All

<
/Directory>
4、重启apache即可

5.如果安装没错的话，你应该可以看到这个。
