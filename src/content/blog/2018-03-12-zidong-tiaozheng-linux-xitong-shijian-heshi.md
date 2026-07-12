---
title: 自动调整 Linux 系统时间和时区与 Internet 时间同步
date: '2018-03-12'
description: >-
  Linux 系统时间调整方法笔记：修改时区、配置新时间、通过 ntpdate 实现手动或定时同步 Internet 时间，包括修改 BIOS 时间命令。
category: linux
tags:
  - linux-admin
  - crontab
draft: false
source: evernote-local-db
lang: zh
origin_url: http://blog.51cto.com/liumissyou/1302050
---

调整 Linux 系统时间和时区、与 Internet 时间同步的常用方法。

## 修改时区

备份并修改时区为 Asia/Shanghai（中国东八区）：

```bash
# cp /etc/localtime /etc/localtime.bak
# ln -svf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

修改时区配置文件：

```bash
# cat /etc/sysconfig/clock
ZONE="Asia/Shanghai"
UTC=false
ARC=false
```

## 配置系统时间

设定日期（格式 YYYY/MM/DD）：

```bash
# date -s 2013/09/26
```

设定时间（多种格式均可）：

```bash
# date -s 11:47:06
# date -s "12:00:00 2013-12-06"
# date -s "12:00:00 20131206"
# date -s "2013-12-06 12:00:00"
# date -s "20131206 12:00:00"
```

验证系统时间和 BIOS 时间：

```bash
date      # 显示系统 OS 时间
hwclock   # 显示 BIOS 时间
```

修改 BIOS 时间，同步 BIOS 时钟到系统时间：

```bash
# hwclock -s    # 将硬件时间调整为和系统时间一样
# hwclock -w    # 将系统时间写入 BIOS
# clock -w      # 强制把系统时间写入 CMOS
```

## 与 Internet 时间同步

### 方法 1：开机自动同步（需要自己的时间服务器）

编辑 `/etc/rc.d/rc.local`，添加：

```bash
/usr/sbin/ntpdate -u 192.168.0.2 192.168.0.3 192.168.0.4; /sbin/hwclock -w
```

后面的 IP 对应局域网内需要同步的主机。

### 方法 2：通过定时任务同步

安装 ntpdate：

```bash
# yum -y install ntpdate
```

配置 crontab（下列任选其一）：

```bash
# crontab -e
*/5 * * * * root ntpdate 210.72.145.44; hwclock -w
*/5 * * * * root ntpdate asia.pool.ntp.org; hwclock -w
*/5 * * * * root ntpdate 0.centos.pool.ntp.org; hwclock -w
```

### 方法 3：手动校准时间

关闭 ntpd 服务：

```bash
# service ntpd stop
```

与时间服务器校准：

```bash
# ntpdate asia.pool.ntp.org
```

同步 BIOS 时间：

```bash
# hwclock -w
```

启动 ntpd 服务：

```bash
# service ntpd start
```
