---
title: CentOS 7 /lib64 被重命名后的解决
date: '2018-04-11'
description: "不小心重命名 /lib64 导致系统命令崩溃的恢复方法。涉及 LD_LIBRARY_PATH、LD_PRELOAD 环境变量和动态链接器原理。"
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

[CentOS](http://www.linuxidc.com/topicnews.aspx?tid=14 "CentOS") 7 64 位系统，为了测试，把/usr/lib64重命名成了/usr/lib64.bk，结果发现，在运行vi命令的时候报错：

\-bash: /usr/bin/vi: /lib64/ld-linux-x86-64.so.2: bad ELF interpreter: No such file or directory

想把它重命名回来，发现在运行mv命令的时候，也是一样的报错。除此之外，ls,cp,ftp,wget,rz,7z,unzip,tar什么的统统运行不了，就连重新ssh远程都远程不了。。。

这下悲剧了，难道仅仅因为一个很小的mv操作，整个shell都崩溃了？

然后开始baidu，很多都是设置LD\_LIBRARY\_PATH, LD\_PRELOAD这两个环境变量，来改变应用程序所调用库文件的路径（因为默认的库文件路径/usr/lib64被我改成了/usr/lib64.bk）。于是尝试：

export LD\_LIBRARY\_PATH=/usr/lib64.bk

export LD\_PRELOAD=/usr/lib64.bk

然后执行cp，结果还是一样的问题。

似乎这两个环境变量只对应用程序有效，对shell命令不起作用啊。后来发现，/lib64/ld-linux-x86-64.so.2只是个软链，真实文件是/usr/lib64/ld-2.17.so。而ld-2.17.so本身并不是库文件，可以把它理解为库文件的管理程序，而且它很特别。国外有个牛人是这么说的：

ld-linux-x86-64.so.2 is a pretty core part of your OS. It actually runs every (64 bit) dynamic application. It's not a library as much as an app itself, a handler that is called when you run an app.

Basically, when you run a dynamic app, the kernel first runs ld-linux.so (or whatever name it is for your bitsize, distro, etc). ld-linux.so then peers into your app, sees the libraries that you need, sees any hard coded paths for the libraries (e.g. rpath's) checks LD\_LIBRARY\_PATH, and then goes looking for all those libraries, makes sure they match bitsizes, names, what have you. It then collects all of those, loads them, and runs your app. If it can't find the libs, it doesn't run your app.

ld-linux.so can not be affected by LD\_LIBRARY\_PATH because it is run by the kernel, and the kernel does not load libraries like ld-linux.so does, it just has the one it's configured to run. Again, not a library, so don't use library semantics (LD\_LIBRARY\_PATH) to change how it's called. It does have environment variables that affect it running - see man ld-linux.so for details.

大意是，ld-linux-x86-64.so.2是操作系统的核心，并不受LD\_LIBRARY\_PATH环境变量的影响。如果想改变其调用方式，请查看man文档。

于是乖乖的去看文档。可能是这个文档太老了，在服务器上怎么man都没有，只有网上有：

[http://www.man7.org/linux/man-pages/man8/ld.so.8.html](http://www.man7.org/linux/man-pages/man8/ld.so.8.html)

文档里有这么一段：

/lib/ld-linux.so.\* \[OPTIONS\] \[PROGRAM \[ARGUMENTS\]\]

--library-path path Use path instead of LD\_LIBRARY\_PATH environment variable

setting (see below).

貌似ld-2.17.so这个文件可以当命令来用。于是在服务器上尝试执行：

/usr/lib64.bk/ld-2.17.so

果不其然，服务器没有再返回那条可恶的错误提示，取而代之的是，一连串帮助信息：

You have invoked \`ld.so', the helper program for shared library executables. This program usually lives in the file \`/lib/ld.so', and special directives in executable files using ELF shared libraries tell the system's program loader to load the helper program from this file. This helper program loads the shared libraries needed by the program executable, prepares the program to run, and runs it. You may invoke this helper program directly from the command line to load and run an ELF executable file; this is like executing that file itself, but always uses this helper program from the file you specified, instead of the helper program file specified in the executable file you run. This is mostly of use for maintainers to test new versions of this helper program; chances are you did not intend to run this program. --list list all dependencies and how they are resolved --verify verify that given object really is a dynamically linked object we can handle --inhibit-cache Do not use /etc/ld.so.cache --library-path PATH use given PATH instead of content of the environment variable LD\_LIBRARY\_PATH --inhibit-rpath LIST ignore RUNPATH and RPATH information in object names in LIST --audit LIST use objects named in LIST as auditor

而这个-library-path参数，应该就是用来指定自定义库文件的路径。于是尝试通过ld-2.17.so来调用cp：

/usr/lib64.bk/ld-2.17.so --library-path /usr/lib64.bk /usr/bin/cp /usr/lib64.bk/ /usr/lib64 -fr

终于成功了！再ls了一下，发现提示：

Segmentation fault

这应该是会话缓存的问题。于是尝试连接新的ssh，正常；再执行其他任意命令，也都正常。问题终于解决了！

############yau的模拟#################################

![](/images/legacy/legacy-e4035400c2.png)
