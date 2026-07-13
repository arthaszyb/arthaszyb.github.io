---
title: 提取 IP 地址
date: '2013-11-19'
description: Bash 脚本中提取 IP 地址和字符串切割的方法。使用 ifconfig、grep、sed 等工具获取 IP，使用字符串切割操作 ${var:offset} 处理域名。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

## 提取 IP 地址

从 ifconfig 中提取第一个 IP 地址的两种方法：

```bash
# 方法 1：使用 head
ifconfig | grep "inet addr" | grep -o "[0-9.]\{1,\}" | head -n 1
192.168.70.41

# 方法 2：使用 sed
ifconfig | grep "inet addr" | grep -o "[0-9.]\{1,\}" | sed -n 1p
192.168.70.41
```

## 字符串切割：${var:offset}

从指定位置开始提取字符串后续部分。

```bash
a="www.nana.com"
b=${a:4}
echo $b
nana.com

b=${a:6}
echo $b
na.com
```

## 实际应用

提取域名后面的内容（如从 `www.example.com` 提取 `example.com`）：

```bash
web_domain=$1
proto_head=$(echo $domain | cut -d"." -f1)
_length=$(expr length $proto_head)  # 计算字符长度
mail_domain=${web_domain:$_length}
```

步骤：
1. 获取第一个部分（如 `www`）
2. 计算其长度
3. 使用字符串切割获取剩余部分
