---
title: "docker 容器中 crond服务启动后 无法执行"
date: 2018-01-12 08:04:22 +0000
categories: ["docker"]
tags: ["Pages"]
description: "docker 容器中 crond 服务启动后 无法执行 2018 年 1 月 12 日 16:04 原创 大哥叔 2016-05-17 00:30:53 评论(0) 309人阅读 docker宿主机系统版本 # cat /etc/issue CentOS release 6.7 (Final) 内核版本 # uname"
source: "evernote-local-db"
---

docker

容器中

crond
服务启动后 无法执行
2018
年
1
月
12
日
16:04

原创
大哥叔
2016-05-17 00:30:53
评论(0)
309人阅读
docker宿主机系统版本
# cat /etc/issue
CentOS release 6.7 (Final)

内核版本
# uname -a
Linux test 3.10.101-1.el6.elrepo.x86_64 #1 SMP Wed Mar 16 20:55:27 EDT 2016 x86_64 x86_64 x86_64 GNU/Linux

容器也是同样的系统版本

进入容器后安装crond服务：yum install crontabs
启动程序：# /etc/init.d/crond start
写入计划任务：
# crontab -l
*/1 * * * * echo "aaaaaaaaaaaaa" >> /tmp/test.log
由于镜像最简化安装，所以crond程序是无日志的，此时等待几分钟时间是无法出现/tmp/test.log文件的，由此判断crond程序没有正常工作，我们需要修改文件如下：
# cat /etc/pam.d/crond
#session required pam_loginuid.so #注释此行修改成下一行
session
sufficient
pam_loginuid.so
# /etc/init.d/crond restart
Stopping crond: [ OK ]
Starting crond: [ OK ]
[root@BW-GL11 ~]# tailf /tmp/test.log 此时看到已经可以执行

来自

<
http://blog.51cto.com/1606496/1774158
>

yau
亲自实践，发现以上办法没用，会出现错误
真正解决方法如下：
docker容器中crontab无法正常运行解决方案
MinUnix 发布于 2016年12月29日 + 2,641 人浏览 + 0吐槽
本文标签
：
docker
详细很多人开完docker容器, 需要加crontab, 加完却发现不能执行,心塞.....接着便开始各种折腾...
首先当然是看日志了, 发现/var/log 下面没有任何信息, 那是因为你没有打开rsyslog.
# /etc/init.d/rsyslog start
继续看日志
1
2
3
4
5
6
7
8
9
10
11
# tail /var/log/crond
Dec

29 16
:
39
:
01

web01
-
50794

crond
[
2839
]
:

(
root
)

FAILED

to

open PAM security session

(
Cannot

make
/
remove an entry

for

the specified

session
)
Dec

29 16
:
40
:
01

web01
-
50794

crond
[
2842
]
:

(
root
)

FAILED

to

open PAM security session

(
Cannot

make
/
remove an entry

for

the specified

session
)
Dec

29 16
:
40
:
01

web01
-
50794

crond
[
2841
]
:

(
root
)

FAILED

to

open PAM security session

(
Cannot

make
/
remove an entry

for

the specified

session
)
Dec

29 16
:
41
:
01

web01
-
50794

crond
[
2846
]
:

(
root
)

FAILED

to

open PAM security session

(
Cannot

make
/
remove an entry

for

the specified

session
)

# tail /var/log/secure
Dec

29 16
:
39
:
01

web01
-
50794

crond
[
2839
]
:

pam_loginuid
(
crond
:
session
)
:

set_loginuid failed
Dec

29 16
:
40
:
01

web01
-
50794

crond
[
2841
]
:

pam_loginuid
(
crond
:
session
)
:

set_loginuid failed
Dec

29 16
:
40
:
01

web01
-
50794

crond
[
2842
]
:

pam_loginuid
(
crond
:
session
)
:

set_loginuid failed
Dec

29 16
:
41
:
01

web01
-
50794

crond
[
2846
]
:

pam_loginuid
(
crond
:
session
)
:

set_loginuid

failed
从crontab的日志可以看出是因为pam的原因无法建立一个session连接.
接着看secure日志, 报出了set_loginuid failed , 无法获取用户uid.
分析:
为什么在docker里面无法获取uid?pam_loginuid.so又代表什么?
pam_loginuid.so模块: session类型:用来设置已通过认证的进程的uid.以使程序通过正常的审核(audit).而在docker里面，由于内核能力机制的安全限制，docker启动的容器被严格要求只允许使用内核的部分能力.其中包括，但不仅限于ssh、cron、syslogd、硬件管理工具模块（例如负载模块）、网络配置，等属于特权进程.容器无法获取这些特权进程信息。导致crond服务启动时的set_loginuid failed. 而required机制要求必须所有的验证条件均要满足，才能进行后续操作，这就导致了crond的执行失败.
这里扯一下pam模块鉴证级别,共有四种取值:分别为required、Requisite、sufficient或_optional.
required：表示该行以及所有涉及模块的成功是用户通过鉴别的必要条件。换句话说，只有当对应于应用程序的所有带 required标记的模块全部成功后，该程序才能通过鉴别。同时，如果任何带required标记的模块出现了错误，PAM并不立刻将错误消息返回给应用程序，而是在所有模块都调用完毕后才将错误消息返回调用他的程序。 反正说白了，就是必须将所有的模块都执行一次，其中任何一个模块验证出错，验证都会继续进行，并在执行完成之后才返回错误信息。这样做的目的就是不让用户知道自己被哪个模块拒绝，通过一种隐蔽的方式来保护系统服务。就像设置防火墙规则的时候将拒绝类的规则都设置为drop一样，以致于用户在访问网络不成功的时候无法准确判断到底是被拒绝还是目标网络不可达。
sufficient：表示该行以及所涉及模块验证成功是用户通过鉴别的充分条件。也就是说只要标记为sufficient的模块一旦验证成功，那么PAM便立即向应用程序返回成功结果而不必尝试任何其他模块。即便后面的层叠模块使用了requisite或者required控制标志也是一样。当标记为sufficient的模块失败时，sufficient模块会当做 optional对待。因此拥有sufficient 标志位的配置项在执行验证出错的时候并不会导致整个验证失败，但执行验证成功之时则大门敞开。所以该控制位的使用务必慎重。
解决方案:
1
2
3
4
5
6
# cat /etc/pam.d/crond
account required

pam_access
.
so
account include
password
-
auth
#session required pam_loginuid.so #注释此行
session include
password
-
auth
auth include
password
-
auth

来自

<
http://www.minunix.com/2016/12/docker-crontab/
>

已使用 Microsoft OneNote 2016 创建。
