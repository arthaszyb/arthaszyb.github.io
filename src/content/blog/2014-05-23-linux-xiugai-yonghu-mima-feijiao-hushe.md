---
title: linux 修改用户密码 + 非交互设置密码
date: '2014-05-23'
description: Linux 本地/远程用户密码修改方法汇总：交互式 passwd、非交互 passwd --stdin / chpasswd，以及配合 expect 脚本的自动化修改。
category: linux
tags:
  - ssh
draft: false
source: evernote-local-db
lang: zh
---

## 修改本地用户密码

### 1. 交互配置本地用户

以 root 用户修改其他用户密码：

```bash
passwd <username>
```

输出示例：
```
Changing password for user dewang.
New UNIX password:
BAD PASSWORD : it is too short
Retype new UNIX password:
passwd: all authentication tokens updated successfully.
```

非 root 用户修改自己的密码（注：后面不能跟用户名）：

```bash
passwd
```

输出示例：
```
Changing password for user dewang.
(current) UNIX password:
New UNIX password:
Retype new UNIX password:
passwd: all authentication tokens updated successfully.
```

### 2. 非交互配置本地用户

使用 `passwd --stdin`：

```bash
echo <newpasswd> | passwd --stdin <username>
```

或使用 `chpasswd`：

```bash
echo <username>:<passwd> | chpasswd
```

或从文件读取：

```bash
chpasswd < passwd.tmp
```

其中 passwd.tmp 的格式为每行一对 `<username>:<passwd>`。

### 3. 使用 expect 脚本自动修改

脚本格式（用 expect 和 TCL 编写）：

```bash
#!/bin/sh
# 注：脚本开头必须是下面的格式，后面即可按 expect/TCL 方式书写
exec expect -f "$0" ${1+"$@"}

if { $argc != 2 } {
    puts "Usage: $argv0 <username> <passwd>"
    exit 1
}

set password [lindex $argv 1]
spawn passwd [lindex $argv 0]
sleep 1
expect "assword:"
send "$password\r"
expect "assword:"
send "$password\r"
expect eof
```

使用 shell + echo 的简化方案：

```bash
#!/bin/sh

if [ $# -ne 2 ] ; then
    echo "Usage: `basename $0` <username> <passwd>"
    exit 1
fi

echo "$1:$2" | chpasswd

if [ $? -eq 0 ] ; then
    echo "change password for $1 success"
else
    echo "change password for $1 failed"
fi
```

## 修改远程主机上的用户密码

### 1. 交互配置远程用户

通过管道将密码传给 ssh 执行的 passwd：

```bash
echo <newpasswd> | ssh -l root <host> passwd --stdin <username>
```

示例：

```bash
echo "newpass" | ssh -l root 10.11.103.151 passwd --stdin dewang
```

或使用 chpasswd：

```bash
echo <username>:<passwd> | ssh -l root <host> chpasswd 2>&1
```

### 2. 非交互配置远程用户（expect 脚本）

```bash
#!/usr/bin/expect

# Brief: change user password by ssh to remote machine

proc usage {funcname} {
    puts "Usage:"
    puts " $funcname <host> <username> <newpasswd> -user <userpasswd>"
    puts " $funcname <host> <username> <newpasswd> -root <rootpasswd>"
}

# check param
if { $argc != 5 } {
    usage $argv0
    exit 1
}

# get param
set host [lindex $argv 0]
set username [lindex $argv 1]
set newpasswd [lindex $argv 2]
set loginname "root"

if { [string compare [lindex $argv 3] "-user"] == 0 } {
    set loginname $username
}

set passwd [lindex $argv 4]

puts "$host $username $newpasswd $loginname $passwd"

spawn ssh -l $loginname $host

expect {
    "*(yes/no)*" { send "yes\r"; set sshkey 1 }
    "*assword:*" { send "$passwd\r"; set sshkey 0 }
    if sshkey == 1 {
        expect "*password:*"
        send "$passwd\r"
    }
}

expect "*#"

if { [string compare $loginname "root"] == 0 } {
    send "echo \"$newpasswd\" | passwd --stdin \"$username\"\r"
} else {
    send "passwd\r"
    expect {
        "*current*assword:" {send "$passwd\r"}
        "passwd: Authentication token manipulation error" {exit}
    }
    expect "New*assword:"
    send "$newpasswd\r"
    expect "Retype*assword:"
    send "$newpasswd\r"
}

expect "*#"
send "exit\r"
```

说明：使用 expect 脚本进行 ssh 远程交互时，最后的 `#interact` 选项用于是否将交互权交回用户；如果启用，则用户可在该时刻进行交互操作。
