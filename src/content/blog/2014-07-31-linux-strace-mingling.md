---
title: Linux strace命令
date: '2014-07-31'
description: "strace用来跟踪进程执行时的系统调用和所接收的信号，显示参数、返回值和执行消耗的时间。可用于调试程序运行问题、追踪动态库加载问题等。"
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

## 简介

strace 常用来跟踪进程执行时的系统调用和所接收的信号。在 Linux 世界，进程不能直接访问硬件设备，当进程需要访问硬件设备（比如读取磁盘文件、接收网络数据等）时，必须由用户态模式切换至内核态模式，通过系统调用访问硬件设备。strace 可以跟踪到一个进程产生的系统调用，包括参数、返回值、执行消耗的时间。

## 输出参数含义

每一行都是一条系统调用，等号左边是系统调用的函数名及其参数，右边是该调用的返回值。示例：

```text
root@ubuntu:/usr# strace cat /dev/null

execve("/bin/cat", ["cat", "/dev/null"], [/* 22 vars */]) = 0

brk(0) = 0xab1000

access("/etc/ld.so.nohwcap", F_OK) = -1 ENOENT (No such file or directory)

mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f29379a7000

access("/etc/ld.so.preload", R_OK) = -1 ENOENT (No such file or directory)

brk(0) = 0xab1000

brk(0xad2000) = 0xad2000

fstat(1, {st_mode=S_IFCHR|0620, st_rdev=makedev(136, 0), ...}) = 0

open("/dev/null", O_RDONLY) = 3

fstat(3, {st_mode=S_IFCHR|0666, st_rdev=makedev(1, 3), ...}) = 0

read(3, "", 32768) = 0

close(3) = 0

close(1) = 0

close(2) = 0

exit_group(0) = ?
```

strace 显示这些调用的参数并返回符号形式的值。strace 从内核接收信息，而且不需要以任何特殊的方式来构建内核。

## strace 参数

- `-c`：统计每一系统调用的所执行的时间、次数和出错的次数等
- `-d`：输出 strace 关于标准错误的调试信息
- `-f`：跟踪由 fork 调用所产生的子进程
- `-ff`：如果提供 `-o filename`，则所有进程的跟踪结果输出到相应的 `filename.pid` 中，pid 是各进程的进程号
- `-F`：尝试跟踪 vfork 调用。在 `-f` 时，vfork 不被跟踪
- `-h`：输出简要的帮助信息
- `-i`：输出系统调用的入口指针
- `-q`：禁止输出关于脱离的消息
- `-r`：打印出相对时间关于每一个系统调用
- `-t`：在输出中的每一行前加上时间信息
- `-tt`：在输出中的每一行前加上时间信息，微秒级
- `-ttt`：微秒级输出，以秒表示时间
- `-T`：显示每一调用所耗的时间
- `-v`：输出所有的系统调用。一些调用关于环境变量、状态、输入输出等由于使用频繁，默认不输出
- `-V`：输出 strace 的版本信息
- `-x`：以十六进制形式输出非标准字符串
- `-xx`：所有字符串以十六进制形式输出
- `-a column`：设置返回值的输出位置，默认为 40
- `-e expr`：指定一个表达式用来控制如何跟踪，格式：`[qualifier=][!]value1[,value2]...`。qualifier 只能是 `trace`、`abbrev`、`verbose`、`raw`、`signal`、`read`、`write` 其中之一。例如 `-eopen` 等价于 `-e trace=open` 表示只跟踪 open 调用；`-etrace!=open` 表示跟踪除了 open 以外的其他调用。有两个特殊的符号 `all` 和 `none`
- `-e trace=set`：只跟踪指定的系统调用。例如 `-e trace=open,close,read,write` 表示只跟踪这四个系统调用。默认为 `set=all`
- `-e trace=file`：只跟踪有关文件操作的系统调用
- `-e trace=process`：只跟踪有关进程控制的系统调用
- `-e trace=network`：跟踪与网络有关的所有系统调用
- `-e trace=signal`：跟踪所有与系统信号有关的系统调用
- `-e trace=ipc`：跟踪所有与进程通讯有关的系统调用
- `-e abbrev=set`：设定 strace 输出的系统调用的结果集。`-v` 等价于 `abbrev=none`，默认为 `abbrev=all`
- `-e raw=set`：将指定的系统调用的参数以十六进制显示
- `-e signal=set`：指定跟踪的系统信号。默认为 all，如 `signal=!SIGIO` 表示不跟踪 SIGIO 信号
- `-e read=set`：输出从指定文件中读出的数据，例如 `-e read=3,5`
- `-e write=set`：输出写入到指定文件中的数据
- `-o filename`：将 strace 的输出写入文件 filename
- `-p pid`：跟踪指定的进程 pid
- `-s strsize`：指定输出的字符串的最大长度，默认为 32。文件名一直全部输出
- `-u username`：以 username 的 UID 和 GID 执行被跟踪的命令

## 命令实例

**通用的完整用法：**

```bash
strace -o output.txt -T -tt -e trace=all -p 28979
```

跟踪 28979 进程的所有系统调用（`-e trace=all`），并统计系统调用的花费时间，以及开始时间（并以可视化的时分秒格式显示），最后将记录结果存在 `output.txt` 文件里面。

## strace 案例

### 调试程序问题

启动 KDE 时出现错误提示：

```bash
strace -f -F -o ~/dcop-strace.txt dcopserver
```

跟踪输出显示：

```text
27207 mkdir("/tmp/.ICE-unix", 0777) = -1 EEXIST (File exists)
27207 lstat64("/tmp/.ICE-unix", {st_mode=S_IFDIR|S_ISVTX|0755, st_size=4096, ...}) = 0
27207 bind(3, {sin_family=AF_UNIX, path="/tmp/.ICE-unix/dcop27207-1066844596"}, 38) = -1 EACCES (Permission denied)
```

问题分析：程序试图创建 `/tmp/.ICE-unix` 目录权限为 0777，但目录已存在且权限为 0755。bind 操作因权限被拒绝。

解决方案：

```bash
chmod 0777 /tmp/.ICE-unix
chmod +t /tmp/.ICE-unix   # 设置粘滞位防止他人删除文件
```

### 解决库依赖问题

当 ldd 无法发现所有依赖库时，strace 可以帮助追踪动态库的加载过程：

```bash
strace -o whoami-strace.txt whoami
```

查看输出可以发现缺失的库调用：

```bash
open("/lib/libnss_files.so.2", O_RDONLY) = -1 ENOENT (No such file or directory)
```

找到缺失的库并放回到正确位置即可解决问题。

### 限制跟踪特定系统调用

仅跟踪 execve 调用：

```bash
strace -f -o configure-strace.txt -e execve ./configure
```
