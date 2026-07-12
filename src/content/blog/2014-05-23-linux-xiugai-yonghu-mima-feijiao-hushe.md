---
title: linux 修改用户密码+非交互设置密码
date: '2014-05-23'
description: >-
  Linux 本地/远程用户密码修改方法汇总：交互式 passwd、非交互 passwd --stdin / chpasswd，以及配合 expect 脚本的自动化修改。
category: linux
tags:
  - ssh
draft: false
source: evernote-local-db
lang: zh
---
修改本地用户密码：

1、交互配置本地用户：

以root用\_8h"@：

passwd <username>

Changing pass[Word](http://www.jiaocheng360.com/Word/) for user dewang.

New UNIX pass[Word](http://www.jiaocheng360.com/Word/) :

BAD PASS[Word](http://www.jiaocheng360.com/Word/) : it is too short

Retype new UNIX password:

passwd: all authentication tokens updated successfully.

以非root用户修改自己的密码（注后面不能跟用户名，只有root用户才允许）：

passwd

Changing password for user dewang.

Changing password for dewang

(current) UNIX password:

New UNIX password:

Retype new UNIX password:

passwd: all authentication tokens updated successfully.

2、非交互配置本地用户：

echo <newpasswd> | passwd --stdin <username>

\_8h"@ 或

echo <username>:<passwd> | chpasswd

或

将<username>:<passwd>对先写到一文件passwd.tmp中，然后执行

chpasswd < passwd.tmp

3、自动脚本处理：

根据passwd命令修改用户密码，格式为：xxx.sh <username> <passwd>

#!/bin/sh

# /

exec expect -f "$0" ${1+"$@"}

if { $argc != 2 } {

puts "Usage: $argv0 <username> <passwd>"

exit 1

}

set password \[lindex $argv 1\]

spawn passwd \[lindex $argv 0\]

sleep 1

expect "assword:"

send "$password/r"

expect "assword:"

send "$password/r"

expect eof

说明：如果要通过shell直接调用expect相关命令，则开头中必须是如下格式，然后后面即可按照expect、TCL格式书写了。

#!/bin/sh

# /

exec expect\_8h"@ -f "$0" ${1+"$@"}

根据echo <newpasswd> | passwd --stdin <username> 及 echo <username>:<passwd> | chpasswd来修改用户密码：

#!/bin/sh

if \[ $# -ne 2 \] ; then

echo "Usage: \`basename $0\` <username> <passwd>"

exit 1

fi

#echo "$2" | passwd --stdin "$1"

echo "$1:$2" | chpasswd

if \[ $? -eq 0 \] ; then

echo "change password for $1 success"

else

echo "change password for $1 failed"

fi

修改远程主机上用户密码：

1、交互配置远程用户：

echo <newpasswd> | ssh -l root <host> passwd --stdin <username>

如：

echo "newpass" | ssh -l root 10.11.103.151 passwd --stdin dewang

[root@10.11.103.151's\_8h"@](mailto:root@10.11.103.151%27s) password:

Changing password for user dewang.

passwd: all authentication tokens updated successfully.

或

echo <username>:<passwd> | ssh -l root <host> chpasswd 2>&1

或

将<username>:<passwd>对先写到一文件passwd.tmp中，然后执行

chpasswd < passwd.tmp ［作者未测试］

或

ssh -l root <host>

.... 交互输入root密码

然后执行以上的所有可用方式均可

2、非交互配置远程用户：

则需要用到expect来进行处理，通过ssh登录到远程机器，然后结合上述配置方式，以完成自动修改用户密码。

#!/usr/bin/expect

[#@brief](mailto:%23@brief) to change user password by ssh remote machine

proc usage {funcname} {

puts "Usage: "

puts " $funcname <host> <username> <newpasswd> -user\_8h"@ <userpasswd>"

puts " $funcname <host> <username> <newpasswd> -root <rootpasswd>"

}

\# check param

if { $argc != 5 } {

usage $argv0

exit 1

}

\# get param

set host \[lindex $argv 0\]

set username \[lindex $argv 1\]

set newpasswd \[lindex $argv 2\]

set loginname "root"

if { \[string compare \[lindex $argv 3\] "-user"\] == 0 } {

set loginname $username

}

set passwd \[lindex $argv 4\]

puts "$host $username $newpasswd $loginname $passwd"

spawn ssh -l $loginname $host

expect {

"\*(yes/no)\*" { send "yes/r"; set sshkey 1 }

"\*assword:\*" { send "$passwd/r"; set sshkey 0 }

if sshkey == 1 {

expect "\*password:\*"

&nbs\_8h"@p; send "$passwd/r"

}

}

expect "\*#"

if { \[string compare $loginname "root"\] == 0 } {

#send "echo /"$username:$newpasswd/" | chpasswd/r"

send "echo /"$newpasswd/" | passwd --stdin /"$username/"/r"

} else {

send "passwd/r"

expect {

"\*current\*assword:" {send "$passwd/r"}

"passwd: Authentication token manipulation error" {exit}

}

expect "New\*assword:"

send "$newpasswd/r"

expect "Retype\*assword:"

send "$newpasswd/r"

}

expect "\*#"

send "exit/r"

#interact　是否将交互权接过来\_8h"@如果接过来，则用户这时可进行交互操作
