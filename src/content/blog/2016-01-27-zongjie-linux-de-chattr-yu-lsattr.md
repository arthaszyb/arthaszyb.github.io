---
title: （总结）Linux的chattr与lsattr命令详解
date: '2016-01-27'
description: >-
  发表于: Linux, Security, UNIX, 个人日记, 原创总结 | 作者: 谋万世全局者 标签:
  chattr,Linux,lsattr,命令详解,总结 PS：有时候你发现用root权限都不能修改某个文件，大部分原因是曾经用chattr命令锁定该文件了。
category: linux
tags:
  - vim
  - 存储
  - 备份恢复
draft: false
source: evernote-local-db
lang: zh
---
## [（总结）Linux的chattr与lsattr命令详解](http://www.ha97.com/5172.html)

发表于: [Linux](http://www.ha97.com/category/linux), [Security](http://www.ha97.com/category/security), [UNIX](http://www.ha97.com/category/unix), [个人日记](http://www.ha97.com/category/%e4%b8%aa%e4%ba%ba%e6%97%a5%e8%ae%b0), [原创总结](http://www.ha97.com/category/%e5%8e%9f%e5%88%9b%e6%80%bb%e7%bb%93) | 作者: [谋万世全局者](http://www.ha97.com/author/admin)

标签: [chattr](http://www.ha97.com/tag/chattr),[Linux](http://www.ha97.com/tag/linux),[lsattr](http://www.ha97.com/tag/lsattr),[命令详解](http://www.ha97.com/tag/%e5%91%bd%e4%bb%a4%e8%af%a6%e8%a7%a3),[总结](http://www.ha97.com/tag/%e6%80%bb%e7%bb%93)

**PS：有时候你发现用root权限都不能修改某个文件，大部分原因是曾经用chattr命令锁定该文件了。chattr命令的作用很大，其中一些功能是由[Linux](http://www.ha97.com/category/linux)内核版本来支持的，不过现在生产绝大部分跑的[linux](http://www.ha97.com/tag/linux)系统都是2.6以上内核了。通过chattr命令修改属性能够提高系统的安全性，但是它并不适合所有的目录。chattr命令不能保护/、/dev、/tmp、/var目录。lsattr命令是显示chattr命令设置的文件属性。**

这两个命令是用来查看和改变文件、目录属性的，与chmod这个命令相比，chmod只是改变文件的读写、执行权限，更底层的属性控制是由chattr来改变的。

chattr命令的用法：chattr \[ -RVf \] \[ -v version \] \[ mode \] files…

最关键的是在\[mode\]部分，\[mode\]部分是由+-=和\[ASacDdIijsTtu\]这些字符组合的，这部分是用来控制文件的

属性。

 + ：在原有参数设定基础上，追加参数。

 - ：在原有参数设定基础上，移除参数。

= ：更新为指定参数设定。

A：文件或目录的 atime (access time)不可被修改(modified), 可以有效预防例如手提电脑磁盘I/O错误的发生。

S：硬盘I/O同步选项，功能类似sync。

a：即append，设定该参数后，只能向文件中添加数据，而不能删除，多用于服务器日志文件安全，只有root才能设定这个属性。

c：即compresse，设定文件是否经压缩后再存储。读取时需要经过自动解压操作。

d：即no dump，设定文件不能成为dump程序的备份目标。

i：设定文件不能被删除、改名、设定链接关系，同时不能写入或新增内容。i参数对于文件 系统的安全设置有很大帮助。

j：即journal，设定此参数使得当通过mount参数：data=ordered 或者 data=writeback 挂 载的文件系统，文件在写入时会先被记录(在journal中)。如果filesystem被设定参数为 data=journal，则该参数自动失效。

s：保密性地删除文件或目录，即硬盘空间被全部收回。

u：与s相反，当设定为u时，数据内容其实还存在磁盘中，可以用于undeletion。

各参数选项中常用到的是a和i。a选项强制只可添加不可删除，多用于日志系统的安全设定。而i是更为严格的安全设定，只有superuser (root) 或具有CAP\_LINUX\_IMMUTABLE处理能力（标识）的进程能够施加该选项。

**应用举例：**

**1、用chattr命令防止系统中某个关键文件被修改：**

**\# chattr +i /etc/resolv.conf**

然后用mv /etc/resolv.conf等命令操作于该文件，都是得到Operation not permitted 的结果。vim编辑该文件时会提示W10: Warning: Changing a readonly file错误。要想修改此文件就要把i属性去掉： chattr -i /etc/resolv.conf

\# lsattr /etc/resolv.conf

会显示如下属性

\----i-------- /etc/resolv.conf

2、让某个文件只能往里面追加数据，但不能删除，适用于各种日志文件：

\# chattr +a /var/log/messages
