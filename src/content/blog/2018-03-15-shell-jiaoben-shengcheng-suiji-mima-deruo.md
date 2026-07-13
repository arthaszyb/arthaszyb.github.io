---
title: Shell脚本生成随机密码的若干种可能
date: '2018-03-15'
description: 生成随机密码的多种方法，包括 urandom、字符串截取、UUID、进程 ID 等方式。
category: shell
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

Shell 脚本生成随机密码的几种方法整理。

## 方法 1：urandom 版本

使用 `/dev/urandom` 和 `tr` 过滤特殊字符：

```bash
#!/bin/bash
tr -dc '_A-Za-z0-9' < /dev/urandom | head -c 10
```

## 方法 2：字符串截取版本

通过 RANDOM 随机数对密码库长度取余，循环提取字符：

```bash
#!/bin/bash
key="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
num=${#key}
pass=''
for i in {1..8}; do
  index=$[RANDOM%num]
  pass=$pass${key:$index:1}
done
echo $pass
```

## 方法 3：UUID 版本

使用 uuidgen 生成 16 进制密码：

```bash
#!/bin/bash
uuidgen
```

## 方法 4：进程 ID 版本

使用 `$$` 获取脚本进程 ID（纯数字）：

```bash
#!/bin/bash
echo $$
```
