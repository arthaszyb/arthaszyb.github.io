---
title: linux下普通用户如何使用80端口启动程序
date: '2014-05-14'
description: 普通用户无权占用1024以下端口，但可通过setuid给可执行文件赋权限，或用iptables做端口转发来解决。
category: linux
tags:
  - nginx
  - apache
  - iptables
  - tomcat
draft: false
source: evernote-local-db
lang: zh
---

默认情况下，Linux 的 1024 以下端口只有 root 用户才有权限占用，这会导致 tomcat、apache、nginx 等程序用普通用户启动时抛出 permission denied 异常。

解决办法有两种：

**1. 使用非 80 端口启动，通过 iptables 做端口转发**

**2. 为可执行文件赋 setuid 权限**

假设需要启动 nginx，步骤如下：

首先查看 nginx 的权限描述：

```bash
ls -l nginx
```

输出：`-rwxr-xr-x 1 nginx dev 2408122 Sep 5 16:01 nginx`

这个时候无法正常启动。

修改文件所属用户为 root：

```bash
chown root nginx
```

然后加上 setuid（s）权限：

```bash
chmod u+s nginx
```

再次查看权限描述：

```bash
ls -l nginx
```

输出：`-rwsr-xr-x 1 root root 2408122 Sep 5 16:01 nginx`

这个时候再启动就没问题了。

参考：[http://bbs.chinaunix.net/thread-2212303-2-1.html](http://bbs.chinaunix.net/thread-2212303-2-1.html)
