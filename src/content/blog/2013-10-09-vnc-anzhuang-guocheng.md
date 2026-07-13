---
title: vnc安装过程
date: '2013-10-09'
description: VNC 服务器安装配置步骤，包括 vnc-server 安装、密码设置、vncservers 配置和 xstartup 编辑。
category: misc
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

通过 yum 安装 vnc-server，然后配置 VNC 服务运行参数和启动脚本。

## 安装和配置步骤

1. yum 安装 vnc-server
2. 执行 vncserver，设置密码
3. 修改 /etc/sysconfig/vncservers，增加下两行：

```bash
VNCSERVERS=”2:root”
VNCSERVERARGS[2]=”-geometry 800x600 tcp”
```

4. 修改 /root/.vnc/xstartup，将 xsetroot 和 vncconfig 两行注释掉，增加 gnome-session：

```bash
# xsetroot -solid grey
# vncconfig -iconic &
gnome-session &
```

如果出现”bad display name”错误，则检查 /etc/hosts 文件中 127.0.0.1 的名称配置。
