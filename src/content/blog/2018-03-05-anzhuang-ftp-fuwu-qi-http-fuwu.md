---
title: FTP 和网络 yum 源配置
date: '2018-03-05'
description: "搭建 FTP 服务器共享 RPM 包，配置网络 yum 源供客户端下载软件。"
category: linux
tags:
  - ftp
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

## 服务器端配置

挂载光盘并安装 FTP 服务：

```bash
mkdir /mnt/cdrom
mount /dev/cdrom /mnt/cdrom
cd /mnt/cdrom/Server
rpm -ivh vsftpd-2.0.5-16.el5.i386.rpm
cp -r /mnt/cdrom/. /var/ftp/pub/
service vsftpd restart
```

各源目录中都包含 repodata 目录（Repository metadata）。

## 客户端配置

创建 yum 仓库配置文件：

```bash
cd /etc/yum.repos.d/
cp -p rhel-debuginfo.repo yum.repo
vim yum.repo
```

配置文件中指定服务器地址和源路径，然后：

```bash
yum repolist
```

验证配置，会自动下载 `primary.xml.gz` 等元数据。服务器更新软件后，客户端可查看到最新包列表。
