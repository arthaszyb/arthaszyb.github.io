---
title: SSHFS 挂载远程目录
date: '2013-12-31'
description: 使用 SSHFS（基于 SSH 的文件系统）挂载远程目录，相比 NFS 配置更简单且更稳定
category: linux
tags:
  - ssh
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---
在 Linux 下挂载远程（别的机器）目录有很多方法，例如 NFS。

之前一直在用 NFS，但配置起来比较麻烦（需要 N 个 C 一个 S），而且不太稳定（断网后无法卸载！）。现在换 SSHFS，它基于 Linux 内置的 SSH 协议，只要有 FUSE 就能正常工作。

## 1、下载

到官网下载最新版本，当前是 2.3：

[http://sourceforge.net/projects/fuse/files/sshfs-fuse/2.3/](http://sourceforge.net/projects/fuse/files/sshfs-fuse/2.3/)

## 2、编译、安装

```bash
tar -xzvf sshfs-fuse-2.3.tar.gz
cd sshfs-fuse-2.3
./configure
make -j
sudo make install
```

## 3、使用

基础挂载命令，sshfs 需要 root 权限：

```bash
sshfs [user@]host:[dir] mountpoint [options]
```

前面和 ssh 命令一样，mountpoint 是挂载点。options 重点关注：

- `-C` 压缩，或者 `-o compression=yes`
- `-o reconnect` 自动重连
- `-o transform_symlinks` 转换绝对链接符号为相对链接符号
- `-o follow_symlinks` 沿用服务器上的链接符号
- `-o cache=yes`
- `-o allow_other` 这个参数最重要，必须写，否则任何文件都是 Permission Deny
