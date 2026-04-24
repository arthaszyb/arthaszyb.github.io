---
title: "Web服务器和动态语言如何交互--CGI&FastCGI&FPM浅谈"
date: 2015-09-16 07:56:01 +0000
categories: ["PHP"]
tags: []
description: "Web服务器和动态语言如何交互--CGI & FastCGI & FPM浅谈 一个用户的Request是如何经过Web服务器（Apache，Nginx，IIS，Light）与后端的动态语言（如PHP等）进行交互并将结果返回给用户的呢？ 本文浅谈个人观点，可能有误，欢迎拍砖，共同学习。 一. 首先明确几个概念，以便后续说"
source: "evernote-local-db"
---

Web服务器和动态语言如何交互--CGI
&
FastCGI
&
FPM浅谈
一个用户的Request是如何经过Web服务器（Apache，Nginx，IIS，Light）与后端的动态语言（如PHP等）进行交互并将结果返回给用户的呢？
本文浅谈个人观点，可能有误，欢迎拍砖，共同学习。

一. 首先明确几个概念，以便后续说明
CGI：（Common Gateway Interface）Http服务器与后端程序（如PHP）进行交互的中间层。
工作原理及处理方式（fork-and-execute模式）：
1.当Web Server有Request到达
2.fork一个CGI进程或线程（配置管理，环境初始化）
3.执行后台脚本
4.将结果返回Web服务器。
5.Web服务器将结果返回给用户。
FastCGI：常驻型（long-live）CGI形式，经过激活后，不会每次都要花时间去fork。
工作原理及处理方式：
1.Web Server启动时载入FastCGI进程管理器（IIS ISAPI或Apache Module）
2.FastCGI进程管理器自身初始化，启动多个CGI解释器进程（可见多个php-cgi进程），并等待来自Web Server的连接
3.当有客户端请求到达Web Server时，FastCGI进程管理器选择并连接到一个CGI解释器；Web Server将CGI环境变量和标准输入发送到FastCGI子进程php-cgi。
4.FastCGI子进程完成处理后将标准输出和错误信息返回Web Server。当FastCGI子进程关闭连接时，请求便告知处理完成。子进程继续响应来自FastCGI进程管理器分配的其他请求。

PHP-FPM：只用于PHP的PHP FastCGI 进程管理器。
PHP5.3.3以后的版本已经集成了PHP-FPM了。
php-fpm提供了更好的PHP配置管理方式，可以有效控制内存和进程、可以平滑重载php配置。
./configure php源码的时候，加—enable-fpm参数可开启PHP_FMP。

Spawn-FCGI：一个普通的FastCGI进程管理器。

二. PHP中的CGI实现：
PHP的CGI实现本质上是以Socket编程实现一个TCP或者UDP协议服务器。当启动时， 创建TCP/UDP协议的服务器监听，并接受相关请求进行处理。
CGI的生命周期为：模块初始化；SAPI初始化；请求的处理；模块关闭；SAPI关闭；
以TCP协议为例，在TCP的服务端，会执行如下操作：
1.服务端调用Socket函数创建一个TCP用的流式套接字；
2.服务端调用bind函数将服务器的本地地址与前面创建的套接字绑定；
3.服务调用listen函数将新创建的套接字作为监听，等待客户端发起连接，当客户端有多个连接连接到这个套接字时，可能需要排队处理；
4.服务器调用accept函数进入阻塞状态，直到有客户进程调用connect函数而建立起一个连接；
5.当与客户端创建连接后，服务器调用read_stream函数读取客户的请求；
6.处理完数据后，服务器调用write函数向客户端发送应答。

三.目前PHP的工作方式（以Apache服务器为例,因为Apache和Php是好兄弟嘛）
1.Apache Handler方式(php作为Apache服务器的Module)
一种改进的CGI方式，把PHP的解释模块编成so扩展，添加到Apache的modules中。
配置方式：
1.编译PHP时，加上如下参数：
cd php-source
./configure --prefix=/home/weiyanyan/local/php --with-apxs2=/home/weiyanyan/local/apache/bin/apxs --with-mysql
说明：—with-apxs2为apache中apxs相应目录，将在apache根目录下的modules下生成libphp5.so
2.在apache的配置文件http.conf中增加
LoadModule php5_module modules/libphp5.so
然后在
<
IfModule mime_module>节点下增加如下mime配置
AddType application/x-httpd-php .php

2.CGI模式
前提为不能以模块模式运行。（注释掉：LoadModule php5_module modules/libphp5.so）
在httpd.conf增加action:
Action application/x-httpd-php /cgi-bin/php-cgi
如果在/cgi目录找不到php-cgi，可从php的bin里面cp一个。
【可以写一个PHP脚本，让其sleep(20);运行之前看机器进程中无php-cgi进程，请求的时候，会有相应的进程产生。经测试一个php-cgi进程可以承载多个请求，具体未深究，因为这种方式已经基本没有人用了。】

3.FastCGI模式
FastCGI模式根据进程管理器的不同可以分为：Apache内置进程管理器，php-fpm进程管理器
Apache内置进程管理器：
mod_fastcgi的安装
#wget
http://www.fastcgi.com/dist/mod_fastcgi-2.4.6.tar.gz
# tar -zxvf mod_fastcgi-2.4.6.tar.gz
# cd mod_fastcgi-2.4.6
# cp Makefile.AP2 Makefile
# vim Makefile 将Makefile中的路径改成你的apache的安装路径
# make install 安装成功
安装成功后，会自动把mod_fastcgi.so复制到/usr/local/apache/modules目录

首先要添加fastcgi模块到httpd.conf配置文件：
LoadModule fastcgi_module modules/mod_fastcgi.so
这种模式注释不注释LoadModule php5_module modules/libphp5.so这行貌似没什么关系，只要配置了以下模块
<
IfModule fastcgi_module>

FastCgiServer
/home/weiyanyan/local/apache/cgi-bin/php-cgi -processes 20

AddType application/x-httpd-php .php
AddHandler php-fastcgi .php
Action php-fastcgi /cgi-bin/php-cgi

<
/IfModule>
就会自动走到fastcgi模式。
然后重启apache,这个时候用 ps aux|grep php就会发现有很多php-cgi进程在运行。说明配置生效.

FPM方式
首先要添加fastcgi模块到httpd.conf配置文件：
LoadModule fastcgi_module modules/mod_fastcgi.so
这种模式注释不注释LoadModule php5_module modules/libphp5.so这行貌似没什么关系，只要配置了以下模块
<
IfModule fastcgi_module>
FastCgiExternalServer
/home/weiyanyan/local/apache/cgi-bin/php-cgi -host 127.0.0.1:9000
AddType application/x-httpd-php .php
AddHandler php-fastcgi .php
Action php-fastcgi /cgi-bin/php-cgi

<
/IfModule>
其中在本机9000端口开启了PHP-Fpm服务
FPM的安装简单介绍如下：
cd php-source
./configure --prefix=/home/weiyanyan/local/php --with-apxs2=/home/weiyanyan/local/apache/bin/apxs --with-mysql --enable-fpm
此时在Php的根目录sbin下会有php-fpm运行程序，其配置文件在php根目录下面的/etc/php-fpm.conf
修改完配置，在apache配置对应的端口启动php-fpm即可。
