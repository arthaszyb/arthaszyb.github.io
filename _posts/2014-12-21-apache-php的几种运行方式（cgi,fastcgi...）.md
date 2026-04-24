---
title: "apache php的几种运行方式（cgi,fastcgi...）"
date: 2014-12-21 15:05:54 +0000
categories: ["Apache"]
tags: []
description: "分类： 服务器 apache学习 2014-01-27 10:28 2358人阅读 评论 (0) 收藏 举报 apache php PHP的所有应用程序都是通过WEB服务器(如IIS或Apache)和PHP引擎程序解释执行完成的， 工作过程： (1)当用户在浏览器地址中输入要访问的PHP页面文件名，然后回车就会触发这个"
source: "evernote-local-db"
---

apache php的几种运行方式（cgi,fastcgi...）
分类：
服务器

apache学习
2014-01-27 10:28

2358人阅读

评论
(0)

收藏

举报
apache
php
PHP的所有应用程序都是通过WEB服务器(如IIS或Apache)和PHP引擎程序解释执行完成的，
工作过程：

(1)当用户在浏览器地址中输入要访问的PHP页面文件名，然后回车就会触发这个PHP请求，并将请求传送化支持PHP的WEB服务器。

(2)WEB服务器接受这个请求，并根据其后缀进行判断如果是一个PHP请求，WEB服务器从硬盘或内存中取出用户要访问的PHP应用程序，并将其发送给 PHP引擎程序。

(3)PHP引擎程序将会对WEB服务器传送过来的文件从头到尾进行扫描并根据命令从后台读取，处理数据，并动态地生成相应的HTML页面。

(4)PHP引擎将生成HTML页面返回给WEB服务器。WEB服务器再将HTML页面返回给客户端浏览器。
apache的运行阶段
Apache将请求处理循环分为11个阶段，依次是：Post-Read-Request，URI Translation，Header Parsing，Access Control，Authentication，Authorization，MIME Type Checking，FixUp，Response，Logging，CleanUp。
--------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------
最近搭建服务器，突然感觉lamp之间到底是怎么工作的，或者是怎么联系起来？平时只是写程序，重来没有思考过他们之间的工作原理，借这个机会赶集恶补一下这个知识。
l：即操作系统，也就是建立在电脑硬件基础上的最底层的东西，相当于：国家这个概念，而win或者linux就相当于不同的国家
a：就是web服务器，这个服务器 相当于国家领导人：主席，起到指导作用。
m：就是数据库，存储数据的地方，相当 银行
p：就是php，相当于下属，做事情的人
也就是说php是apache的一个外挂程序，必须依靠web服务器才可以运行。当客户端浏览器触发事件--->php程序提交到apache服务器---->apache服务器根据php程序的特点判断是php程序，提交给php引擎程序--->php引擎程序解析并读取数据库生成相应的页面
php引擎；像smarty就是，有自己的标签模式并可以解析这种标签 生成原生态的php程序
那么如何优化网站呢？
其实就是触发时间到生成相应的页面过程，这个时间差越小，用户体验越好，那么根绝上面几步，我们可以想到的优化方法就是：客户端提交的数据大小已经并发数量----- 都提交给apache服务器处理---apache分配给php引擎---php程序和读取数据库---输出
1：优化 客户端数据提交，不过当用户达到一定级别时候，这个数据还是很大的
2：优化 web服务器，主要是处理高并发的性能
3：优化php引擎程序：samrty模版的引擎很不错
4：优化php程序：主要是数据库读取的方面和php自身程序效率
5：数据库优化:数据库的配置以及优化方式，达到与php读取效率的最完美匹配
6：输出优化：使用js等技术 ajax技术
--------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------
虚拟主机通常用fast-cgi或者php-cgi方式，因为可以把php程序和apache隔离开，防止虚拟主机的拥有者执行恶意程序。

apache handler（模块方式）的方式效率最高，但是php和apache运行在一个进程里面，所以php做什么事情都会影响apache。

如果你是自己的服务器，还是handler吧。
----------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------
一. 可以配置Apache将PHP解释器作为CGI脚本，或者作为Apache本身的一个模块(mod_php)，还有就是FastCGI模式来运行。
CGI是比较原始的方式，
Apache默认是以第二种方式运行PHP的
，而配置FastCGI模式需要下载安装相关的包。
性能上，CGI模式每一次接到请求会调用php.exe，解析php.ini，加载DLL等，速度自然慢。
后两种方式会在Web程序启动时就作为启动，等待请求；其中FastCGI下，实现了类似连接池的技术特性，保持了对后台的连接，请求到来即可使用，结束即断开准备与下一个请求连接。
实际中，有人认为FastCGI比mod_php模式慢，有认为前者是后者性能的80%的，还有人测试后认为：对于匿名访问，前者约为后者性能的63%，认证访问时也低了18%。一般认为，FastCGI是适用于高并发使用场景下的，同时使用FastCGI可以使得程序在Web Server产品与代码两端都具有更好的选择自由度。

二.Nginx默认不支持CGI模式，它是以FastCGI方式运行的。所以使用Nginx+PHP就是直接配置为FastCGI模式。
For the most part, lack of CGI support in Nginx is not an issue and actually has an important side-benefit: because Nginx cannot directly execute external programs (CGI), a malicious person can't trick your system into uploading and executing an arbitrary script.

http://wiki.nginx.org/SimpleCGI
（ 修改为CGI模式）
---------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------------
php
在
apache
中一共有三种工作方式：
CGI
模式
、
Apache
模块
DLL
、
FastCGI
模式
)
以下分别比较：
1. CGI
模式与模块模式比较：
php
在
apache
中两种工作方式的区别
(CGI
模式、
Apache
模块
DLL)
这两种工作方式的安装：
PHP
在
Apache 2.0
中的
CGI
方式

ScriptAlias /php/ "c:/php/"

AddType application/x-httpd-php .php
#
对
PHP 4
用这行

Action application/x-httpd-php "/php/php.exe"
#
对
PHP 5
用这行

Action application/x-httpd-php "/php/php-cgi.exe"

PHP
在
Apache 2.0
中的模块方式

#
对
PHP 4
用这两行：

LoadModule php4_module "c:/php/php4apache2.dll"

#
别忘了从
sapi
目录中把
php4apache2.dll
拷贝出来！

AddType application/x-httpd-php .php

#
对
PHP 5
用这两行：

LoadModule php5_module "c:/php/php5apache2.dll"

AddType application/x-httpd-php .php
#
配置
php.ini
的路径

PHPIniDir "C:/php"
这两种工作方式的区别：
在
CGI
模式下，如果客户机请求一个
php
文件，
Web
服务器就调用
php.exe
去解释这个文件，然后再把解释的结果以网页的形式返回给客户机；
而在模块化
(DLL)
中，
PHP
是与
Web
服务器一起启动并运行的。
所以从某种角度上来说，以
apache
模块方式安装的
PHP4
有着比
CGI
模式更好的安全性以及更好的执行效率和速度。
2. FastCGI
运行模式分析：
FastCGI
的工作原理是：
(1)
、
Web Server
启动时载入
FastCGI
进程管理器
【
PHP
的
FastCGI
进程管理器是
PHP-FPM(php-FastCGI Process Manager)
】
（
IIS ISAPI
或
Apache Module
)
;

(2)
、
FastCGI
进程管理器自身初始化，启动多个
CGI
解释器进程
(
在任务管理器中可见多个
php-cgi.exe)
并等待来自
Web Server
的连接。

(3)
、当客户端请求到达
Web Server
时，
FastCGI
进程管理器选择并连接到一个
CGI
解释器。
Web server
将
CGI
环境变量和标准输入发送到
FastCGI
子进程
php-cgi.exe
。

(4)
、
FastCGI
子进程完成处理后将标准输出和错误信息从同一连接返回
Web Server
。当
FastCGI
子进程关闭连接时，请求便告处理完成。
FastCGI
子进程接着等待并处理来自
FastCGI
进程管理器（运行在
WebServer
中）的下一个连接。

在正常的
CGI
模式中，
php-cgi.exe
在此便退出了。
在上述情况中，你可以想象
CGI
通常有多慢。每一个
Web
请求
PHP
都必须重新解析
php.ini
、重新载入全部
dll
扩展并重初始化全部数据结构。使用
FastCGI
，所有这些

都只在进程启动时发生一次。一个额外的好处是，持续数据库连接
(Persistent database connection)
可以工作。

3.
为什么要使用
FastCGI
，而不是多线程
CGI
解释器？
这可能出于多方面的考虑，例如：
(1)
、你无论如何也不能在
windows
平台上稳定的使用多线程
CGI
解释器，无论是
IIS ISAPI
方式还是
APACHE Module
方式，它们总是运行一段时间就崩溃了。奇怪么？但是确实存在这样的情况！
当然，也有很多时候你能够稳定的使用多线程
CGI
解释器，但是，你有可能发现网页有时候会出现错误，无论如何也找不到原因，而换用
FastCGI
方式

时这种错误的概率会大大的降低。我也不清楚这是为什么，我想独立地址空间的
CGI
解释器可能终究比共享地址空间的形式来得稳定一点点。
(2)
、性能！性能？可能么，难道
FastCGI
比多线程
CGI
解释器更快？但有时候确实是这样，只有测试一下你的网站，才能最后下结论。原因嘛，我觉得

很难讲，但有资料说在
Zend WinEnabler
的时代，
Zend
原来也是建议在
Windows
平台下使用
FastCGI
而不是
IIS ISAPI
或
Apache Module
，不过现在
Zend
已经不做这个产品了。

4. FastCGI
模式运行
PHP
的优点：
以
FastCGI
模式运行
PHP
有几个主要的好处。首先就是
PHP
出错的时候不会搞垮
Apache
，只是
PHP
自己的进程当掉（但
FastCGI
会立即重新启动一个新
PHP
进程来代替当掉的进程）。其次
FastCGI
模式运行
PHP
比
ISAPI
模式性能更好（我本来用
ApacheBench
进行了测试，但忘了保存结果，大家有兴趣可以自己测试）。
最后，就是可以同时运行
PHP5
和
PHP4
。参考下面的配置文件，分别建立了两个虚拟主机，其中一个使用
PHP5
，另一个使用
PHP4
。
LoadModule fastcgi_module modules/mod_fastcgi-2.4.2-AP13.dll
ScriptAlias /fcgi-php5/ "d:/usr/local/php-5.0.4/"
FastCgiServer "d:/usr/local/php-5.0.4/php-cgi.exe" -processes 3
ScriptAlias /fcgi-php4/ "d:/usr/local/php-4.3.11/"
FastCgiServer "d:/usr/local/php-4.3.11/php.exe"
Listen 80
NameVirtualHost *:80
DocumentRoot d:/www
Options Indexes FollowSymlinks MultiViews
ServerName php5.localhost
AddType application/x-httpd-fastphp5 .php
Action application/x-httpd-fastphp5 "/fcgi-php5/php-cgi.exe"

IndexOptions FancyIndexing FoldersFirst
Options Indexes FollowSymLinks MultiViews
AllowOverride None
Order allow,deny
Allow from all

Listen 8080
NameVirtualHost *:8080

DocumentRoot d:/www
Options Indexes FollowSymlinks MultiViews
ServerName php4.localhost
AddType application/x-httpd-fastphp4 .php
Action application/x-httpd-fastphp4 "/fcgi-php4/php.exe"

Options Indexes FollowSymLinks MultiViews
AllowOverride None
Order allow,deny
Allow from all

使用上面的配置，访问
http://localhost/
就使用
PHP5
，而访问
http://localhost:8080/
就使用
PHP4
。所以只要合理配置，就可以让不同的虚拟主机使用不同版本的
PHP
。
FastCGI
模式的一些缺点：
说完了好处，也来说说缺点。从我的实际使用来看，用
FastCGI
模式更适合生产环境的服务器。但对于开发用机器来说就不太合适。因为当使用
Zend Studio
调试程序时，由于
FastCGI
会认为
PHP
进程超时，从而在页面返回
500
错误。这一点让人非常恼火，所以我在开发机器上还是换回了
ISAPI
模式。
最后，在
Windows
中以
FastCGI
模式存在潜在的安

二
、
php
在
nginx
中运行模式
(nginx+PHP-FPM )
目前理想选择

使用
FastCGI
方式现在常见的有两种
stack
：
ligthttpd+spawn-fcgi;
另外一种是
nginx+PHP-FPM(
也可以用
spawn-fcgi)
。
(1)
如上面所说该两种结构都采用
FastCGI
对
PHP
支持，因此
HTTPServer
完全解放出来，可以更好地进行响应和并发处理。因此
lighttpd
和
nginx
都有
small, but powerful
和
efficient
的美誉。

(2)
该两者还可以分出一个好坏来，
spawn-fcgi
由于是
lighttpd
的一部分，因此安装了
lighttpd
一般就会使用
spawn-fcgi
对
php
支持，但是目前有用户说
ligttpd
的
spwan-fcgi
在高并发访问的时候，会出现上面说的内存泄漏甚至自动重启
fastcgi
。即：
PHP
脚本处理器当机，这个时候如果用户访问的话，可能就会出现白页
(
即
PHP
不能被解析或者出错
)
。

另一个：首先
nginx
不像
lighttpd
本身含带了
fastcgi(spawn-fcgi)
，因此它完全是轻量级的，必须借助第三方的
FastCGI
处理器才可以对
PHP
进行解析，因此其实这样看来
nginx
是非常灵活的，它可以和任何第三方提供解析的处理器实现连接从而实现对
PHP
的解析
(
在
nginx.conf
中很容易设置
)
。

nginx
可以使用
spwan-fcgi(
需要一同安装
lighttpd
，但是需要为
nginx
避开端口，一些较早的
blog
有这方面安装的教程
)
，但是由于
spawn-fcgi
具有上面所述的用户逐渐发现的缺陷，现在慢慢减少使用
nginx+spawn-fcgi
组合了。

c.
由于
spawn-fcgi
的缺陷，现在出现了新的第三方
(
目前还是，听说正在努力不久将来加入到
PHP core
中
)
的
PHP
的
FastCGI
处理器，叫做
PHP-FPM(
具体可以
google)
。它和
spawn-fcgi
比较起来有如下优点：

由于它是作为
PHP
的
patch
补丁来开发的，安装的时候需要和
php
源码一起编译，也就是说编译到
php core
中了，因此在性能方面要优秀一些；
同时它在处理高并发方面也优于
spawn-fcgi
，至少不会自动重启
fastcgi
处理器。具体采用的算法和设计可以
google
了解。

因此，如上所说由于
nginx
的轻量和灵活性，因此目前性能优越，越来越多人逐渐使用这个组合：
nginx+PHP/PHP-FPM
三、
IIS+ ISAPI
模式
这种模式适合开发环境中，

生产环境中用的较少。

四、
总结
目前在
HTTPServer
这块基本可以看到有三种
stack
比较流行：
（1）Apache+mod_php5

（2）lighttp+spawn-fcgi

（3）nginx+PHP-FPM
三者后两者性能可能稍优，但是
Apache
由于有丰富的模块和功能，目前来说仍旧是老大。有人测试
nginx+PHP-FPM
在高并发情况下可能会达到
Apache+mod_php5
的
5~10
倍，现在
nginx+PHP-FPM
使用的人越来越多。
