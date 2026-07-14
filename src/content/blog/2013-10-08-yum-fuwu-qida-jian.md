---
title: YUM 服务器搭建
date: '2013-10-08'
description: 基于 FTP 或 HTTP 搭建本地 YUM 源，共享 RPM 包目录，让客户机可以从 YUM 服务器上下载和安装软件包
category: linux
tags:
  - ftp
  - linux-admin
  - rpm
draft: false
source: evernote-local-db
lang: zh
---

安装 FTP 服务器（HTTP 服务器也可以，目的就是共享 RPM 目录，可将源目录软链接到共享目录下），将原文件存储在 FTP 上，然后安装网络 YUM，实现客户机可以从 YUM 服务器上下载软件包。

## 服务器端操作

```bash
# 建立挂载点
mkdir /mnt/cdrom/

# 挂载光盘
mount /dev/cdrom /mnt/cdrom/

# 切换到光盘 Server 目录
cd /mnt/cdrom/Server/

# 安装 FTP 服务器
rpm -ivh vsftpd-2.0.5-16.el5.i386.rpm

# 将光盘文件全部拷贝到 /var/ftp/pub/ 中
cp -r /mnt/cdrom/. /var/ftp/pub/

# 重启 FTP 服务器
service vsftpd restart

# 查看 repodata 文件
cd /mnt/cdrom/Server/repodata/
```

## 客户端操作

在 Server、VT、Cluster、ClusterStorage 目录中都有一个 repodata 文件。

```bash
# 切换到 yum 配置目录
cd /etc/yum.repos.d/

# 拷贝模板文件
cp -p rhel-debuginfo.repo yum.repo

# 编辑该文件（配置 FTP 服务器地址）
vim yum.repo

# 加载仓库列表
yum repolist
```

**测试**：服务器端更新了软件后，在客户端查看软件包信息是否能看到更新的软件。通过 FTP 服务器将软件导入到 `/var/ftp/pub/Server` 目录中。
