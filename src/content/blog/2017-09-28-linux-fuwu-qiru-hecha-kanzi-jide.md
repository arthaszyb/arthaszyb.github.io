---
title: Linux服务器查看公网出口IP地址
date: '2017-09-28'
description: '在 Linux 命令行下查询服务器的公网出口 IP 地址，包括 curl、wget、host、dig 等多种方法和脚本示例。'
category: linux
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.21yunwei.com/archives/5121
---
在内网环境下，很多情况都需要查询服务器的公网出口 IP。不同场景可选择不同的方法。

## curl 方法

**纯文本格式输出**

```bash
curl icanhazip.com
curl ifconfig.me
curl curlmyip.com
curl ip.appspot.com
curl ipinfo.io/ip
curl ipecho.net/plain
curl www.trackip.net/i
```

**XML 格式输出**

```bash
curl ifconfig.me/all.xml
```

**JSON 格式输出**

```bash
curl ipinfo.io/json
curl ifconfig.me/all.json
curl www.trackip.net/ip?json
```

**获取所有 IP 细节**

```bash
curl ifconfig.me/all
```

## 使用 DYDNS 服务

```bash
curl -s 'http://checkip.dyndns.org/' | sed 's/.*Current IP Address: \([0-9.]*\).*/\1/g'
curl -s http://checkip.dyndns.org/ | grep -o '[[:digit:]\.]*'
```

## 使用 wget

```bash
wget http://ipecho.net/plain -O - -q ; echo
wget http://observebox.com/ip -O - -q ; echo
```

## 使用 host 和 dig

```bash
host -t a dartsclink.com | sed 's/.*has address //'
dig +short myip.opendns.com @resolver1.opendns.com
```

## Bash 脚本示例

**简单获取 IP**

```bash
#!/bin/bash
PUBLIC_IP=$(wget http://ipecho.net/plain -O - -q ; echo)
echo $PUBLIC_IP
```

**定期获取并上传到远程**

```bash
#!/bin/bash
curl ipinfo.io/ip > public_ip.txt
rsync -avz /home/yunwei/public_ip.txt 1.2.3.4:/home/yunwei/
```

执行后，可通过 `cat /home/yunwei/public_ip.txt` 在远程服务器查看公司公网出口 IP。

## 常用查询接口

- ip.cn
- ipinfo.io
- cip.cc
- ifconfig.me
- myip.ipip.net
