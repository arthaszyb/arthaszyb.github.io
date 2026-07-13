---
title: Linux 后台进程管理方法
date: '2017-12-18'
description: "远程 SSH 登录时进程的后台运行方法。介绍 nohup、setsid、subshell、disown、screen 等命令的用法，帮助进程在网络断开或终端关闭后继续运行。"
category: linux
tags:
  - shell-scripting
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
origin_url: https://www.ibm.com/developerworks/cn/linux/l-cn-nohup/index.html
---

## 问题

用 telnet/ssh 登录远程 Linux 服务器运行耗时任务时，网络断开或关闭终端会导致进程中断。需要使进程在后台稳定运行。

## HUP 信号与 hangup

Unix 早期，每个终端通过 modem 与系统通信。用户 logout 时 modem 挂断（hang up），给终端发送 HUP（hangup）信号关闭所有子进程。现代系统中网络断开时也会触发 HUP 信号。

解决方案：要么让进程忽略 HUP 信号，要么让进程运行在新的会话里成为不属于该终端的子进程。

## nohup

命令前加 `nohup`，让命令忽略 hangup 信号。标准输出和错误默认重定向到 `nohup.out`，可用 `> filename 2>&1` 指定输出文件。

```bash
nohup ping www.ibm.com &
ps -ef | grep ping
```

## setsid

运行程序在新会话中，使其不属于当前终端的子进程。

```bash
setsid ping www.ibm.com
ps -ef | grep ping
# 进程父进程 ID（PPID）为 1（init 进程）
```

## subshell（& 和 ()）

将命令放在 `()` 中并加 `&` 后台运行：

```bash
(ping www.ibm.com &)
ps -ef | grep ping
# 进程 PPID 也为 1
# 无法通过 jobs 查看，但可用 ps -ef 看到
```

## disown（事后补救）

若命令已提交但未加保护，可用 disown 补救。前提是已用 `&` 放入后台或用 Ctrl-z 暂停后用 `bg` 恢复。

用法：

```bash
disown -h %jobspec    # 使指定作业忽略 HUP
disown -ah            # 所有作业忽略 HUP
disown -rh            # 正在运行的作业忽略 HUP
```

### disown 示例 1（命令已后台运行）

```bash
cp -r testLargeFile largeFile &
jobs
disown -h %1
ps -ef | grep largeFile
logout
```

### disown 示例 2（命令未后台运行）

先用 Ctrl-z 暂停，再用 `bg` 恢复，最后 disown：

```bash
cp -r testLargeFile largeFile2
# 按 Ctrl-z
bg %1
jobs
disown -h %1
ps -ef | grep largeFile2
```

### Ctrl-z 与 jobs 配合

- `Ctrl-z`：暂停当前进程
- `jobs`：查看所有作业及作业号
- `bg %jobspec`：在后台继续运行
- `fg %jobspec`：恢复到前台

disown 后，作业将从作业列表中移除，无法用 jobs 查看，但仍可用 `ps -ef` 找到。

## screen（大批量场景最佳选择）

screen 是虚拟终端管理器，在一个真实终端下运行多个伪终端。在 screen 会话中启动的进程的父进程是 screen（PID 为 1 的 init），不再属于 ssh 终端的子进程，从而避免 HUP 信号影响。

常用选项：

```bash
screen -dmS sessionname   # 建立名为 sessionname 的断开模式会话
screen -list              # 列出所有会话
screen -r sessionname     # 重新连接会话
# 在 screen 中按 Ctrl-a d 暂时断开
```

示例：

```bash
screen -dmS Urumchi
screen -list
# 输出：12842.Urumchi (Detached)
screen -r Urumchi
# 连接后可运行任意命令，关闭 ssh 后进程继续运行
```

进程树对比（假设 ping 进程 ID 为 9488）：

**不使用 screen：** 进程树为 `init -> sshd -> bash -> ping`，ssh 断开时 bash 收到 HUP 并传递给 ping。

**使用 screen：** 进程树为 `init -> screen -> bash -> ping`，ssh 断开时 screen 不会收到 HUP。

## 总结

选择方案根据场景：

- **临时一次性任务**：nohup 或 setsid 最简便
- **任务已在运行、需补救**：disown + Ctrl-z + bg
- **大量长期运行任务**：screen 是最佳选择
