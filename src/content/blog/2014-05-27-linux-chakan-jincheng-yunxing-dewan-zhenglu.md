---
title: Linux 查看进程运行的完整路径方法
date: '2014-05-27'
description: "通过 /proc 文件系统查看 Linux 进程的详细信息：进程完整路径、运行目录、命令行参数、环境变量、打开的文件等。"
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

## 问题

使用 ps 和 top 命令查看进程信息时，只能看到相对路径，无法查看进程的绝对路径等详细信息。

## 解决方案

Linux 启动进程时，系统会在 `/proc` 下创建一个以 PID 命名的文件夹，其中包含进程的完整信息。

### 查看进程信息

```bash
ll /proc/PID
# 或
ls -l /proc/PID
```

### /proc/PID 目录下的关键文件

| 文件/目录 | 说明 |
|----------|------|
| `cwd` | 符号链接，指向进程运行目录（current working directory） |
| `exe` | 符号链接，指向执行程序的绝对路径 |
| `cmdline` | 进程运行时的完整命令行参数 |
| `environ` | 进程运行时的环境变量 |
| `fd` | 目录，包含进程打开或使用的文件的符号链接 |

### 实践示例

```bash
# 查看 PID 1234 的进程信息
ll /proc/1234

# 查看进程的绝对路径
ls -l /proc/1234/exe

# 查看进程的命令行
cat /proc/1234/cmdline

# 查看进程的环境变量
cat /proc/1234/environ

# 查看进程打开的文件
ls -l /proc/1234/fd
```

这样就可以获得进程的完整路径和详细运行信息。
