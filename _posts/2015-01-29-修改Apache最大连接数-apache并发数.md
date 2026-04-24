---
title: "修改Apache最大连接数/apache并发数"
date: 2015-01-29 02:39:54 +0000
categories: ["Apache"]
tags: []
description: "Apache优化步骤： 1 先查看apache的运行模式，查看命令：httpd -l Compiled in modules: core.c prefork.c http_core.c mod_so.c 这里可以看到运行模式是prefork模式。 2 修改apache 的httpd-mpm.conf 配置 打开 /us"
source: "evernote-local-db"
---

修改Apache最大连接数/apache并发数
Apache优化步骤：
1 先查看apache的运行模式，查看命令：httpd -l
Compiled in modules:
core.c
prefork.c
http_core.c
mod_so.c
这里可以看到运行模式是prefork模式。
2 修改apache 的httpd-mpm.conf 配置
打开 /usr/local/apache2/conf/extra/httpd-mpm.conf ,每个机器可能httpd-mpm.conf 可能不同，这里可以通过find 命令查询。
第一次打开的时候默认配置是这样的。

StartServers 5
MinSpareServers 5
MaxSpareServers 10
MaxClients 150
MaxRequestsPerChild 0
其中：
StartServers 表示空闲子进程的最小数量。如果当前空闲子进程数小于MinSpareServers，那么Apache将以最大美妙一个的速度产生新的子进程。此参数不要设置太大。
MinSpareServers 设 置空闲子进程的最大数量。如果当前有超过MaxSpareServers 数量的空闲子进程，那么父进程将杀死多余的子进程。此参数不要设置太大，如果你 讲质量设置比MinSpareServers小，Apache将会自动将其修改成“MinSpareServers + 1”。
MaxSpareServers 限 定同一时间客户最大接入请求的数量(单个进程并发线程数)。任何超过MaxClients限制的请求讲进入等候队列，一旦一个连接被释放，队列中的请求将 得到服务。要增大该值必须同事增大ServerLimit(ServerLimit待会再讲)。
MaxClients 表示每个子进程在其生存期内允许伺候的最大请求数量。到达MaxRequestsPerChild的限制后，子进程将会结束。如果MaxRequestsPerChild为“0”，子进程将永远不会结束。
MaxRequestsPerChild 设置为0 ，可以防止(偶然)内存泄漏无限进行，从而耗尽内存。给进程一个有限寿命，从而有助于当服务器负载减轻的时候减少活动进程的数量。
3 现在看看需要怎么优化：
连接数理论上是越大越好，但是得根据硬件，服务器的CPU，内存，带宽等因素，查看当前的apache连接数：
ps aux | grep httpd | wc -l
计算httpd 占用内存的平均数:
ps aux | grep -v grep |awk '/httpd/{sum += $6;n++};END{print sum
}'
这个只是做个参考。计算后要减去服务器系统本身所需要的资源。
比如内存2G，减去500M留给服务器，还有1.5G，那么可得到最大连接数：在8000左右。
根据情况修改后的http-mpm.conf的prefork的配置后为：

StartServers 5
MinSpareServers 5
MaxSpareServers 10
ServerLimit 5500
MaxClients 5000
MaxRequestsPerChild 100
这里重点介绍下ServerLimit,必须放到MaxClients前，值要大于MaxClients。
4 重启apache，再打开网站看看是否还会有慢的问题了。

mysql优化，mysql默认连接数修改！！！

查看连接数方法，在phpmyadmin里的sql输入

show status like '%max%';

当前最大连接数

show variables like '%max%';

最大连接数

一.如果使用的是默认的my.cnf那就这样操作

vi /etc/my.cnf

[mysqld]

set-variable=max_connections=1000

set-variable=max_user_connections=500

set-variable=wait_timeout=200

//max_connections设置最大连接数为1000

//max_user_connections设置每用户最大连接数为500

//wait_timeout表示200秒后将关闭空闲（IDLE）的连接，但是对正在工作的连接不影响。

然后保存退出，重启mysql服务后查看连接数。

可以在phpmyadmin里的sql输入查询语句，或者输入/mysql安装路径/bin/mysqladmin -uroot -p variables "查看连接数"

max_connections这个就是最大连接数

二.如果各位大侠内存够大够猛的话（超过4G的话）可以这样操作

cp /usr/local/mysql/share/mysql/my-innodb-heavy-4G.cnf /etc/my.cnf

然后更改my.cnf里的max_connections = 100这个数值可以调高！！！

然后查看连接数更改情况

----------------------------------------------------------------------------------------
修改apache的最大连接数，方法如下：
步骤一

先修改 /path/apache/conf/httpd.conf文件。

# vi httpd.conf

将“#Include conf/extra/httpd-mpm.conf”前面的 “#” 去掉，保存。
步骤二

再修改 /path/apache/conf/extra/httpd-mpm.conf文件。

# vi httpd-mpm.conf

找到 这一行
原：
StartServers 5

MinSpareServers 5

MaxSpareServers 10

MaxClients 150

MaxRequestsPerChild 0
修改后
ServerLimit 1000

StartServers 10

MinSpareServers 5

MaxSpareServers 15

MaxClients 1000

MaxRequestsPerChild 0
注意：

ServerLimit 该指令一定要放在第一行。
修改后，一定不要apachectl restart，而是先 apachectl stop 然后再 apachectl start才可以。
