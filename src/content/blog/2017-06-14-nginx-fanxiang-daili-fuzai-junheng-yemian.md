---
title: Nginx 反向代理、负载均衡、页面缓存、URL重写及读写分离详解
date: '2017-06-14'
description: >-
  Nginx 1.4.2 在 CentOS 6.4 上的实战笔记：编译安装与 SysV 脚本、proxy_pass 反向代理、upstream
  负载均衡（权重、健康检查、backup、ip_hash）、proxy_cache 页面缓存、rewrite URL 重写及基于 WebDAV 的读写分离。
category: web-infra
tags:
  - nginx
  - apache
draft: false
source: evernote-local-db
lang: zh
origin_url: http://freeloda.blog.51cto.com/2033581/1288553
---

实验环境：CentOS 6.4 x86_64，Nginx 1.4.2。三台机器：nginx（192.168.18.208，代理）、web1（192.168.18.201）、web2（192.168.18.202）。

## 一、环境准备

安装 epel yum 源、时间同步、关闭防火墙与 SELinux（三个节点均执行）：

```bash
# rpm -ivh http://download.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
# ntpdate 202.120.2.101
# service iptables stop
# chkconfig iptables off
# getenforce
Disabled
```

## 二、安装 Nginx

```bash
[root@nginx src]# tar xf nginx-1.4.2.tar.gz
[root@nginx src]# groupadd -g 108 -r nginx
[root@nginx src]# useradd -u 108 -r -g 108 nginx
[root@nginx src]# yum install -y pcre-devel openssl-devel
[root@nginx nginx-1.4.2]# ./configure --prefix=/usr --sbin-path=/usr/sbin/nginx --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --pid-path=/var/run/nginx/nginx.pid --lock-path=/var/lock/nginx.lock --user=nginx --group=nginx --with-http_ssl_module --with-http_flv_module --with-http_stub_status_module --with-http_gzip_static_module --http-client-body-temp-path=/var/tmp/nginx/client/ --http-proxy-temp-path=/var/tmp/nginx/proxy/ --http-fastcgi-temp-path=/var/tmp/nginx/fcgi/ --http-uwsgi-temp-path=/var/tmp/nginx/uwsgi --http-scgi-temp-path=/var/tmp/nginx/scgi --with-pcre
[root@nginx nginx-1.4.2]# make && make install
```

为 nginx 提供 SysV init 脚本 `/etc/init.d/nginx`：

```bash
#!/bin/sh
#
# nginx - this script starts and stops the nginx daemon
#
# chkconfig:   - 85 15
# description:  Nginx is an HTTP(S) server, HTTP(S) reverse \
#               proxy and IMAP/POP3 proxy server
# processname: nginx
# config:      /etc/nginx/nginx.conf
# config:      /etc/sysconfig/nginx
# pidfile:     /var/run/nginx.pid

# Source function library.
. /etc/rc.d/init.d/functions

# Source networking configuration.
. /etc/sysconfig/network

# Check that networking is up.
[ "$NETWORKING" = "no" ] && exit 0

nginx="/usr/sbin/nginx"
prog=$(basename $nginx)

NGINX_CONF_FILE="/etc/nginx/nginx.conf"

[ -f /etc/sysconfig/nginx ] && . /etc/sysconfig/nginx

lockfile=/var/lock/subsys/nginx

make_dirs() {
   # make required directories
   user=`nginx -V 2>&1 | grep "configure arguments:" | sed 's/[^*]*--user=\([^ ]*\).*/\1/g' -`
   options=`$nginx -V 2>&1 | grep 'configure arguments:'`
   for opt in $options; do
       if [ `echo $opt | grep '.*-temp-path'` ]; then
           value=`echo $opt | cut -d "=" -f 2`
           if [ ! -d "$value" ]; then
               # echo "creating" $value
               mkdir -p $value && chown -R $user $value
           fi
       fi
   done
}

start() {
    [ -x $nginx ] || exit 5
    [ -f $NGINX_CONF_FILE ] || exit 6
    make_dirs
    echo -n $"Starting $prog: "
    daemon $nginx -c $NGINX_CONF_FILE
    retval=$?
    echo
    [ $retval -eq 0 ] && touch $lockfile
    return $retval
}

stop() {
    echo -n $"Stopping $prog: "
    killproc $prog -QUIT
    retval=$?
    echo
    [ $retval -eq 0 ] && rm -f $lockfile
    return $retval
}

restart() {
    configtest || return $?
    stop
    sleep 1
    start
}

reload() {
    configtest || return $?
    echo -n $"Reloading $prog: "
    killproc $nginx -HUP
    RETVAL=$?
    echo
}

force_reload() {
    restart
}

configtest() {
  $nginx -t -c $NGINX_CONF_FILE
}

rh_status() {
    status $prog
}

rh_status_q() {
    rh_status >/dev/null 2>&1
}

case "$1" in
    start)
        rh_status_q && exit 0
        $1
        ;;
    stop)
        rh_status_q || exit 0
        $1
        ;;
    restart|configtest)
        $1
        ;;
    reload)
        rh_status_q || exit 7
        $1
        ;;
    force-reload)
        force_reload
        ;;
    status)
        rh_status
        ;;
    condrestart|try-restart)
        rh_status_q || exit 0
        ;;
    *)
        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload|configtest}"
        exit 2
esac
```

赋权、加入服务管理并启动：

```bash
[root@nginx ~]# chmod +x /etc/init.d/nginx
[root@nginx ~]# chkconfig --add nginx
[root@nginx ~]# chkconfig nginx on
[root@nginx ~]# service nginx start
[root@nginx ~]# netstat -ntlp | grep :80
tcp    0    0 0.0.0.0:80    0.0.0.0:*    LISTEN    3889/nginx
```

## 三、反向代理

后端准备：web1、web2 安装 httpd 并提供测试页。

```bash
[root@web1 ~]# yum install -y httpd
[root@web1 ~]# echo "<h1>web1.test.com</h1>" > /var/www/html/index.html
[root@web1 ~]# service httpd start
[root@web2 ~]# yum install -y httpd
[root@web2 ~]# echo "<h1>web2.test.com</h1>" > /var/www/html/index.html
[root@web2 ~]# service httpd start
```

概念要点：**正向代理**位于客户端和原始服务器之间，客户端需特别设置，典型用途是为防火墙内的局域网客户端提供访问 Internet 的途径；**反向代理**对客户端透明、就像原始服务器本身，典型用途是将防火墙后面的服务器提供给 Internet 用户访问，并可为后端多台服务器提供负载均衡和缓冲服务。

`proxy_pass`（使用字段：location 及 location 中的 if）设置被代理服务器的地址和被映射的 URI。配置 `/etc/nginx/nginx.conf`：

```nginx
location / {
    proxy_pass       http://192.168.18.201;
    proxy_set_header X-Real-IP $remote_addr;
}
```

`proxy_set_header`（使用字段：http, server, location）将发送到被代理服务器的请求头重新定义或增加字段，未定义时从上级字段继承。修改后 `service nginx reload` 生效。

默认后端 httpd 日志记录的客户端 IP 全是 nginx 代理的 IP。要记录真实客户端 IP，除了 nginx 侧的 `proxy_set_header X-Real-IP $remote_addr;`，还需将 httpd 的 LogFormat 中 `%h` 改为 `%{X-Real-IP}i`：

```apache
LogFormat "%{X-Real-IP}i %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined
```

重启 httpd 后日志即记录真实客户端地址。

## 四、负载均衡

upstream 模块通过调度算法实现客户端到后端服务器的负载均衡。示例语法：

```nginx
upstream test.net {
    ip_hash;
    server 192.168.10.13:80;
    server 192.168.10.14:80   down;
    server 192.168.10.15:8009 max_fails=3 fail_timeout=20s;
    server 192.168.10.16:8080;
}
server {
    location / {
        proxy_pass http://test.net;
    }
}
```

支持的 4 种调度算法：

- **轮询（默认）**：按时间顺序逐一分配，宕机的后端自动剔除；weight 指定权值，值越大分配机率越高，用于后端性能不均的情况。
- **ip_hash**：按访问 IP 的 hash 结果分配，同一 IP 固定访问一个后端，解决动态网页的 session 共享问题。
- **fair**（第三方）：根据后端响应时间分配，需 upstream_fair 模块。
- **url_hash**（第三方）：按 url 的 hash 结果分配，使每个 url 定向到同一后端，提高后端缓存服务器效率，需 hash 软件包。

server 指令的状态参数：`down`（暂不参与负载均衡）、`backup`（备份机，其他所有非 backup 机器故障或忙时才请求）、`max_fails`（允许请求失败次数，默认 1，超过则返回 proxy_next_upstream 模块定义的错误）、`fail_timeout`（经历 max_fails 次失败后暂停服务的时间）。注意：调度算法为 ip_hash 时，后端状态不能是 weight 和 backup。

实际配置 `/etc/nginx/nginx.conf`：

```nginx
upstream webservers {
    server 192.168.18.201 weight=1;
    server 192.168.18.202 weight=1;
}
server {
    listen      80;
    server_name localhost;
    location / {
        proxy_pass       http://webservers;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

注意 upstream 定义在 server{} 之外。reload 后不断刷新页面，web1 与 web2 交替出现，两台后端日志均记录到来自真实客户端的请求。

**健康状态检查**（利用 max_fails + fail_timeout）：

```nginx
upstream webservers {
    server 192.168.18.201 weight=1 max_fails=2 fail_timeout=2;
    server 192.168.18.202 weight=1 max_fails=2 fail_timeout=2;
}
```

停掉 web1（`service httpd stop`）后只能访问到 web2，恢复后又重新加入，说明健康检查生效。

**backup 服务器**（类似 LVS 的 sorry_server，所有后端都故障时兜底）：

```nginx
server {
    listen 8080;
    server_name localhost;
    root /data/www/errorpage;
    index index.html;
}
upstream webservers {
    server 192.168.18.201 weight=1 max_fails=2 fail_timeout=2;
    server 192.168.18.202 weight=1 max_fails=2 fail_timeout=2;
    server 127.0.0.1:8080 backup;
}
```

```bash
[root@nginx ~]# mkdir -pv /data/www/errorpage
[root@nginx errorpage]# cat index.html
<h1>Sorry......</h1>
```

web1、web2 都停止后，访问返回备份页面。

**ip_hash 负载均衡**（电子商务网站常用；不能与 backup 并存——被分到 backup 就无法访问了）：

```nginx
upstream webservers {
    ip_hash;
    server 192.168.18.201 weight=1 max_fails=2 fail_timeout=2;
    server 192.168.18.202 weight=1 max_fails=2 fail_timeout=2;
    #server 127.0.0.1:8080 backup;
}
```

reload 后同一客户端固定落在一台后端，可用 `netstat -an | grep :80 | wc -l` 在后端统计连接数验证。

## 五、页面缓存

关键指令：

- `proxy_cache_path path [levels=number] keys_zone=zone_name:zone_size [inactive=time] [max_size=size];`（使用字段：http）指定缓存路径，缓存数据存储在文件中，用代理 url 的哈希值作为关键字与文件名。levels 指定缓存子目录数，最多三级，如 `levels=1:2` 时文件名类似 `/data/nginx/cache/c/29/b7f54b2df7773722d382f4809d65029c`。活动的 key 和元数据存储在 keys_zone 指定的共享内存池中。inactive 时间内未被请求的缓存数据被删除（默认 10 分钟）；cache manager 进程按 max_size 控制磁盘缓存大小，超出后按 LRU 删除。每个内存池必须是不重复的路径：

  ```nginx
  proxy_cache_path /data/nginx/cache/one   levels=1     keys_zone=one:10m;
  proxy_cache_path /data/nginx/cache/two   levels=2:2   keys_zone=two:100m;
  proxy_cache_path /data/nginx/cache/three levels=1:1:2 keys_zone=three:1000m;
  ```

- `proxy_cache zone_name;`（http, server, location）设置缓存区域名称。0.7.48 后缓存遵循后端的 Expires、Cache-Control: no-cache、Cache-Control: max-age=XXX 头；0.7.66 后 private 和 no-store 同样被遵循。nginx 缓存过程中不处理 Vary 头，为确保私有数据不被所有用户看到，后端须设置 no-cache/max-age=0，或让 proxy_cache_key 包含 $cookie_xxx 等用户数据。缓存依赖代理缓冲区，proxy_buffers 为 off 时缓存不生效。

- `proxy_cache_valid reply_code [reply_code ...] time;`（http, server, location）为不同应答设置缓存时间：

  ```nginx
  proxy_cache_valid 200 302 10m;
  proxy_cache_valid 301 1h;
  proxy_cache_valid any 1m;
  ```

  只定义时间（如 `proxy_cache_valid 5m;`）则只缓存 200、301、302 应答。

定义一个简单的缓存服务器，并通过响应头直观观察缓存命中情况（`$server_addr` 为服务器地址；`$upstream_cache_status` 取值：MISS 未命中、EXPIRED 过期、UPDATING 正在更新将使用旧应答、STALE 后端得到过期应答、HIT 命中）：

```nginx
proxy_cache_path /data/nginx/cache/webserver levels=1:2 keys_zone=webserver:20m max_size=1g;
server {
    listen      80;
    server_name localhost;
    # 增加两头部
    add_header X-Via   $server_addr;
    add_header X-Cache $upstream_cache_status;
    location / {
        proxy_pass        http://webservers;
        proxy_set_header  X-Real-IP $remote_addr;
        proxy_cache       webserver;
        proxy_cache_valid 200 10m;
    }
}
```

```bash
[root@nginx ~]# mkdir -pv /data/nginx/cache/webserver
[root@nginx ~]# service nginx reload
```

浏览器 F12 的 Network 中可看到 X-Via、X-Cache 响应头显示命中情况；缓存目录中确实生成了缓存文件：

```bash
[root@nginx ~]# cd /data/nginx/cache/webserver/f/63/
[root@nginx 63]# ls
681ad4c77694b65d61c9985553a2763f
```

## 六、URL 重写

Rewrite 模块允许使用正则表达式重写 URI（需 PCRE 库）。在 server 字段中指定时在 location 确定之前执行；location 中执行产生新 URI 时 location 会再次确定，循环最多 10 次，超过返回 500 错误。主要指令：

- `break`（server, location, if）：完成当前规则，停止执行其他重写指令。
- `if (condition) { ... }`（server, location）：条件判断。可用：变量名（空串或以 0 开头为假）；`=`/`!=` 比较；`~`（区分大小写）/`~*`（不区分）正则匹配及 `!~`、`!~*`；`-f`/`!-f` 文件存在、`-d`/`!-d` 目录存在、`-e`/`!-e` 文件/目录/软链接存在、`-x`/`!-x` 可执行。正则中的圆括号可用 $1-$9 引用。注意官方建议尽量用 try_files 代替 if。示例：

  ```nginx
  if ($http_user_agent ~ MSIE) {
      rewrite ^(.*)$ /msie/$1 break;
  }
  if ($http_cookie ~* "id=([^;] +)(?:;|$)" ) {
      set $id $1;
  }
  if ($request_method = POST ) {
      return 405;
  }
  if (!-f $request_filename) {
      break;
      proxy_pass http://127.0.0.1;
  }
  if ($slow) {
      limit_rate 10k;
  }
  if ($invalid_referer) {
      return 403;
  }
  if ($args ~ post=140){
      rewrite ^ http://example.com/ permanent;
  }
  ```

- `return code`（server, location, if）：结束执行并返回状态码，可用 204、400、402-406、408、410、411、413、416 与 500-504；非标准代码 444 关闭连接且不发送任何头部。
- `rewrite regex replacement flag`（server, location, if）：按正则修改 URI，按配置文件中出现的顺序执行。替换字符串以 http:// 开头则直接重定向且不再执行后续 rewrite。flag 取值：`last`（完成重写后重新搜索 URI/location）、`break`（完成重写）、`redirect`（302 临时重定向）、`permanent`（301 永久重定向）。示例：

  ```nginx
  rewrite ^(/download/.*)/media/(.*)\..*$ $1/mp3/$2.mp3 last;
  rewrite ^(/download/.*)/audio/(.*)\..*$ $1/mp3/$2.ra  last;
  return  403;
  ```

  若放入 `location /download/` 中则需将 last 改为 break，否则 nginx 循环 10 次后返回 500：

  ```nginx
  location /download/ {
      rewrite ^(/download/.*)/media/(.*)\..*$ $1/mp3/$2.mp3 break;
      rewrite ^(/download/.*)/audio/(.*)\..*$ $1/mp3/$2.ra  break;
      return  403;
  }
  ```

  替换字段中包含参数时其余请求参数会附加到后面，防止附加可在最后跟一个问号：`rewrite ^/users/(.*)$ /show?user=$1? last;`。正则中使用大括号需用引号包起来，如把 `/photos/123456` 重写为 `/path/to/photos/12/1234/123456.png`：

  ```nginx
  rewrite "/photos/([0-9] {2})([0-9] {2})([0-9] {2})" /path/to/photos/$1/$1$2/$1$2$3.png;
  ```

  用 $request_uri 把 www.example.com 重写到 example.com：

  ```nginx
  server {
      server_name www.example.com;
      rewrite ^ http://example.com$request_uri? permanent;
  }
  ```

  重写只对路径操作，重写带参数的 URL 可用：

  ```nginx
  if ($args ^~ post=100){
      rewrite ^ http://example.com/new-address.html? permanent;
  }
  ```

- `rewrite_log on | off`（默认 off）：启用后在 error log 中以 notice 级别记录重写日志。
- `set variable value`：定义变量并赋值，值可以是文本、变量及其组合；不能设置 $http_xxx 头部变量。
- `uninitialized_variable_warn on|off`（默认 on）：控制未初始化变量的警告日志。

rewrite 指令在配置加载时已编译到内部代码，由一个简单的堆栈虚拟机在请求时解释执行；将 `rewrite ^/(download/.*)/media/...` 的第一个斜杠括入圆括号（`^(/download/.*)/media/...`）可减少执行步骤。

**实验：** 跨服务器重定向（302 临时重定向）：

```nginx
location / {
    root  html;
    index index.html index.htm;
    rewrite ^/bbs/(.*)$ http://192.168.18.201/forum/$1;
}
```

```bash
[root@web1 html]# mkdir forum
[root@web1 forum]# vim index.html
<h1>forum page!</h1>
```

访问 /bbs/ 返回 status code 302。本机跳转则是永久重定向（隐式重定向）：

```nginx
location / {
    root  html;
    index index.html index.htm;
    rewrite ^/bbs/(.*)$ /forum/$1;
}
```

```bash
[root@nginx html]# mkdir forum
[root@nginx forum]# vim index.html
<h1>192.168.18.208 forum page</h1>
```

一般服务器与服务器之间是临时重定向，服务器内部是永久重定向。

## 七、读写分离

需求：前端 nginx 负载均衡反向代理，后端两台 httpd 提供 BBS 服务。上传附件只能上传到 web1，再用 rsync+inotify 向 web2 单向同步——所以 web1 可写、web2 只读。

**WebDAV**（Web-based Distributed Authoring and Versioning）是基于 HTTP 1.1 的通信协议，在 GET、POST、HEAD 等标准方法外添加了新方法，使应用程序可直接对 Web Server 读写，支持写文件锁定/解锁与版本控制。

nginx 配置——读发给 web2，PUT 写发给 web1：

```nginx
server {
    listen      80;
    server_name localhost;
    location / {
        proxy_pass http://192.168.18.202;
        if ($request_method = "PUT"){
            proxy_pass http://192.168.18.201;
        }
    }
}
```

web1 上在 httpd.conf 的 `<Directory "/var/www/html">` 中启用 WebDAV（`Dav On`）并重启 httpd。测试：

```bash
[root@nginx ~]# curl http://192.168.18.201
<h1>web1.test.com</h1>
[root@nginx ~]# curl http://192.168.18.202
<h1>web2.test.com</h1>
[root@nginx ~]# curl -T /etc/issue http://192.168.18.202
```

向 web2 上传返回 405 Method Not Allowed（未开启 WebDAV，只读）。向 web1 上传初始返回 403 Forbidden（root 目录不允许 apache 用户上传），授权后成功：

```bash
[root@web1 ~]# setfacl -m u:apache:rwx /var/www/html/
[root@nginx ~]# curl -T /etc/issue http://192.168.18.201
```

返回 201 Created，文件已上传：

```bash
[root@web1 html]# ll
-rw-r--r-- 1 apache apache   47 9月  4 14:06 issue
```

至此 nginx 的反向代理、负载均衡、页面缓存、URL 重写及读写分离全部完成。
