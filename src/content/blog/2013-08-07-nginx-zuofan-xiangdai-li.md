---
title: nginx 做反向代理
date: '2013-08-07'
description: "Nginx 反向代理部署指南：安装前置依赖（PCRE、OpenSSL），编译配置，生成 SSL 证书，配置 upstream 和反向代理，常用管理命令。"
category: web-infra
tags:
  - nginx
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
---

## 1. 安装 Nginx

### 安装前置依赖

确保系统有 PCRE（Perl Compatible Regular Expressions）包，以支持 nginx 中的正则表达式。从官方源下载、编译、安装：

```bash
# wget ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/pcre-8.12.tar.bz2
# tar jxvf pcre-8.12.tar.bz2
# cd pcre-8.10
# ./configure --enable-utf8
# make
# make install
```

### 创建 nginx 用户及用户组

```bash
# useradd www-nginx
# groupadd www
# gpasswd -a www-nginx www
```

### 编译安装 Nginx

```bash
# wget http://nginx.org/download/nginx-1.0.3.tar.gz
# tar zxvf nginx-1.0.3.tar.gz
# cd nginx-1.0.3
# ./configure \
  --prefix=/usr \
  --sbin-path=/usr/sbin \
  --conf-path=/etc/nginx/nginx.conf \
  --error-log-path=/var/log/nginx/error.log \
  --pid-path=/var/run/nginx/nginx.pid \
  --lock-path=/var/lock/nginx.lock \
  --user=www-nginx \
  --group=www \
  --with-http_ssl_module \
  --with-http_stub_status_module \
  --with-http_flv_module \
  --with-http_gzip_static_module \
  --http-log-path=/var/log/nginx/access.log \
  --http-client-body-temp-path=/var/tmp/nginx/client/ \
  --http-proxy-temp-path=/var/tmp/nginx/proxy/ \
  --http-fastcgi-temp-path=/var/tmp/nginx/fcgi/
# make
# make install
```

**简化编译（常用选项）**：

```bash
# ./configure \
  --user=www-nginx \
  --group=www \
  --prefix=/opt/nginx \
  --with-http_stub_status_module \
  --with-http_ssl_module
# make && make install
```

**编译选项说明**：

- `--with-http_stub_status_module`：启用 nginx status 功能，用于监控 nginx 状态
- `--with-http_ssl_module`：启用 SSL/TLS 模块
- `--with-ipv6`：支持 IPv6
- `--with-pcre`, `--with-openssl`, `--with-zlib` 后接的路径应为**源代码路径**而非安装路径

**安装后结构**：安装成功后，`/opt/nginx` 目录下有四个子目录：

- `conf/`：配置文件（nginx.conf）
- `html/`：默认网页
- `logs/`：日志文件
- `sbin/`：nginx 可执行文件

启动 nginx：

```bash
# sbin/nginx
```

打开浏览器访问服务器 IP，看到"Welcome to nginx!"表示安装成功。

## 2. 使用 OpenSSL 生成证书

创建证书存放目录：

```bash
# mkdir /opt/nginx/sslkey
# cd /opt/nginx/sslkey
```

### 生成 RSA 密钥

```bash
# openssl genrsa -out key.pem 2048
```

### 生成证书请求

```bash
# openssl req -new -key key.pem -out cert.csr
```

会提示输入省份、城市、域名等信息。将此文件提交给数字证书颁发机构（CA）获取正式证书。

**自签名测试证书**（不向 CA 申请）：

```bash
# openssl req -new -x509 -nodes -out server.crt -keyout server.key
```

## 3. Nginx 反向代理配置

### 基本反向代理配置

在 `nginx.conf` 中定义 upstream 和服务器块：

```nginx
upstream payment {
    server 127.0.0.1:8080;
    server 127.0.0.1:8090;
}

# HTTPS 服务器
server {
    listen 443;
    server_name www.openeasy.net;
    
    ssl on;
    ssl_certificate /opt/nginx/sslkey/server.crt;
    ssl_certificate_key /opt/nginx/sslkey/server.key;
    ssl_session_timeout 5m;
    ssl_protocols SSLv2 SSLv3 TLSv1;
    ssl_ciphers ALL:!ADH:!EXPORT56:RC4+RSA:+HIGH:+MEDIUM:+LOW:+SSLv2:+EXP;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass http://payment/;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 10s;
        proxy_read_timeout 10s;
    }
}
```

### Upstream 说明

`upstream payment { ... }` 定义后端服务器池，location 中的 `proxy_pass http://payment/;` 将请求转发到该池中的服务器。

## 4. Nginx 管理命令

### 程序运行参数

Nginx 仅有一个可执行文件，通过命令行参数和系统信号控制：

- `-c FILE`：指定配置文件（默认 conf/nginx.conf）
- `-t`：测试配置文件语法，重新加载前必用
- `-v`：显示版本号
- `-V`：显示版本和编译信息

**示例**：测试配置文件

```bash
# sbin/nginx -t -c conf/nginx2.conf
```

### 信号控制

通过 `kill -SIGNAL PID` 或 `killall -s SIGNAL nginx` 控制 nginx：

| 信号 | 作用 |
|------|------|
| TERM, INT | 快速关闭，中止当前请求 |
| QUIT | 关闭前完成所有请求 |
| HUP | 重新加载配置，启动新工作进程，关闭旧进程（不中断连接） |
| USR1 | 重新打开日志文件（日志轮转） |
| USR2 | 平滑升级可执行程序 |
| WINCH | 从容关闭工作进程 |

**示例**：重新加载配置

```bash
# kill -HUP `cat logs/nginx.pid`
# 或
# killall -s HUP nginx
```

当 PID 文件在 `logs/nginx.pid` 时，可通过 `cat` 读取当前进程 ID。
