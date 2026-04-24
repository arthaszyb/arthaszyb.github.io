---
title: "本博客 Nginx 配置之性能篇 | JerryQu 的小站"
date: 2017-02-28 09:20:20 +0000
categories: ["Nginx [2]"]
tags: ["Pages"]
description: "星期二, 二月 28, 2017 9:20 上午 Nginx 配置之性能篇 文章目录 TCP 优化 开启 Gzip 开启缓存 服务端 客户端 使用 SPDY （ HTTP/2 ） HTTPS 优化 在介绍完我博客（ imququ.com ）的 Nginx 配置中 与安全有关的一些配置 后，这篇文章继续介绍与性能有关的一"
source: "evernote-local-db"
---

本博客 Nginx 配置之性能篇 | JerryQu 的小站
星期二, 二月 28, 2017
9:20 上午
Nginx

配置之性能篇
文章目录
TCP

优化
开启

Gzip
开启缓存
服务端
客户端
使用

SPDY
（
HTTP/2
）
HTTPS

优化
在介绍完我博客（
imququ.com
）的

Nginx

配置中
与安全有关的一些配置
后，这篇文章继续介绍与性能有关的一些配置。
WEB

性能优化是一个系统工程，涵盖很多方面，做好其中某个环节并不意味性能就能变好，但可以肯定地说，如果某个环节做得很糟糕，那么结果一定会变差。
首先说明下，本文提到的一些

Nginx

配置，需要较高版本

Linux

内核才支持。在实际生产环境中，升级服务器内核并不是一件容易的事，但为了获得最好的性能，有些升级还是必须的。很多公司服务器运维和项目开发并不在一个团队，一方追求稳定不出事故，另一方希望提升性能，本来就是矛盾的。好在我们折腾自己

VPS

时，可以无视这些限制。
TCP

优化
Nginx

关于

TCP

的优化基本都是修改系统内核提供的配置项，所以跟具体的

Linux

版本和系统配置有关，我对这一块还不是非常熟悉，这里只能简单介绍下：
NGINX
http {

sendfile

on;

tcp_nopush

on;

tcp_nodelay

on;
keepalive_timeout

60;

... ...

}
第一行的

sendfile

配置可以提高

Nginx

静态资源托管效率。
sendfile

是一个系统调用，直接在内核空间完成文件发送，不需要先

read

再

write
，没有上下文切换开销。
TCP_NOPUSH

是

FreeBSD

的一个

socket

选项，对应

Linux

的

TCP_CORK
，
Nginx

里统一用

tcp_nopush

来控制它，并且只有在启用了

sendfile

之后才生效。启用它之后，数据包会累计到一定大小之后才会发送，减小了额外开销，提高网络效率。
TCP_NODELAY

也是一个

socket

选项，启用后会禁用

Nagle

算法，尽快发送数据，某些情况下可以节约

200ms
（
Nagle

算法原理是：在发出去的数据还未被确认之前，新生成的小数据先存起来，凑满一个

MSS

或者等到收到确认后再发送）。
Nginx

只会针对处于

keep-alive

状态的

TCP

连接才会启用

tcp_nodelay
。
可以看到

TCP_NOPUSH

是要等数据包累积到一定大小才发送，
TCP_NODELAY

是要尽快发送，二者相互矛盾。实际上，它们确实可以一起用，最终的效果是先填满包，再尽快发送。
关于这部分内容的更多介绍可以看这篇文章：
NGINX OPTIMIZATION: UNDERSTANDING SENDFILE, TCP_NODELAY AND TCP_NOPUSH
。
配置最后一行用来指定服务端为每个

TCP

连接最多可以保持多长时间。
Nginx

的默认值是

75

秒，有些浏览器最多只保持

60

秒，所以我统一设置为

60
。
另外，还有一个

TCP

优化策略叫

TCP Fast Open
（
TFO
），这里先介绍下，配置在后面贴出。
TFO

的作用是用来优化

TCP

握手过程。客户端第一次建立连接还是要走三次握手，所不同的是客户端在第一个

SYN

会设置一个

Fast Open

标识，服务端会生成

Fast Open Cookie

并放在

SYN-ACK

里，然后客户端就可以把这个

Cookie

存起来供之后的

SYN

用。下面这个图形象地描述了这个过程：
关于

TCP Fast Open

的更多信息，可以查看

RFC7413
，或者这篇文章：
Shaving your RTT with TCP Fast Open
。需要注意的是，现阶段只有

Linux
、
ChromeOS

和

Android 5.0

的

Chrome / Chromium

才支持

TFO
，所以实际用途并不大。
5

月

26

日发布的

Nginx 1.9.1
，增加了

reuseport

功能，意味着

Nginx

也开始支持

TCP

的

SO_REUSEPORT

选项了。这里也先简单介绍下，具体配置方法后面统一介绍。启用这个功能后，
Nginx

会在指定的端口上监听多个

socket
，每个

Worker

都能分到一个。请求过来时，系统内核会自动通过不同的

socket

分配给对应的

Worker
，相比之前的单

socket

多

Worker

的模式，提高了分发效率。下面这个图形象地描述了这个过程：
有关这部分内容的更多信息，可以查看

Nginx

的官方博客：
Socket Sharding in NGINX Release 1.9.1
。
开启

Gzip
我们在上线前，代码（
JS
、
CSS

和

HTML
）会做压缩，图片也会做压缩（
PNGOUT
、
Pngcrush
、
JpegOptim
、
Gifsicle

等）。对于文本文件，在服务端发送响应之前进行

GZip

压缩也很重要，通常压缩后的文本大小会减小到原来的

1/4 - 1/3
。下面是我的配置：
NGINX
http {

gzip

on;

gzip_vary

on;
gzip_comp_level

6;

gzip_buffers

16 8k;
gzip_min_length

1000;

gzip_proxied

any;

gzip_disable

"msie6";
gzip_http_version

1.0;
gzip_types

text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;

... ...

}
这部分内容比较简单，只有两个地方需要解释下：
gzip_vary

用来输出

Vary

响应头，用来解决某些缓存服务的一个问题，详情请看我之前的博客：
HTTP

协议中

Vary

的一些研究
。
gzip_disable

指令接受一个正则表达式，当请求头中的

UserAgent

字段满足这个正则时，响应不会启用

GZip
，这是为了解决在某些浏览器启用

GZip

带来的问题。特别地，指令值

msie6

等价于

MSIE [4-6]\.
，但性能更好一些。另外，
Nginx 0.8.11

后，
msie6

并不会匹配

UA

包含

SV1

的

IE6
（例如

Windows XP SP2

上的

IE6
），因为这个版本的

IE6

已经修复了关于

GZip

的若干

Bug
。
默认

Nginx

只会针对

HTTP/1.1

及以上的请求才会启用

GZip
，因为部分早期的

HTTP/1.0

客户端在处理

GZip

时有

Bug
。现在基本上可以忽略这种情况，于是可以指定

gzip_http_version 1.0

来针对

HTTP/1.0

及以上的请求开启

GZip
。
开启缓存
优化代码逻辑的极限是移除所有逻辑；优化请求的极限是不发送任何请求。这两点通过缓存都可以实现。
服务端
我的博客更新并不频繁，评论部分也早就换成了

Disqus
，所以完全可以将页面静态化，这样就省掉了所有代码逻辑和数据库开销。实现静态化有很多种方案，我直接用的是

Nginx

的

proxy_cache
（注：本博客为了做更精细的静态化，已经将缓存逻辑挪到

Web

应用里实现了）：
NGINX
proxy_cache_path

/home/jerry/cache
ginx/proxy_cache_path levels=1:2 keys_zone=pnc:300m inactive=7d max_size=10g;

proxy_temp_path

/home/jerry/cache
ginx/proxy_temp_path;

proxy_cache_key

$host$uri$is_args$args;
server {

location / {

resolver

127.0.0.1;

proxy_cache

pnc;

proxy_cache_valid

200 304 2h;

proxy_cache_lock

on;

proxy_cache_lock_timeout

5s;

proxy_cache_use_stale

updating error timeout invalid_header http_500 http_502;
proxy_http_version

1.1;
proxy_ignore_headers

Set-Cookie;

... ...

}

... ...

}
首先，在配置最外层定义一个缓存目录，并指定名称（
keys_zone
）和其他属性，这样在配置

proxy_pass

时，就可以使用这个缓存了。这里我对状态值等于

200

和

304

的响应缓存了

2

小时。
默认情况下，如果响应头里有

Set-Cookie

字段，
Nginx

并不会缓存这次响应，因为它认为这次响应的内容是因人而异的。我的博客中，这个

Set-Cookie

对于用户来说没有用，也不会影响输出内容，所以我通过配置

proxy_ignore_header

移除了它。
客户端
服务端在输出响应时，可以通过响应头输出一些与缓存有关的信息，从而达到少发或不发请求的目的。
HTTP/1.1

的缓存机制稍微有点复杂，这里简单介绍下：
首先，服务端可以通过响应头里的

Last-Modified
（最后修改时间） 或者

ETag
（内容特征） 标记实体。浏览器会存下这些标记，并在下次请求时带上

If-Modified-Since:

上次

Last-Modified

的内容

或

If-None-Match:

上次

ETag

的内容
，询问服务端资源是否过期。如果服务端发现并没有过期，直接返回一个状态码为

304
、正文为空的响应，告知浏览器使用本地缓存；如果资源有更新，服务端返回状态码

200
、新的

Last-Modified
、
Etag

和正文。这个过程被称之为

HTTP

的协商缓存，通常也叫做弱缓存。
可以看到协商缓存并不会节省连接数，但是在缓存生效时，会大幅减小传输内容（
304

响应没有正文，一般只有几百字节）。另外为什么有两个响应头都可以用来实现协商缓存呢？这是因为一开始用的

Last-Modified

有两个问题：
1
）只能精确到秒，
1

秒内的多次变化反映不出来；
2
）时间采用绝对值，如果服务端

/

客户端时间不对都可能导致缓存失效在轮询的负载均衡算法中，如果各机器读到的文件修改时间不一致，有缓存无故失效和缓存不更新的风险。
HTTP/1.1

并没有规定

ETag

的生成规则，而一般实现者都是对资源内容做摘要，能解决前面两个问题。
另外一种缓存机制是服务端通过响应头告诉浏览器，在什么时间之前（
Expires
）或在多长时间之内（
Cache-Control: Max-age=xxx
），不要再请求服务器了。这个机制我们通常称之为

HTTP

的强缓存。
一旦资源命中强缓存规则后，再次访问完全没有

HTTP

请求（
Chrome

开发者工具的

Network

面板依然会显示请求，但是会注明

from cache
；
Firefox

的

firebug

也类似，会注明

BFCache
），这会大幅提升性能。所以我们一般会对

CSS
、
JS
、图片等资源使用强缓存，而入口文件（
HTML
）一般使用协商缓存或不缓存，这样可以通过修改入口文件中对强缓存资源的引入

URL

来达到即时更新的目的。
这里也解释下为什么有了

Expires
，还要有

Cache-Control
。也有两个原因：
1
）
Cache-Control

功能更强大，对缓存的控制能力更强；
2
）
Cache-Control

采用的

max-age

是相对时间，不受服务端

/

客户端时间不对的影响。
另外关于浏览器的刷新（
F5 / cmd + r
）和强刷（
Ctrl + F5 / shift + cmd +r
）：普通刷新会使用协商缓存，忽略强缓存；强刷会忽略浏览器所有缓存（并且请求头会携带

Cache-Control:no-cache

和

Pragma:no-cache
，用来通知所有中间节点忽略缓存）。只有从地址栏或收藏夹输入网址、点击链接等情况下，浏览器才会使用强缓存。
默认情况下，
Nginx

对于静态资源都会输出

Last-Modified
，而

ETag
、
Expires

和

Cache-Control

则需要自己配置：
location

~ ^/static/

{

root

/home/jerry/www/blog/www;

etag

on
;

expires

max;

}
expires

指令可以指定具体的

max-age
，例如

10y

代表

10

年，如果指定为

max
，最终输出的

Expires

会是

2037

年最后一天，
Cache-Control

的

max-age

会是

10

年（准确说是

3650

天，
315360000

秒）。
使用

SPDY
（
HTTP/2
）
我的博客之前多次讲到过

HTTP/2
（
SPDY
），现阶段

Nginx

只支持

SPDY/3.1
，这样配置就可以启用了（编译

Nginx

时需要加上

--with-http_spdy_module

和

--with-http_ssl_module
）：
server {

listen

443 ssl spdy fastopen=3 reuseport;

spdy_headers_comp

6;

... ...

}
那个

fastopen=3

用来开启前面介绍过的

TCP Fast Open

功能。
3

代表最多只能有

3

个未经三次握手的

TCP

链接在排队。超过这个限制，服务端会退化到采用普通的

TCP

握手流程。这是为了减少资源耗尽攻击：
TFO

可以在第一次

SYN

的时候发送

HTTP

请求，而服务端会校验

Fast Open Cookie
（
FOC
），如果通过就开始处理请求。如果不加限制，恶意客户端可以利用合法的

FOC

发送大量请求耗光服务端资源。
reuseport

就是用来启用前面介绍过的

TCP SO_REUSEPORT

选项的配置。
HTTPS

优化
建立

HTTPS

连接本身就慢（多了获取证书、校验证书、
TLS

握手等等步骤），如果没有优化好只能是慢上加慢。
NGINX
server {

ssl_session_cache

shared:SSL:10m;

ssl_session_timeout

60m;
ssl_session_tickets

on;
ssl_stapling

on;

ssl_stapling_verify

on;

ssl_trusted_certificate

/xxx/full_chain.crt;
resolver

8.8.4.4 8.8.8.8

valid=300s;

resolver_timeout

10s;

... ...

}
我的这部分配置就两部分内容：
TLS

会话恢复和

OCSP stapling
。
TLS

会话恢复的目的是为了简化

TLS

握手，有两种方案：
Session Cache

和

Session Ticket
。他们都是将之前握手的

Session

存起来供后续连接使用，所不同是

Cache

存在服务端，占用服务端资源；
Ticket

存在客户端，不占用服务端资源。另外目前主流浏览器都支持

Session Cache
，而

Session Ticket

的支持度一般。
ssl_stapling

开始的几行用来配置

OCSP stapling

策略。浏览器可能会在建立

TLS

连接时在线验证证书有效性，从而阻塞

TLS

握手，拖慢整体速度。
OCSP stapling

是一种优化措施，服务端通过它可以在证书链中封装证书颁发机构的

OCSP
（
Online Certificate Status Protocol
）响应，从而让浏览器跳过在线查询。服务端获取

OCSP

一方面更快（因为服务端一般有更好的网络环境），另一方面可以更好地缓存。有关

OCSP stapling

的详细介绍，可以
看这里
。
这些策略设置好之后，可以通过

Qualys SSL Server Test

这个工具来验证是否生效，例如下图就是本博客的测试结果（
via
）：
在给

Nginx

指定证书时，需要选择合适的证书链。因为浏览器在验证证书信任链时，会从站点证书开始，递归验证父证书，直至信任的根证书。这里涉及到两个问题：
1
）服务器证书是在握手期间发送的，由于

TCP

初始拥塞窗口的存在，如果证书太长很可能会产生额外的往返开销；
2
）如果服务端证书没包含中间证书，大部分浏览器可以正常工作，但会暂停验证并根据子证书指定的父证书

URL

自己获取中间证书。这个过程会产生额外的

DNS

解析、建立

TCP

连接等开销。配置服务端证书链的最佳实践是包含
站点证书
和
中间证书
两部分。有的证书提供商签出来的证书级别比较多，这会导致证书链变长，选择的时候需要特别注意。
好了，我的博客关于安全和性能两部分

Nginx

配置终于都写完了。实际上很多策略没办法严格区分是为了安全还是性能，比如

HSTS

和

CHACHA20_POLY1305
，两方面都有考虑，所以写的时候比较纠结，早知道就合成一篇来写了。
本文链接：
https://imququ.com/post/my-nginx-conf-for-wpo.html
，
参与评论

»
--EOF--
发表于

2015-05-27 02:46:20
，并被添加「
Nginx
、
性能优化
」标签，最后修改于

2015-05-28 19:13:47
。
查看本文

Markdown

版本

»
本站使用「
署名

4.0

国际
」创作共享协议，
相关说明

»
提醒：本文最后更新于
641
天前，文中所描述的信息可能已发生改变，请谨慎使用。
专题「
Web

服务器」的其他文章

»
HTTPS

常见部署问题及解决方案

(Dec 12, 2016)
开始使用

VeryNginx

(Dec 10, 2016)
开始使用

ECC

证书

(Aug 27, 2016)
为什么我们应该尽快升级到

HTTPS
？

(May 16, 2016)
本博客

Nginx

配置之完整篇

(Mar 21, 2016)
从无法开启

OCSP Stapling

说起

(Mar 13, 2016)
Certificate Transparency

那些事

(Feb 03, 2016)
Let's Encrypt
，免费好用的

HTTPS

证书

(Dec 25, 2015)
从

Nginx

默认不压缩

HTTP/1.0

说起

(Dec 15, 2015)
TLS

握手优化详解

(Nov 08, 2015)
«

本博客

Nginx

配置之安全篇
使用两步验证提高账号安全性

»
Comments
40 Comments
点击发表新评论
（
尝试评论完整模式
）
瑞瑞

•

3个月前

•

回复

你好，我按照您的配置做了nginx的设置， 可是我访问自己nginx默认页 wellcome to nginx ， 哪怕不握手也要400MS ，您可以抽空用两分钟时间帮我看一下吗？
https://www.ruiruige1991.xyz
Jerry Qu

•

3个月前

•

回复

你这确实好慢，服务器在阿里云香港？
瑞瑞

•

3个月前

•

回复

是的
yaung

•

6个月前

•

回复

您好，如果Nginx做反向代理，Nginx如何向源站转发http2 的请求呢？貌似现在只支持 http1.x 和 https 的请求转发

proxy_pass

http://www
......

proxy_pass

https://www
.....

http2??????? 应该怎么办呢 ？
Jerry Qu

•

6个月前

•

回复

Nginx 配置里有一个参数叫 proxy_http_version，可以指定使用的协议。

但是很不幸，它只支持 1.0 和 1.1，并且 Nginx 没有让它支持 2.0 的打算。

http://mailman.nginx.org/piper...
MosesHe

•

7个月前

•

回复

您好，我在尝试优化时遇到了一个问题，有些 JS 或 CSS 文件 url 后面会带上“ver=版本号”，于是他们就不好被压缩/缓存，请问如何去掉这些版本号或者让 Nginx 对他们进行压缩/缓存？
Jerry Qu

•

7个月前

•

回复

推荐截取文件内容 md5 的某几位做为版本号，并且将版本号做为文件路径的一部分，而不是参数。
天毅

•

9个月前

•

回复

请问应该如何优化静态内容，我的网页TTFT能达到65ms，但是静态资源，比如合并之后的css和js文件的TTFB就长达120ms+。我属于门外汉，不知道这个方面主要和什么有关系，能否有继续优化的余地
天毅

•

9个月前

•

回复

找到了部分原因，在虚拟主机的http部分里并没有针对静态资源启用TCP 优化等选项，添加上之后TTFB就从120ms减到了55ms左右。
Sean

•

10个月前

•

回复

一个问题，如果设置了etag=on, 然后expires max;这个时候如果更新了图片，在浏览器上刷新，会下载新的还是会收到304然后继续用旧的呢？
Jerry Qu

•

10个月前

•

回复

普通刷新会使用协商缓存，忽略强缓存；强刷会忽略浏览器所有缓存（并且请求头会携带 Cache-Control:no-cache 和 Pragma:no-cache，用来通知所有中间节点忽略缓存）。只有从地址栏或收藏夹输入网址、点击链接等情况下，浏览器才会使用强缓存。
Sean

•

10个月前

•

回复

也就是说，哪怕设置了max，刷新的话依然会看到新的图片。

但是我遇到的问题是，设置了favicon.ico，IE不清除缓存仅仅刷新或者强制刷新，看到的依然是老的favicon.ico。。。
Jerry Qu

•

10个月前

•

回复

favicon 是个特例，不同浏览器都有自己不同的缓存策略。建议用 link 标签指定新的图片，可以看下本站源代码。
屠夫9441

•

1年前

•

回复

根据我的理解，“入口文件（HTML）一般使用协商缓存或不缓存”，即只需要设置“etag: on”属性，而不需要设置Expires或Cache-Control时间，是这样的吗？而“对 CSS、JS、图片等资源使用强缓存”，要同时开启etag，并设置Expires或Cache-Control时间，但我看到您给出的代码中只写了Expires，不是说Cache-Control功能更强大嘛，怎么没设置呢……
Jerry Qu

•

1年前

•

回复

你说 Nginx 的这个配置么？expires max;

这个会同时设置 Expires 和 Cache-Control 两个头部：

Enables or disables adding or modifying the “Expires” and “Cache-Control” response header fields provided that the response code equals 200, 201, 204, 206, 301, 302, 303, 304, or 307.
袁源

•

1年前

•

回复

resolver 8.8.4.4 8.8.8.8 # 这个 8.8.8.8 不是 Google 的 Public DNS 么？不怕访问不鸟？
<
==== 我错了我本地 ping 了一下挺快的
Jerry Qu

•

1年前

•

回复

我写这篇文章的时候，还用的 linode 日本啊。
Ritchie Zhu

•

1年前

•

回复

您好，请教一个问题：对于静态资源开启 『aio on』 会不会对性能有提升，还有这个选项跟 『sendfile on』 会不会冲突啊？
Jerry Qu

•

1年前

•

回复

根据 Nginx 的说明，在 Linux 上开启 aio 需要内核高于 2.6.22，并且开启 directio。然后 Linux 上开启 directio 又有两个限制：必须扇区对齐和给文件设置 O_DIRECT 标记位，然而这会导致这个文件被直接读取，不走缓存，反而会增加磁盘 IO 负担。为此，Nginx 推荐使用 aio threads，详见这篇文章：

https://www.nginx.com/blog/thr...

同时那篇文章也指出，内存足够、资源不大的场景下，Nginx 默认就工作在最优状态（因为频繁读取的文件系统会放在缓存页里）：

So if you have a reasonable amount of RAM and your working data set isn’t very big, then NGINX already works in the most optimal way without using thread pools.

最后，aoi 和 sendfile 不会冲突，Nginx 会根据 directio 指定的大小区分对待，手册的描述如下：

When both AIO and sendfile are enabled on Linux, AIO is used for files that are larger than or equal to the size specified in the directio directive, while sendfile is used for files of smaller sizes or when directio is disabled.
Ritchie Zhu

•

1年前

•

回复

谢谢博主，解释的很透彻，大大的
👍
环度网信

•

1年前

•

回复

很不错，学习了。
AHU

•

1年前

•

回复

nginx 多个虚拟主机 开启OCSP失败
Jerry Qu
请指点一下如何搞定
Scholer

•

1年前

•

回复

200ms 貌似只是在特定情况下吧 这种说法有点夸张了。话说 John Nagle 自己都跑出来探讨这个问题了~~

https:/
ews.ycombinator.com/i...
Jerry Qu

•

1年前

•

回复

嗯，是的。你给的那个链接中，John Nagle 解释得很清楚，摘录如下：

Sigh. If you're doing bulk file transfers, you never hit that problem. If you're sending enough data to fill up outgoing buffers, there's no delay. If you send all the data and close the TCP connection, there's no delay after the last packet. If you do send, reply, send, reply, there's no delay. If you do bulk sends, there's no delay. If you do send, send, reply, there's a delay.

The real problem is ACK delays. The 200ms "ACK delay" timer is a bad idea that someone at Berkeley stuck into BSD around 1985 because they didn't really understand the problem. A delayed ACK is a bet that there will be a reply from the application level within 200ms. TCP continues to use delayed ACKs even if it's losing that bet every time.

If I'd still been working on networking at the time, that never would have happened. But I was off doing stuff for a startup called Autodesk.

感觉这哥们也是蛮郁闷的。。。
Scholer

•

1年前

•

回复

奠基人
Jerry Qu

•

1年前

•

回复

是啊，他本可以做得更好，但是必须转做其他事情，这也够郁闷啊。
Scholer

•

1年前

•

回复

哈哈 人在江湖 身不由己
arfaWong

•

1年前

•

回复

开启OCSP stapling之后，ssl_trusted_certificate证书需要经常更新吗？这个证书有没有有效期的说法的？
Jerry Qu

•

1年前

•

回复

只要你的证书没变化，这个不需要更新，关于这个配置的说明是：

For the OCSP stapling to work, the certificate of the server certificate issuer should be known. If the ssl_certificate file does not contain intermediate certificates, the certificate of the server certificate issuer should be present in the ssl_trusted_certificate file.
王继波

•

1年前

•

回复

请教个问题，Nginx开启fastopen需要编译特定的模块进去吗？我用3.10内核并设置为3，但Nginx这个参数报错，在Nginx的docs上也没有找到相关介绍。
laike9m

•

1年前

•

回复

没有用支持 HTTP/2 的 1.9.5 么？
Jerry Qu

•

1年前

•

回复

写这篇文章时 nginx 还不支持 HTTP/2，后面换了。我博客后续文章有介绍。
屈光宇

•

1年前

•

回复

那个配置后面有 proxy_pass，被省略了没有贴出来，因为这里时为了说明 proxy_cache 功能。

配置 proxy_pass 时，配置 resolver 也很重要。
qeeainburg

•

1年前

•

回复

resolver 127.0.0.1;

这个？？

为什么是resolver呢？？而不是proxy_pass 呢？？
blackeeper

•

2年前

•

回复

写得很好
Jerry Qu

•

2年前

•

回复

1、304 是多余的，这里 cache 的都是 html 文档，而我并没有为 html 文档输出 Last-Modified 或者 ETag 响应头，所以根本不会出现 304 的情况。

2、Last-Modified 使用的是服务端时间，确实没有客户端时间什么事，这里写得有问题。Last-Modified 主要问题是精度不够，不能识别出 1 秒之内的多次变化；另外是多台机器负载均衡时，如果各机器读到的文件修改时间不一致而负载均衡算法是轮询时，有缓存无故失效和缓存不更新的风险。而 ETag 是给文件提取特征值，一般会使用 md5 一类的摘要算法，可以解决这个问题。
Skydiver

•

2年前

•

回复

几个问题：

1、304为什么要缓存？这个不是根据客户端传过来的内容做判断的么，应该是每个用户不一样的。

2、浏览器记住的Last-Modified也是上次服务器发过来的啊，也就是时间都是服务器时间，所以为什么会有服务器、客户端时间不一致的问题？
Leslie

•

2年前

•

回复

很详细，慢慢看！
Justic Lau

•

2年前

•

回复

很好
xuexb

•

2年前

•

回复

赞，学习了～

来自

<
https://imququ.com/post/my-nginx-conf-for-wpo.html
>

已使用 Microsoft OneNote 2016 创建。
