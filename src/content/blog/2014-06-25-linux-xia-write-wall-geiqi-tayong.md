---
title: linux下 write/wall 给其它用户/终端 发送即时文本消息
date: '2014-06-25'
description: >-
  from：http://verycto.blog.51cto.com/904981/394337
  from：http://blog.donews.com/vanfan/archive/2011/12/20/1579866.aspx
  一直以来，都是在我的debian机子上架一个自己写的ajax聊天工具，
category: linux
tags:
  - samba
  - hadoop
draft: false
source: evernote-local-db
lang: zh
---
from：http://verycto.blog.51cto.com/904981/394337

from：http://blog.donews.com/vanfan/archive/2011/12/20/1579866.aspx

一直以来，都是在我的debian机子上架一个自己写的ajax聊天工具，

方便大家传送一下比较即时的消息比如好看的文章网址等，如果是文件，

就直接拖到我的samba共享里，因为我们几个机子都是Linux，

今天试了一下Linux终端里自带的聊天命令：write 和 wall 。

who 查看一下哪些人登录：

heylin tty7 2010-05-03 20:17 (:0)

heylin pts/2 2010-05-03 20:24 (t.xiaoji.com)

heylin pts/4 2010-05-03 22:28 (:0.0)

heylin pts/5 2010-05-03 22:08 (debian-2.local)

pts/2是我登录的，pts/5是某人的。pts/4是他登录的 tty7是gnome的

命令格式：write heylin /dev/pts/4 回车

输入消息：hello, msg from xiaoji

不过不支持中文。write执行后，可以接受别人的消息，也可以继续发消息，但如果一开始是别人先发送给你，你就必须再打开一个终端才能发消息。

wall ，wall（write all）命令是广播，所有的人都可以收到。

wall \[message\]？NO，这个命令已经过时了，新的格式是：

echo "hello,This is a message" | wall

或者

[hadoop@clone1:~/download/hadoop-0.20.203.0/conf](mailto:hadoop@clone1:~/download/hadoop-0.20.203.0/conf) 04:46:27$

wall <<<"11111111111"

Broadcast Message from hadoop@clone1

(/dev/pts/2) at 4:46 ...

11111111111

[hadoop@clone1:~/download/hadoop-0.20.203.0/conf](mailto:hadoop@clone1:~/download/hadoop-0.20.203.0/conf) 04:46:37$

Linux的聊天蛮有意思的，不过，如果你正在终端编辑一个文件，那就惨了，因为消息会直接插入到你的编辑文件中！慎用~

-----------------------------------------------------------------------------------------------------------------

从一个虚拟终端向另一个虚拟终端发消息，假设都是用root帐号登录的.

\[root@localhost ~\]#w # 目前都有哪几个终端连接

root pts/1 Feb 17 16:58 (123.118.16.\*\*)

root pts/2 Feb 17 19:53 (123.112.44.\*\*)

root pts/3 Feb 17 20:01 (123.112.44.\*\*)

\[root@localhost ~\]#who am i #看下自己是哪个终端

root pts/3 Feb 17 20:01 (123.112.44.\*\*)

\[root@localhost ~\]#write root pts/2 #root是登陆的帐户 pts/2 是终端号 这样就可向别一个终端发消息了 用CTRL+C 来结束！！！！

1,查看当前所有登录用户所使用的终端

finger

w

2,查看自己所使用的终端

tty

3,给某个终端的用户发送信息

write root /dev/pts/4

hello,you are donkey

然后回车，再按ctrl+c即可

4,发公告信息给所有终端用户

wall this system will halt after 5 minutes #新版的 wall 不能直接这么用了，需要用 管道 或者 文件 或者 here string/here document

// wall 就是write all

5,禁止别人把信息显示在我的终端

mesg n

允许别人把信息显示在我的终端

mesg y
