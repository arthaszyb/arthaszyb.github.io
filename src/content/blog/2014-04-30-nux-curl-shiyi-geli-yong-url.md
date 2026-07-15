---
title: curl 命令参数与用法
date: '2014-04-30'
description: curl 是命令行下的文件传输工具，支持文件上传下载及多种协议。整理常用参数及实例用法。
category: shell
tags:
  - ftp
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
origin_url: https://blog.51yip.com
---
curl 是命令行下的文件传输工具，支持上传下载及 HTTP/FTP 等多种协议。以下整理常用参数与实例。

## 常用参数

```text
-a/--append              上传文件时，附加到目标文件
-A/--user-agent <string> 设置用户代理发送给服务器
--anyauth                可以使用"任何"身份验证方法
-b/--cookie <name=string/file>  cookie 字符串或文件读取位置
--basic                  使用 HTTP 基本验证
-B/--use-ascii           使用 ASCII/文本传输
-c/--cookie-jar <file>   操作结束后把 cookie 写入到这个文件中
-C/--continue-at <offset>  断点续转
-d/--data <data>         HTTP POST 方式传送数据
--data-ascii <data>      以 ascii 的方式 post 数据
--data-binary <data>     以二进制的方式 post 数据
--negotiate              使用 HTTP 身份验证
--digest                 使用数字身份验证
--disable-eprt           禁止使用 EPRT 或 LPRT
--disable-epsv           禁止使用 EPSV
-D/--dump-header <file>  把 header 信息写入到该文件中
--egd-file <file>        为随机数据(SSL)设置 EGD socket 路径
--tcp-nodelay            使用 TCP_NODELAY 选项
-e/--referer             来源网址
-E/--cert <cert[:passwd]>  客户端证书文件和密码 (SSL)
--cert-type <type>       证书文件类型 (DER/PEM/ENG) (SSL)
--key <key>              私钥文件名 (SSL)
--key-type <type>        私钥文件类型 (DER/PEM/ENG) (SSL)
--pass <pass>            私钥密码 (SSL)
--engine <eng>           加密引擎使用 (SSL)，"--engine list" 列出
--cacert <file>          CA 证书 (SSL)
--capath <directory>     CA 目录 (made using c_rehash) (SSL)
--ciphers <list>         SSL 密码
--compressed             要求返回是压缩的形式 (deflate 或 gzip)
--connect-timeout <seconds>  设置最大请求时间
--create-dirs            建立本地目录的目录层次结构
--crlf                   上传时把 LF 转变成 CRLF
-f/--fail                连接失败时不显示 http 错误
--ftp-create-dirs        如果远程目录不存在，创建远程目录
--ftp-method [multicwd/nocwd/singlecwd]  控制 CWD 的使用
--ftp-pasv               使用 PASV/EPSV 代替端口
--ftp-skip-pasv-ip       使用 PASV 的时候，忽略该 IP 地址
--ftp-ssl                尝试用 SSL/TLS 来进行 ftp 数据传输
--ftp-ssl-reqd           要求用 SSL/TLS 来进行 ftp 数据传输
-F/--form <name=content>   模拟 http 表单提交数据
--form-string <name=string>  模拟 http 表单提交数据
-g/--globoff             禁用网址序列和范围使用 {} 和 []
-G/--get                 以 get 的方式来发送数据
-h/--help                帮助
-H/--header <line>       自定义头信息传递给服务器
--ignore-content-length  忽略 HTTP 头信息的长度
-i/--include             输出时包括 protocol 头信息
-I/--head                只显示文档信息
-j/--junk-session-cookies  读取文件时忽略 session cookie
--interface <interface>  使用指定网络接口/地址
--krb4 <level>           使用指定安全级别的 krb4
-k/--insecure            允许不使用证书到 SSL 站点
-K/--config              指定的配置文件读取
-l/--list-only           列出 ftp 目录下的文件名称
--limit-rate <rate>      设置传输速度
--local-port <NUM>       强制使用本地端口号
-m/--max-time <seconds>  设置最大传输时间
--max-redirs <num>       设置最大读取的目录数
--max-filesize <bytes>   设置最大下载的文件总量
-M/--manual              显示全手动
-n/--netrc               从 netrc 文件中读取用户名和密码
--netrc-optional         使用 .netrc 或者 URL 来覆盖 -n
--ntlm                   使用 HTTP NTLM 身份验证
-N/--no-buffer           禁用缓冲输出
-o/--output              把输出写到该文件中
-O/--remote-name         把输出写到该文件中，保留远程文件的文件名
-p/--proxytunnel         使用 HTTP 代理
--proxy-anyauth          选择任一代理身份验证方法
--proxy-basic            在代理上使用基本身份验证
--proxy-digest           在代理上使用数字身份验证
--proxy-ntlm             在代理上使用 ntlm 身份验证
-P/--ftp-port <address>  使用端口地址，而不是使用 PASV
-Q/--quote <cmd>         文件传输前，发送命令到服务器
-r/--range <range>       检索来自 HTTP/1.1 或 FTP 服务器字节范围
--range-file             读取（SSL）的随机文件
-R/--remote-time         在本地生成文件时，保留远程文件时间
--retry <num>            传输出现问题时，重试的次数
--retry-delay <seconds>  传输出现问题时，设置重试间隔时间
--retry-max-time <seconds>  传输出现问题时，设置最大重试时间
-s/--silent              静音模式，不输出任何东西
-S/--show-error          显示错误
--socks4 <host[:port]>   用 socks4 代理给定主机和端口
--socks5 <host[:port]>   用 socks5 代理给定主机和端口
--stderr <file>
-t/--telnet-option <OPT=val>  Telnet 选项设置
--trace <file>           对指定文件进行 debug
--trace-ascii <file>     Like --trace 但没有 hex 输出
--trace-time             跟踪/详细输出时，添加时间戳
-T/--upload-file <file>  上传文件
--url <URL>              Set URL to work with
-u/--user <user[:password]>  设置服务器的用户和密码
-U/--proxy-user <user[:password]>  设置代理用户名和密码
-v/--verbose
-V/--version             显示版本信息
-w/--write-out [format]  什么输出完成后
-x/--proxy <host[:port]> 在给定的端口上使用 HTTP 代理
-X/--request <command>   指定什么命令
-y/--speed-time          放弃限速所要的时间，默认为 30
-Y/--speed-limit         停止传输速度的限制
-z/--time-cond           传送时间设置
-0/--http1.0             使用 HTTP 1.0
-1/--tlsv1               使用 TLSv1 (SSL)
-2/--sslv2               使用 SSLv2 (SSL)
-3/--sslv3               使用 SSLv3 (SSL)
--3p-quote               like -Q for the source URL for 3rd party transfer
--3p-url                 使用 url，进行第三方传送
--3p-user                使用用户名和密码，进行第三方传送
-4/--ipv4                使用 IPv4
-6/--ipv6                使用 IPv6
-#/--progress-bar        用进度条显示当前的传送状态
```

## 常用 curl 实例

**1. 抓取页面内容到一个文件中**

```bash
curl -o home.html http://blog.51yip.com
```

**2. 用 -O（大写），后面的 url 要具体到某个文件；也可用正则抓取**

```bash
curl -O http://blog.51yip.com/wp-content/uploads/2010/09/compare_varnish.jpg
curl -O http://blog.51yip.com/wp-content/uploads/2010/[0-9][0-9]/aaaaa.jpg
```

**3. 模拟表单信息、模拟登录，保存 cookie 信息**

```bash
curl -c ./cookie_c.txt -F log=aaaa -F pwd=****** http://blog.51yip.com/wp-login.php
```

**4. 模拟表单信息、模拟登录，保存头信息**

```bash
curl -D ./cookie_D.txt -F log=aaaa -F pwd=****** http://blog.51yip.com/wp-login.php
```

`-c`（小写）产生的 cookie 和 `-D` 里面的 cookie 是不一样的。

**5. 使用 cookie 文件**

```bash
curl -b ./cookie_c.txt http://blog.51yip.com/wp-admin
```

**6. 断点续传，-C（大写）**

```bash
curl -C -O http://blog.51yip.com/wp-content/uploads/2010/09/compare_varnish.jpg
```

**7. 传送数据**（最好用登录页面测试，传值过去后 curl 回抓数据，可看到传值是否成功）

```bash
curl -d log=aaaa http://blog.51yip.com/wp-login.php
```

**8. 显示抓取错误**

```bash
curl -f http://blog.51yip.com/asdf
# curl: (22) The requested URL returned error: 404
```

**9. 伪造来源地址**（有的网站会判断请求来源地址）

```bash
curl -e http://localhost http://blog.51yip.com/wp-login.php
```

**10. 使用代理**（频繁请求时对方可能屏蔽 IP）

```bash
curl -x 24.10.28.84:32779 -o home.html http://blog.51yip.com
```

**11. 比较大的文件分段下载**

```bash
curl -r 0-100   -o img.part1 http://blog.51yip.com/wp-content/uploads/2010/09/compare_varnish.jpg
curl -r 100-200 -o img.part2 http://blog.51yip.com/wp-content/uploads/2010/09/compare_varnish.jpg
curl -r 200-    -o img.part3 http://blog.51yip.com/wp-content/uploads/2010/09/compare_varnish.jpg
# 下载完成后合并：
cat img.part* > img.jpg
```

**12. 不显示下载进度信息**

```bash
curl -s -o aaa.jpg http://blog.51yip.com/wp-content/uploads/2010/09/compare_varnish.jpg
```

**13. 显示下载进度条**

```bash
curl -# -O http://blog.51yip.com/wp-content/uploads/2010/09/compare_varnish.jpg
```

**14. 通过 ftp 下载文件**

```bash
curl -u 用户名:密码 -O http://blog.51yip.com/demo/curtain/bbstudy_files/style.css
# 或者：
curl -O ftp://用户名:密码@ip:port/demo/curtain/bbstudy_files/style.css
```

**15. 通过 ftp 上传**

```bash
curl -T test.sql ftp://用户名:密码@ip:port/demo/curtain/bbstudy_files/
```
