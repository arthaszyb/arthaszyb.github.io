---
title: 单台服务器上的并发 TCP 连接数
date: '2015-07-09'
description: 分析单台服务器理论上能支持多少 TCP 并发连接，厘清文件句柄限制才是真正瓶颈，而端口号 65535 并非并发上限。
category: linux
tags:
  - 网络排查
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
origin_url: http://yaocoder.blog.51cto.com/2668309/1312821
---
单台服务器到底能支持多少 TCP 并发连接？从硬件和操作系统来看，单机支持上万并发早已不是挑战。在做水平扩展前先尽量垂直挖掘单机资源，能有效节省服务器开支。以下厘清两个常见认识误区。

## 文件句柄限制（真正的瓶颈）

Linux 下每个 TCP 连接都要占一个文件描述符，用完后新连接会返回 `Socket/File: Can't open so many files`。

**进程级限制**：

- `ulimit -n` 输出 1024，表示单进程最多打开 1024 个文件，默认配置下最多并发上千个 TCP 连接。
- 临时修改：`ulimit -n 1000000`（仅对当前登录会话有效，重启或退出失效）。
- 通过配置文件修改：编辑 `/etc/security/limits.conf`：

```text
* soft nofile 1000000
* hard nofile 1000000
```

- 永久修改：编辑 `/etc/rc.local` 添加 `ulimit -SHn 1000000`。

**全局限制**：

- `cat /proc/sys/fs/file-nr` 输出三个值：已分配句柄数、已分配但未使用数（kernel 2.6 中恒为 0）、最大句柄数。
- 用 root 修改 `/etc/sysctl.conf` 调大：

```ini
fs.file-max = 1000000
net.ipv4.ip_conntrack_max = 1000000
net.ipv4.netfilter.ip_conntrack_max = 1000000
```

## 端口号 65535 不是并发上限

常见误解：端口 1024–65535 归用户使用，每个 TCP 连接占一个端口，所以最多 6 万多并发。这是错的。

- **如何标识一个 TCP 连接**：系统用四元组 `{local ip, local port, remote ip, remote port}` 唯一标识。服务端只用 bind 时的那一个端口，65535 不是并发量的限制。
- **server 最大 TCP 连接数**：server 固定监听某本地端口，四元组中只有 remote ip 和 remote port 可变。因此理论最大连接数 = 客户端 ip 数 × 客户端 port 数。对 IPv4 约为 2³²（ip）× 2¹⁶（port）= 2⁴⁸。

## 总结

以上都是理论上限，实际单机并发数还受内存、带宽等硬件与网络资源限制。但对大多数需求，单机做到数十万级并发已完全可行。
