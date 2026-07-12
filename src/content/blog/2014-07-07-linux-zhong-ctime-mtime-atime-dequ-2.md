---
title: 'linux中ctime,mtime,atime的区别2008-10-03 14:05:39'
date: '2014-07-07'
description: >-
  linux中ctime,mtime,atime的区别 2008-10-03 14:05:39 标签：ctime mtime atime linux 休闲
  当你同熟练的UNIX用户进行交谈时，你经常会听到他们傲慢地讲出术语“改变时间(change time)”和“修改时间(modification
  time)”。
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
![](/images/legacy/legacy-87ed0e9e6b.jpg)

linux中ctime,mtime,atime的区别

2008-10-03 14:05:39

标签：[ctime](http://blog.51cto.com/tag-ctime.html) [mtime](http://blog.51cto.com/tag-mtime.html) [atime](http://blog.51cto.com/tag-atime.html) [linux](http://blog.51cto.com/tag-linux.html) [休闲](http://blog.51cto.com/tag-%E4%BC%91%E9%97%B2.html)

当你同熟练的UNIX用户进行交谈时，你经常会听到他们傲慢地讲出术语“改变时间(change time)”和“修改时间(modification time)”。对于许多人(和许多字典而言),改变和修改是相同的。这里会有什么不同那？

改变和修改之间的区别在于是改某个组件的标签还是更改它的内容。如果有人说chmod a-w myfile,那么这是一个改变；如果有人说echo foo >> myfile,那么

这是一个修改。改变是文件的索引节点发生了改变；修改是文本本身的内容发生了变化。\[文件的修改时间也叫时间标志 (timestamp).\]

只要讨论改变时间和修改时间，就不可能不提到“访问时间(access time)”.访问时间是文件最后一次被读取的时间。因此阅读一个文件会更新它的访问时间，当它的改变时间并没有变化(有关文件的信息没有被改变)，它的修改时间也同样如此(文件本身没有被改变)

有时，在许多地方改变时间或者“ctime”被错误地写成“创建时间”，包括某些UNIX参考手册。不要相信他们

下面是我man出来的内容，仅供参考！

st\_atime

Time when file data was last accessed. Changed by the

following functions: creat(), mknod(), pipe(),

utime(2), and read(2).

st\_mtime

Time when data was last modified. Changed by the fol-

lowing functions: creat(), mknod(), pipe(), utime(),

and write(2).

st\_ctime

Time when file status was last changed. Changed by the

following functions: chmod(), chown(), creat(),

link(2), mknod(), pipe(), unlink(2), utime(), and

write().

ls显示出的time应该是mtime。

touch后，文件的三个时间应该都会改变，可以试一试。

问题描述

文件的 ctime、mtime、atime 之间有什么区别?

配置信息

解决方法

文件的 Access time，atime 是在读取文件或者执行文件时更改的。

文件的 Modified time，mtime 是在写入文件时随文件内容的更改而更改的。

文件的 Create time，ctime 是在写入文件、更改所有者、权限或链接设置时随 Inode 的内容更改而更改的。

因此，更改文件的内容即会更改 mtime 和 ctime，但是文件的 ctime 可能会在 mtime 未发生任何变化时更改 - 在权限更改，但是文件内容没有变化的情况下。

ls(1) 命令可用来列出文件的 atime、ctime 和 mtime。

ls -lc filename 列出文件的 ctime

ls -lu filename 列出文件的 atime

ls -l filename 列出文件的 mtime

atime不一定在访问文件之后被修改，因为：使用ext3文件系统的时候，如果在mount的时候使用了noatime参数那么就不会更新atime的 信息。而这是加了 noatime 取消了, 不代表真實情況.反正, 這三個 time stamp 都放在 inode 中.若 mtime, atime 修改, inode 就一定會改, 既然 inode 改了, 那 ctime 也就跟著要改了.之所以在 mount option 中使用 noatime, 就是不想 file system 做太多的修改, 而改善讀取效能.
