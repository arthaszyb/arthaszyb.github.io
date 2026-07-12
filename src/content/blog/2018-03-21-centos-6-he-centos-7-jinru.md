---
title: 'CentOS 6和CentOS 7进入单用户模式区别【转】 (2016-02-24 13:30:19)'
date: '2018-03-21'
description: >-
  HTML Content CentOS 6和CentOS 7进入单用户模式区别【转】 (2016-02-24 13:30:19) Untitled
  Attachment转载▼
  <table<tbody<tr<td<div<br</div</td<td<div<span<span<span分类：</span
category: linux
tags:
  - systemd
  - selinux
  - lvm
  - 备份恢复
draft: false
source: evernote-local-db
lang: zh
---
HTML Content

CentOS 6和CentOS 7进入单用户模式区别【转】 (2016-02-24 13:30:19)

Untitled Attachment转载▼

<table><tbody><tr><td><div><br></div></td><td><div><span><span><span>分类：</span> <a><span>linux摸索历程</span></a></span></span></div></td></tr></tbody></table>

转载自：[http://dusiguxia.blog.163.com/blog/static/556293162010101483711469/](http://dusiguxia.blog.163.com/blog/static/556293162010101483711469/)

参考自：[http://wenku.baidu.com/view/483a697203d8ce2f01662326.html](http://wenku.baidu.com/view/483a697203d8ce2f01662326.html)

[http://f.dataguru.cn/thread-467168-1-1.html](http://f.dataguru.cn/thread-467168-1-1.html)

运行级别 1 只允许管理员通过服务器主机的单一控制台进行操作，即“单用户模式”。

**CentOS 6：**

### 一、进入单用户模式

进入单用户模式的前提是系统引导器能正常工作。下面以 GRUB 为例说明进入方法。在 GRUB 启动菜单里有“a”、“e”和“c”三个操作按键，使用这三个按键均可进入单用户模式。

**方法1 使用 “a” 操作按键进入单用户模式------推荐：简单操作**

这是进入单用户模式最快速的方法。在 GRUB 启动菜单里使用 “a” 操作按键编辑 kernel 参数，在行末输入 single或1 ，以告诉 Linux 内核后续的启动过程需要进入单用户模式，回车即可 。

**方法2、使用 “e” 操作按键进入单用户模式**

在 GRUB 启动菜单里使用 “e” 操作按键进入 CentOS 的启动菜单向界面 ，移动光标至“kernel”配置项一行，

按 “e” 键编辑 “kernel” 菜单项，在行末输入 single ，以告诉 Linux 内核后续的启动过程需要进入单用户模式。

将 kernel /vmlinuz-2.6.18-53.el5 ro root=/dev/VolGroup00/LogVolRoot

更改为 kernel /vmlinuz-2.6.18-53.el5 ro root=/dev/VolGroup00/LogVolRoot single

更改后按回车返回 CentOS 启动菜单项界面，最后按 “b” 键使用更改后的 CentOS 启动菜单项启动单用户模式。

**方法3、使用 “c” 操作按键进入单用户模式**

这是进入单用户模式最麻烦的方法，通常不使用这种方法进入单用户模式，此处旨在熟悉 GRUB 命令行界面操作。在 GRUB 启动菜单里使用 “c” 操作按键进入 GRUB 命令行界面。分别使用 GRUB 下的 root 、kernel（在行末输入 single）、initrd 命令指定启动参数，最后使用 boot 命令启动到单用户模式。

### 二、进入单用户模式之后

当系统进入单用户模式时，不需要输入用户名和口令，系统启动完成后将直接获得管理员 root 的权限，控制台的提示符为“#”。

单用户模式下的控制台界面

在上面的启动信息中有一条信息很关键：

Remounting root filesystem in read-write mode：\[OK\]

表示此时单用户模式下的根文件系统处于可读可写状态。只有根文件系统是可读写的，系统管理员才能对系统进行维护。若系统的配置与脚本文件出现错误，单用户模式下的根文件系统进入“read-only file system”只读状态，此时，可以使用如下命令以读写方式重新挂装根文件系统：

**sh-3.1 # mount -o remount rw -t ext3 /** \*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*

当 Linux 系统进入单用户模式后，由于已经停止了任何网络服务和网络配置（网络接口无效），不会有任何其他人（通过网络）干扰系统的运行状态，管理员可以放心的对 Linux 系统进行系统级别的维护操作。在单用户模式下 Linux 系统除了不具备网络功能外，是功能完整的操作系统。在单用户模式下可以进行如下的维护和管理工作：

重新设置超级用户口令

维护系统的分区、LVM 和文件系统等

进行系统的备份和恢复

单用户模式的一个典型应用是 root 用户的“口令设置”。对于一些临时使用或实验用途的 Linux 系统（如学生实验室），经常会更换使用者，而 root 用户的口令可能会被遗失，这时可以进入单用户模式更改 root 用户的口令。

sh-3.1 # passwd

Changing password for user root.

New UNIX password:

Retype new UNIX password:

passwd: all authentication tokens updated successfully.

当系统进入单用户模式后，在“#”提示符下执行 passwd 命令可以更新 root 用户的口令，当系统重新启动后就可以使用已更新的口令以 root 身份登录系统了。

### 三、单用户模式加密

如果禁止进入单用户,首先要对GRUB进行密码配置，只需要修改/boot /grub/grub.conf或者 /etc/grub.conf（/etc/grub.conf是/boot/grub/grub.conf的符号链接），例如:vi /boot/grub/grub.conf进入配置文件编辑 。

这里我们介绍个方法,给grub加个密码,增禁止他人以单用户模式进入系统. 有2个方式：

1、明文方式

在splashimage这个参数下一行添加: password=密码。保存后重新启动计算机，再次登录到GRUB菜单页面的时候就会发现，这时已经不能直接使用e命令编辑启动标签了，须先使用p命令 ，输入正确的密码后才能够对启动标签进行编辑.但是我们设置了明文密码也不是很安全的.如果他人得到了明文密码后仍然可以修改GRUB启动标签从而修改 root密码.

2、MD5加密方式

在终端中输入grub-md5-crypt回车，这时系统会要求输入两次相同的密码，之后系统便会输出MD5码。大家只需要将生成的MD5密文复制下来， 在splashimage这个参数下一行添加:

password --md5 $1$AKO18/$7EaafQPtx.7y2UdZyL5cp0 //centos的md5

hiddenmenu

保存后重新启动计算机,再次登录到GRUB菜单页面的时候就会发现,**这时已经不能直接使用e命令编辑启动标签了,须先使用p命令,输入正确的密码后才能够对启动标签进行编辑。**

######################################################################################

**CentOS 7：**

rhel7/centos7 **使用了grub2代替了之前的grub引导，由init初始化更换成了systemd初始化**。随之带来的root密码在找回时也和之前操作不同。

具体如下：

1、光标停留在第一项，并按“e”，进入编辑界面，找到initrd16 /initramfs-3.10.0-123.e17.x86\_64.img，在它上一行的行尾输入： **init=/bin/sh** 并且把kernel 中的**ro 改成 rw** ，然后按 “Ctrl-x”，启动系统 。

2、启动到单用户模式后的界面：

sh-4.2#

3、passwd

新密码

重复新密码

成功

4、主机如果开启有selinux，需在根分区创建autorelabel 文件，否则无法正常启动系统，操作命令如下：

**touch / .autorelabel**(h / 和 "."之间都有空格)

5、修改完成后，像之前的版本中一样执行reboot命令已经无效，需要输入全路径命令，如下：

**exec /sbin/init** 或者 **exec /sbin/reboot** 重启
