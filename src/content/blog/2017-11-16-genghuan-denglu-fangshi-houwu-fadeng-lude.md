---
title: 更换登录方式后无法登录的解决方法
date: '2017-11-16'
description: 'SSH 登录时 Host key 不匹配导致的 "Host key verification failed" 错误及解决方法。'
category: linux
tags:
  - ssh
draft: false
source: evernote-local-db
lang: zh
---
重装系统或更换登录方式（密钥改密码等）后，SSH 登录失败。

## 错误信息

```
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.

The fingerprint for the RSA key sent by the remote host is
c4:4e:a1:56:ad:32:a0:c5:90:03:4e:b8:a9:ef:e4:a0.

Please contact your system administrator.
Add correct host key in /usr/local/app/.ssh/known_hosts to get rid of this message.

Offending RSA key in /usr/local/app/.ssh/known_hosts:20

RSA host key for [111.230.197.74]:36000 has changed and you have requested strict checking.
Host key verification failed.
```

## 原因

登录客户端的 `~user/.ssh/known_hosts` 文件中对应 IP 的信息发生变化。旧信息与新的服务器 key 不匹配，导致连接失败。

## 解决方法

删除登录客户端的 `~user/.ssh/known_hosts` 文件中该 IP 对应的行：

```bash
# 方法1：编辑文件，删除对应行
vi ~/.ssh/known_hosts

# 方法2：使用 ssh-keygen 删除
ssh-keygen -R 111.230.197.74

# 方法3：清空整个文件（若仅一个 IP）
> ~/.ssh/known_hosts
```

下次登录时系统会自动添加新的 host key。
