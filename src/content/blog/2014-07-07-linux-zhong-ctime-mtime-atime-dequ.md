---
title: linux中ctime、mtime、atime的区别
date: '2014-07-07'
description: “文件的三个时间戳定义与含义：atime是最后一次读取时间，mtime是最后修改时间，ctime是最后改变inode属性的时间。通过ls命令的不同选项可以查看这些时间，使用noatime挂载参数可以减少atime更新。”
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---
![](/images/legacy/legacy-15b6d25063.jpg)

改变时间(ctime)与修改时间(mtime)的区别在于一个改变的是文件的索引节点(inode)属性，一个改变的是文件内容本身。例如，`chmod a-w myfile` 会改变 inode，是改变时间；而 `echo foo >> myfile` 则修改了文件内容，是修改时间。

访问时间(atime)是文件最后一次被读取的时间，阅读文件会更新 atime，但改变时间和修改时间不变。

根据 man 手册：

- **st_atime**: 最后一次数据被访问的时间。由 `creat()`, `mknod()`, `pipe()`, `utime()`, `read()` 等函数改变。
- **st_mtime**: 最后一次数据被修改的时间。由 `creat()`, `mknod()`, `pipe()`, `utime()`, `write()` 等函数改变。
- **st_ctime**: 最后一次 inode 状态被改变的时间。由 `chmod()`, `chown()`, `creat()`, `link()`, `mknod()`, `pipe()`, `unlink()`, `utime()`, `write()` 等函数改变。

## 查看文件的三个时间

`ls` 命令可以查看文件的不同时间戳：

```bash
ls -l filename    # 列出 mtime
ls -lc filename   # 列出 ctime
ls -lu filename   # 列出 atime
```

注意：`ls` 显示的是 mtime。`touch` 命令会改变这三个时间。

## 关于 atime 的更新

atime 不一定会在访问文件后被修改，这取决于文件系统的挂载选项。使用 ext3 文件系统时，如果挂载时使用了 `noatime` 参数，就不会更新 atime 信息。这是为了减少文件系统的修改，提高读取性能。这三个时间戳都存放在 inode 中，如果 mtime 或 atime 被修改，inode 必然要改变，随之 ctime 也会改变。
