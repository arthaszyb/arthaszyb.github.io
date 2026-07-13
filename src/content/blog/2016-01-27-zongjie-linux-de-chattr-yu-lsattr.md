---
title: Linux chattr 与 lsattr 命令详解
date: '2016-01-27'
description: 'chattr 用于修改文件底层属性实现访问控制，lsattr 用于查看这些属性。与 chmod 控制读写权限不同，chattr 可以锁定文件或限制为仅追加。'
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.ha97.com/5172.html
---
chattr 和 lsattr 是用来查看和改变文件、目录的底层属性的命令，与 chmod（改变读写、执行权限）不同，chattr 控制的是文件系统级别的属性。

## chattr 命令语法

```
chattr [ -RVf ] [ -v version ] [ mode ] files…
```

mode 部分由 `+` `-` `=` 和属性字符组合组成。

## 操作符说明

- `+`：追加参数
- `-`：移除参数
- `=`：替换为指定参数

## 属性字符说明

| 属性 | 说明 |
|------|------|
| A | atime (access time) 不可被修改，预防磁盘 I/O 错误 |
| S | 硬盘 I/O 同步选项，功能类似 sync |
| a | append 仅追加，设定后只能添加数据不能删除，常用于日志文件安全。仅 root 可设定 |
| c | compress 文件自动压缩存储，读取时自动解压 |
| d | no dump 文件不能成为 dump 备份目标 |
| i | immutable 文件不能删除、改名、设定链接，不能写入或新增内容。安全性最高，仅 root 或具有 CAP_LINUX_IMMUTABLE 权限的进程可设定 |
| j | journal 文件写入前先记录到 journal |
| s | secure delete 保密删除，硬盘空间全部收回 |
| u | undelete 与 s 相反，删除数据仍在磁盘，可恢复 |

常用属性：**a**（追加安全）和 **i**（不可修改）。

## lsattr 命令

显示 chattr 设置的文件属性。

```bash
lsattr /etc/resolv.conf
```

输出示例：
```
----i-------- /etc/resolv.conf
```

## 应用示例

**锁定关键配置文件**

```bash
chattr +i /etc/resolv.conf
```

此后 `mv` `rm` 等命令都会得到 `Operation not permitted` 错误。vim 编辑时提示 `W10: Warning: Changing a readonly file`。

取消锁定：
```bash
chattr -i /etc/resolv.conf
```

**日志文件仅追加**

```bash
chattr +a /var/log/messages
```

文件只能追加新数据，不能被删除或修改。
