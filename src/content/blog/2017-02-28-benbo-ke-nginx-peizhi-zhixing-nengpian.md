---
title: 本博客 Nginx 配置之性能篇
date: '2017-02-28'
description: >-
  Nginx 性能优化配置笔记：TCP 优化（sendfile、tcp_nopush、TCP Fast Open、reuseport）、Gzip
  压缩、proxy_cache 服务端缓存与浏览器强缓存/协商缓存、SPDY（HTTP/2）以及 HTTPS 优化（TLS 会话恢复、OCSP Stapling）。
category: web-infra
tags:
  - nginx
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
origin_url: https://imququ.com/post/my-nginx-conf-for-wpo.html
---

WEB 性能优化是一个系统工程，涵盖很多方面。本文整理博客（imququ.com）Nginx 配置中与性能有关的部分。注意：部分配置需要较高版本的 Linux 内核才支持。

## TCP 优化

```nginx
http {
    sendfile           on;
    tcp_nopush         on;
    tcp_nodelay        on;
    keepalive_timeout  60;
    ... ...
}
```

- `sendfile`：提高静态资源托管效率。sendfile 是一个系统调用，直接在内核空间完成文件发送，不需要先 read 再 write，没有上下文切换开销。
- `tcp_nopush`：对应 FreeBSD 的 TCP_NOPUSH / Linux 的 TCP_CORK，只在启用了 sendfile 后才生效。启用后数据包累计到一定大小才发送，减小额外开销，提高网络效率。
- `tcp_nodelay`：禁用 Nagle 算法，尽快发送数据，某些情况下可节约 200ms（Nagle 算法：发出去的数据未被确认之前，新生成的小数据先存起来，凑满一个 MSS 或收到确认后再发送）。Nginx 只对处于 keep-alive 状态的 TCP 连接启用 tcp_nodelay。TCP_NOPUSH 与 TCP_NODELAY 看似矛盾，实际可以一起用，最终效果是先填满包，再尽快发送。
- `keepalive_timeout`：每个 TCP 连接最多保持的时间。Nginx 默认 75 秒，有些浏览器最多只保持 60 秒，所以统一设为 60。

另外两个 TCP 优化策略（配置在后面 SPDY 一节给出）：

- **TCP Fast Open（TFO）**：优化 TCP 握手过程。客户端第一次建连仍走三次握手，但会在第一个 SYN 中设置 Fast Open 标识，服务端生成 Fast Open Cookie 放在 SYN-ACK 里，客户端存下该 Cookie 供之后的 SYN 使用。详见 RFC7413。现阶段只有 Linux、ChromeOS 和 Android 5.0 的 Chrome/Chromium 支持。
- **SO_REUSEPORT**：Nginx 1.9.1 增加 reuseport 功能。启用后 Nginx 在指定端口上监听多个 socket，每个 Worker 分到一个，内核自动把请求通过不同 socket 分配给对应 Worker，相比单 socket 多 Worker 模式提高了分发效率。

## 开启 Gzip

对文本文件在服务端发送响应之前进行 GZip 压缩，通常压缩后的文本大小会减小到原来的 1/4 - 1/3：

```nginx
http {
    gzip               on;
    gzip_vary          on;

    gzip_comp_level    6;
    gzip_buffers       16 8k;

    gzip_min_length    1000;
    gzip_proxied       any;
    gzip_disable       "msie6";

    gzip_http_version  1.0;

    gzip_types         text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;
    ... ...
}
```

- `gzip_vary`：输出 Vary 响应头，解决某些缓存服务的问题。
- `gzip_disable`：接受正则表达式，UserAgent 匹配时不启用 GZip。`msie6` 等价于 `MSIE [4-6]\.` 但性能更好；Nginx 0.8.11 后 msie6 不会匹配 UA 含 SV1 的 IE6（该版本已修复 GZip 相关 Bug）。
- `gzip_http_version 1.0`：默认 Nginx 只对 HTTP/1.1 及以上请求启用 GZip（部分早期 HTTP/1.0 客户端处理 GZip 有 Bug），现在基本可忽略此情况，故对 HTTP/1.0 也开启。

## 开启缓存

### 服务端

页面静态化可以省掉所有代码逻辑和数据库开销，这里直接使用 Nginx 的 proxy_cache：

```nginx
proxy_cache_path  /home/jerry/cache/nginx/proxy_cache_path levels=1:2 keys_zone=pnc:300m inactive=7d max_size=10g;
proxy_temp_path   /home/jerry/cache/nginx/proxy_temp_path;
proxy_cache_key   $host$uri$is_args$args;

server {
    location / {
        resolver                 127.0.0.1;

        proxy_cache              pnc;
        proxy_cache_valid        200 304 2h;
        proxy_cache_lock         on;
        proxy_cache_lock_timeout 5s;
        proxy_cache_use_stale    updating error timeout invalid_header http_500 http_502;

        proxy_http_version       1.1;

        proxy_ignore_headers     Set-Cookie;
        ... ...
    }
    ... ...
}
```

在最外层定义缓存目录并指定名称（keys_zone），对状态值等于 200 和 304 的响应缓存 2 小时。默认情况下响应头里有 Set-Cookie 字段时 Nginx 不会缓存该响应；这里 Set-Cookie 对用户没有用也不影响输出内容，故通过 `proxy_ignore_headers` 移除。

### 客户端

HTTP/1.1 缓存机制要点：

- **协商缓存（弱缓存）**：服务端通过 `Last-Modified`（最后修改时间）或 `ETag`（内容特征）标记实体；浏览器下次请求带上 `If-Modified-Since` 或 `If-None-Match` 询问是否过期。未过期则返回 304 空正文，否则返回 200 及新内容。不节省连接数，但缓存生效时大幅减小传输内容。Last-Modified 的问题：1）只能精确到秒；2）负载均衡轮询时各机器文件修改时间不一致，有缓存无故失效和不更新的风险。ETag 一般对资源内容做摘要，可解决这些问题。
- **强缓存**：服务端通过 `Expires`（绝对时间）或 `Cache-Control: max-age=xxx`（相对时间）告知浏览器在此之前不再请求。命中后完全没有 HTTP 请求。一般对 CSS、JS、图片等资源使用强缓存，入口文件（HTML）使用协商缓存或不缓存，通过修改入口文件中强缓存资源的引入 URL 达到即时更新。Cache-Control 功能更强，且 max-age 是相对时间，不受服务端/客户端时间不一致影响。
- 普通刷新（F5）使用协商缓存、忽略强缓存；强刷（Ctrl+F5）忽略所有缓存（请求头携带 `Cache-Control:no-cache` 与 `Pragma:no-cache`）。只有从地址栏、收藏夹、点击链接等情况下浏览器才使用强缓存。

Nginx 默认对静态资源输出 Last-Modified，ETag、Expires 和 Cache-Control 需自行配置：

```nginx
location ~ ^/static/ {
    root    /home/jerry/www/blog/www;
    etag    on;
    expires max;
}
```

`expires` 可指定具体 max-age（如 `10y` 为 10 年）；指定为 `max` 时，输出的 Expires 是 2037 年最后一天，Cache-Control 的 max-age 是 10 年（3650 天，315360000 秒）。

## 使用 SPDY（HTTP/2）

现阶段 Nginx 只支持 SPDY/3.1，编译时需加上 `--with-http_spdy_module` 和 `--with-http_ssl_module`：

```nginx
server {
    listen             443 ssl spdy fastopen=3 reuseport;
    spdy_headers_comp  6;
    ... ...
}
```

- `fastopen=3`：开启 TCP Fast Open，3 代表最多只能有 3 个未经三次握手的 TCP 链接排队，超过则退化到普通 TCP 握手流程，用于防止资源耗尽攻击。
- `reuseport`：启用 TCP SO_REUSEPORT 选项。

## HTTPS 优化

建立 HTTPS 连接本身就慢（获取证书、校验证书、TLS 握手等），必须优化：

```nginx
server {
    ssl_session_cache        shared:SSL:10m;
    ssl_session_timeout      60m;

    ssl_session_tickets      on;

    ssl_stapling             on;
    ssl_stapling_verify      on;
    ssl_trusted_certificate  /xxx/full_chain.crt;

    resolver                 8.8.4.4 8.8.8.8 valid=300s;
    resolver_timeout         10s;
    ... ...
}
```

两部分内容：

- **TLS 会话恢复**：简化 TLS 握手，两种方案——Session Cache（存在服务端，占用服务端资源，主流浏览器都支持）和 Session Ticket（存在客户端，不占服务端资源，支持度一般）。
- **OCSP Stapling**：浏览器可能在建立 TLS 连接时在线验证证书有效性，阻塞握手。OCSP Stapling 让服务端在证书链中封装 CA 的 OCSP（Online Certificate Status Protocol）响应，浏览器可跳过在线查询。服务端获取 OCSP 更快也可更好地缓存。配置后可用 Qualys SSL Server Test 验证是否生效。

证书链选择注意：浏览器验证信任链时从站点证书递归验证父证书直至信任的根证书。1）证书在握手期间发送，受 TCP 初始拥塞窗口限制，证书太长可能产生额外往返开销；2）服务端证书若不含中间证书，浏览器会暂停验证并按子证书指定的 URL 自行获取中间证书，产生额外 DNS 解析、建连开销。最佳实践是证书链包含站点证书和中间证书两部分。
