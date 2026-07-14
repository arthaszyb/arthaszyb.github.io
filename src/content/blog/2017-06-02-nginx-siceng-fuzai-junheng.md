---
title: Nginx 四层负载均衡
date: '2017-06-02'
description: >-
  Nginx 四层（TCP/UDP）负载均衡的配置和使用。包括静态上游配置、动态负载均衡、基于 consul 的自动发现等。
category: web-infra
tags:
  - nginx
  - mysql
  - haproxy
  - 备份恢复
  - 负载均衡
draft: false
source: evernote-local-db
lang: zh
---
Nginx 四层负载均衡
Nginx 1.9.0版本起支持四层负载均衡，从而使得Nginx变得更加强大。目前，四层软件负载均衡器用得比较多的是HaProxy；而Nginx也支持四层负载均衡，一般场景我们使用Nginx一站式解决方案就够了。本部分将以TCP四层负载均衡进行示例讲解。
在默认情况下，ngx_stream_core_module 是没有启用的，需要在安装 Nginx 时，添加 `--with-stream` 配置参数启用。

```bash
./configure --prefix=/usr/servers --with-stream
```
## stream 指令

配置 HTTP 负载均衡时，配置在 http 指令下；四层负载均衡配置在 stream 指令下：

```nginx
stream {
    upstream mysql_backend {
        ……
    }
    server {
        ……
    }
}
```
## upstream 配置

类似于 HTTP upstream 配置：

```nginx
upstream mysql_backend {
    server 192.168.0.10:3306 max_fails=2 fail_timeout=10s weight=1;
    server 192.168.0.11:3306 max_fails=2 fail_timeout=10s weight=1;
    least_conn;
}
```

失败重试、健康检查、负载均衡算法配置与 HTTP 负载均衡相同，此例实现了两个数据库服务器的 TCP 负载均衡。
## server 配置

```nginx
server {
    #监听端口
    listen 3308;
    #失败重试
    proxy_next_upstream on;
    proxy_next_upstream_timeout 0;
    proxy_next_upstream_tries 0;
    #超时配置
    proxy_connect_timeout 1s;
    proxy_timeout 1m;
    #限速配置
    proxy_upload_rate 0;
    proxy_download_rate 0;
    #上游服务器
    proxy_pass mysql_backend;
}
```

- `listen` 指定监听端口，默认 TCP 协议。若需 UDP，配置为 `listen 3308 udp;`
- `proxy_next_upstream*` - 与 HTTP 负载均衡类似
- `proxy_connect_timeout` - 与上游服务器连接超时时间，默认 60s
- `proxy_timeout` - 连接两次成功读/写的超时时间，超时自动断开（连接存活时间），默认 10 分钟，用于释放不活跃连接
- `proxy_upload_rate`、`proxy_download_rate` - 分别配置从客户端和上游服务器读数据的速率（字节/秒），默认 0（不限速）
接下来就可以连接 Nginx 的 3308 端口访问数据库服务器了。

目前的配置都是静态的。数据库连接一般使用长连接，重启 Nginx 时会看到 Worker 进程一直不退出：

```
nobody 10268 ......nginx: worker process is shutting down
```

这是因为 Worker 维持的长连接在使用中无法退出，解决办法只能杀掉该进程。一般需要重启 Nginx 时都是为了动态添加/删除上游服务器。

## 动态负载均衡
`nginx-stream-upsync-module` 的兄弟模块 `nginx-upsync-module` 提供 HTTP 七层动态负载均衡，支持不重启 Nginx 就动态更新上游服务器。基于 Nginx 1.9.10+ 开发，支持 consul 和 etcd 配置中心。以下基于 Nginx 1.9.10 和 consul 演示。

首先下载并添加模块：

```bash
./configure --prefix=/usr/servers --with-stream --add-module=./nginx-stream-upsync-module
```
### upstream 配置

```nginx
upstream mysql_backend {
    server 127.0.0.1:1111;#占位server
    upsync 127.0.0.1:8500/v1/kv/upstreams/mysql_backend upsync_timeout=6m upsync_interval=500ms upsync_type=consul strong_dependency=off;
    upsync_dump_path /usr/servers/nginx/conf/mysql_backend.conf;
}
```
参数说明：
- `upsync` - 从 consul 指定路径拉取上游服务器配置
- `upsync_timeout` - 从 consul 拉取配置的超时时间
- `upsync_interval` - 从 consul 拉取配置的间隔时间
- `upsync_type` - 指定配置服务器类型（consul）
- `strong_dependency` - Nginx 启动时是否强制依赖配置服务器（on 时拉取失败则启动失败）
- `upsync_dump_path` - 本地持久化路径，consul 出故障时有备份
### 从 Consul 添加上游服务器

```bash
curl -X PUT -d'{"weight":1, "max_fails":2, "fail_timeout":10}' http://127.0.0.1:8500/v1/kv/upstreams/mysql_backend/10.0.0.24:3306
curl -X PUT -d'{"weight":1, "max_fails":2, "fail_timeout":10}' http://127.0.0.1:8500/v1/kv/upstreams/mysql_backend/192.168.0.11:3306
```

### 从 Consul 删除上游服务器

```bash
curl -X DELETE http://127.0.0.1:8500/v1/kv/upstreams/mysql_backend/192.168.0.11:3306
```
### 查看上游服务器列表

```nginx
server {
    listen 1234;
    upstream_show;
}
```

配置 `upstream_show` 指令后，可通过 `curl http://127.0.0.1:1234/upstream_show` 查看当前动态上游服务器列表。

动态负载均衡配置完成。在实际应用中，更多使用 HaProxy 进行四层负载均衡，需根据场景选择方案。

## 实战配置示例
TCP 代理加速测试配置：

```nginx
stream {
    server {
        listen 80;
        # 失败重试
        proxy_next_upstream on;
        proxy_next_upstream_timeout 0;
        proxy_next_upstream_tries 0;
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_timeout 1m;
        # 限速配置
        proxy_upload_rate 0;
        proxy_download_rate 0;
        # 上游服务器
        proxy_pass yau_app;
    }
    upstream yau_app {
        server 183.61.38.230:80 max_fails=2 fail_timeout=10s weight=1;
    }
}

http {
    include mime.types;
    ...
}
```
