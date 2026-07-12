---
title: Linux服务器如何查看自己的公网出口IP地址
date: '2017-09-28'
description: >-
  2017年9月28日 10:57 Linux服务器如何查看自己的公网出口IP地址 linux 21运维 9个月前 (12-23) 2159浏览 0评论
  windows服务器我们都知道如何获取公网IP，直接ip.cn或者ip138.com即可查到。
category: linux
tags:
  - rsync
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---
2017年9月28日

10:57

[Linux服务器如何查看自己的公网出口IP地址](http://www.21yunwei.com/archives/5121)

[linux](http://www.21yunwei.com/archives/category/linux) [21运维](http://www.21yunwei.com/archives/author/admin) 9个月前 (12-23) 2159浏览 [0评论](http://www.21yunwei.com/archives/5121#respond)

**windows服务器我们都知道如何获取公网IP，直接ip.cn或者ip138.com即可查到。linux就略有不同，我们可以通过如下方法获取linux系统服务器的公网IP出口。可以根据自己不同需求方式进行调用。**

**网上搜索了一篇文章，方法如下：**

**curl 纯文本格式输出:**

1. curl icanhazip.com

2. curl ifconfig.me

3. curl curlmyip.com

4. curl ip.appspot.com

5. curl ipinfo.io/ip

6. curl ipecho.net/plain

7. curl [www.trackip.net/i](http://www.trackip.net/i)

**curl XML格式输出:**

1. curl ifconfig.me/all.xml

**curl JSON格式输出:**

1. curl ipinfo.io/json

2. curl ifconfig.me/all.json

3. curl [www.trackip.net/ip?json](http://www.trackip.net/ip?json) (有点丑陋)

**curl 得到所有IP细节 （挖掘机）：**

1. curl ifconfig.me/all

**使用 DYDNS （当你使用 DYDNS 服务时有用）**

1. curl \-s '[http://checkip.dyndns.org](http://checkip.dyndns.org/)' | sed 's/.\*Current IP Address: \\(\[0-9\\.\]\*\\).\*/\\1/g'

2. curl \-s [http:](http://checkip.dyndns.org/)_[//checkip.dyndns.org/](http://checkip.dyndns.org/)_ _| grep -o "\[\[:digit:\].\]\\+"_

**使用 Wget 代替 Curl**

1. wget [http:](http://ipecho.net/plain)_[//ipecho.net/plain](http://ipecho.net/plain)_ _\-O - -q ; echo_

2. wget [http:](http://observebox.com/ip)_[//observebox.com/ip](http://observebox.com/ip)_ _\-O - -q ; echo_

**使用 host 和 dig 命令**

1. host \-t a dartsclink.com | sed 's/.\*has address //'

2. dig +short myip.opendns.com @resolver1.opendns.com<pr》

**bash 脚本示例:**

1. _#!/bin/bash_

2. PUBLIC\_IP\=\`wget [http://ipecho.net/plain](http://ipecho.net/plain) \-O - -q ; echo\`

3. echo $PUBLIC\_IP

这里获取到公网IP以后，自己还上传到了一个线上服务器，毕竟公司这里申请的是公网IP，每隔几天都要更换一下。家里或其他地方如果要连接公司内部的虚拟机或管理路由器，就要获取准确公网IP才可以。

这里就简单写了一个脚本定期执行，获取到公网IP以后上传到一台线上的阿里服务器，这样每次可以直接通过登录阿里服务器获取到公司的公网出口IP了，公司内部测试机器linux上部署的脚本如下：

1. _#!/bin/bash_

2. curl ipinfo.io/ip > public\_ip.txt

3. rsync \-avz /home/yunwei/public\_ip.txt 1.2.3.4:/home/yunwei/

以后每次到线上1.2.3.4的服务器cat /home/yunwei/public\_ip.txt 就知道公司IP了。

来自 <[http://www.21yunwei.com/archives/5121](http://www.21yunwei.com/archives/5121)\>

不管是在家里还是办公室，或者是公司的主机，很多时候都是在内网中，也就是说很多都是通过 NAT上网的，有时候需要查询下出口的公网IP，如果有浏览器，可以用百度, google搜 ip 这个关键词得到公网IP，那要是在命令行下呢？ 下面是运维开发群的大神们分享的几个接口，整理了下分享给大家。

liuzhizhi@lzz-rmbp|logs \# curl ipinfo.io

{

"ip": "114.110.1.38",

"hostname": "No Hostname",

"city": "Beijing",

"region": "Beijing Shi",

"country": "CN",

"loc": "39.9289,116.3883",

"org": "AS4808 CNCGROUP IP network China169 Beijing Province Network"

}%

liuzhizhi@lzz-rmbp|logs \# curl ip.cn

当前 IP：114.110.1.38 来自：北京市 广东恒敦通信技术北京分公司

liuzhizhi@lzz-rmbp|~ \# curl cip.cc

IP : 114.110.1.38

地址 : 中国 北京市

数据二 : 北京市 | 广东恒敦通信技术北京分公司

URL : [http://www.cip.cc/114.110.1.38](http://www.cip.cc/114.110.1.38)

liuzhizhi@lzz-rmbp|~ \# curl myip.ipip.net (英文版为http://www.ipip.net/?l=EN)

当前 IP：114.110.1.38 来自于：中国 北京 北京 联通/电信

liuzhizhi@lzz-rmbp|~ \# curl ifconfig.me

114.110.1.38

liuzhizhi@lzz-rmbp|logs \# curl [http://members.3322.org/dyndns/getip](http://members.3322.org/dyndns/getip)

114.110.1.38

几个网址也非常好记忆

- ip.cn

- ipinfo.io

- cip.cc

- ifconfig.me

- myip.ipip.net

来自 <[http://blog.csdn.net/orangleliu/article/details/51994513](http://blog.csdn.net/orangleliu/article/details/51994513)\>
