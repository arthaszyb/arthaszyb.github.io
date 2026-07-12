---
title: sshfs挂载远程目录
date: '2013-12-31'
description: >-
  在Linux下，有很多挂载远程（别的机器）目录的方法，例如NFS。 
  之前一直在用NFS，但是配置起来比较麻烦（需要N个C一个S），而且不太稳定（断网后无法卸载！
  ），现在换sshfs，它基于Linux内置的ssh协议，只要又FUSE就能正常工作。
category: linux
tags:
  - ssh
  - nfs
draft: false
source: evernote-local-db
lang: zh
---
在Linux下，有很多挂载远程（别的机器）目录的方法，例如NFS。

之前一直在用NFS，但是配置起来比较麻烦（需要N个C一个S），而且不太稳定（断网后无法卸载！），现在换sshfs，它基于Linux内置的ssh协议，只要又FUSE就能正常工作。

1、下载

到官网下载最新版本，当前是2.3

[http://sourceforge.net/projects/fuse/files/sshfs-fuse/2.3/](http://sourceforge.net/projects/fuse/files/sshfs-fuse/2.3/)

2、编译、安装

#相关代码

<table><tbody><tr><td><div><span><span>tar</span></span><span><span>-xzvf sshfs-fuse-2.3.tar.gz</span></span></div><div><span><span>cd</span></span><span><span>sshfs-fuse-2.3</span></span></div><div><span><span>./configure</span></span></div><div><span><span>make</span></span><span><span>-j</span></span></div><div><span><span>sudo</span></span><span><span>make</span></span><span><span>install</span></span></div></td></tr></tbody></table>

3、使用

基础挂载命令即sshfs需要root权限。

sshfs \[user@\]host:\[dir\] mountpoint \[options\]

前面和ssh命令一样，mountpoint是挂载点

options重点关注下：

-C 压缩，或者-o compression=yes

-o reconnect 自动重连

-o transform\_symlinks 表示转换绝对链接符号为相对链接符号

-o follow\_symlinks 沿用服务器上的链接符号

-o cache=yes

\-o allow\_other 这个参数最重要，必须写，否则任何文件都是Permission Deny
