---
title: rsync详解之exclude排除文件
date: '2014-06-13'
description: 问题：如何避开同步指定的文件夹？
category: linux
tags:
  - nginx
  - mysql
  - ssh
  - rsync
draft: false
source: evernote-local-db
lang: zh
---
**问题：如何避开同步指定的文件夹？ --exclude**

**rsync --exclude files and folders**

[http://articles.slicehost.com/2007/10/10/rsync-exclude-files-and-folders](http://articles.slicehost.com/2007/10/10/rsync-exclude-files-and-folders)

很常见的情况：我想同步/下的 /usr /boot/ ， 但是不想复制/proc /tmp 这些文件夹

如果想避开某个路径 直接添加--exclude 即可

比如--exclude “proc”

\--exclude ‘sources’

Note: the directory path is relative to the folder you are backing up.

注意：这个路径必须是一个相对路径，不能是绝对路径

例子：源服务器/home/yjwan/bashshell有一个checkout文件夹

\[root@CentOS5-4 bashshell\]# ls -dl checkout

drwxr-xr-x 2 root root 4096 Aug 21 09:14 checkou

现在想要完全避开复制这个文件夹内容怎么办？

目标服务器执行

rsync -av --exclude “checkout” [yjwan@172.16.251.241:/home/yjwan/bashshell](mailto:yjwan@172.16.251.241:/home/yjwan/bashshell) /tmp

将不会复制这个文件夹

\[root@free /tmp/bashshell\]# ls -d /tmp/bashshell/checkout

ls: /tmp/bashshell/checkout: No such file or directory

注意:

1事实上，系统会把文件和文件夹一视同仁，如果checkout是一个文件，一样不会复制

2 如果想避开复制checkout里面的内容，可以这么写--exclude “checkout/123”

3 切记不可写为 --exclude “/checkout”这样绝对路径

这样写 将不会避免checkout被复制

比如

\[root@free /tmp/bashshell\]# rsync -av --exclude “/checkout”[yjwan@172.16.251.241:/home/yjwan/bashshell](mailto:yjwan@172.16.251.241:/home/yjwan/bashshell) /tmp

receiving file list … done

bashshell/checkout/

4可以使用通配符 避开不想复制的内容

比如--exclude “fire\*”

那么fire打头的文件或者文件夹全部不会被复制

5如果想要避开复制的文件过多，可以这么写

\--exclude-from=/exclude.list

exclude.list 是一个文件，放置的位置是绝对路径的/exclude.list ，为了避免出问题，最好设置为绝对路径。

里面的内容一定要写为相对路径

比如 我想避开checkout文件夹和fire打头的文件

那么/exclude.list 写为

checkout

fire\*

然后执行以下命令，注意写为--exclude-from或者--exclude-from=都可以

但是不能为--exclude

rsync -av --exclude-from=”/exclude.list” [yjwan@172.16.251.241:/home/yjwan/bashshell](mailto:yjwan@172.16.251.241:/home/yjwan/bashshell) /tmp

检查结果：确实避开了checkout文件夹和fire打头的文件

**问题：如何计算对比复制以后的文件数量是否正确呢？**

**1 查看错误日志，看是否复制时候出问题了**

2在源服务器执行可知道具体文件和文件夹的总个数

ls –AlR|grep “^\[-d\]”|wc

然后目标服务器在计算一遍个数

看看数字是不是能对的上就ok了

对不上再研究怎么回事

3现在的问题是：如果我使用了--exclude参数就麻烦了

我怎么知道要复制几个文件？

首先，前面命令时候提到过一种写法，就是只有源地址，没有目标地址的写法，这种写法可以用来列出所有应该被复制的文件

那么用这个命令，可以计算出这个/root/bashshell下面文件和文件夹数量

在服务器端执行

\[root@CentOS5-4 bashshell\]# rsync -av /root/bashshell/ |grep “^\[-d\]” | wc

62 310 4249

和ls 得到的结果一致的

\[root@CentOS5-4 bashshell\]# ls -AlR |grep “^\[-d\]“|wc

62 558 3731

因此，比如说我不要fire 打头的文件，可以在服务器端先这样计算要复制的文件

\[root@CentOS5-4 bashshell\]# rsync -av --exclude “fire\*” /root/bashshell/ |grep “^\[-d\]” | wc

44 220 2695

然后复制过去

看目标机器的文件和文件夹数量为

\[root@free /tmp\]# ls -AlR /tmp/bashshell/ |grep “^\[-d\]“|wc

44 396 2554

可以知道2者是同步的

**问题：Rsync的其他几个常见参数**

**1**

\-z –compress compress file data during the transfer

\--compress-level=NUM explicitly set compression level

\--skip-compress=LIST skip compressing files with suffix in LIST

压缩传输，如果网络带宽不够，那么应该压缩以后传输，消耗的当然是机器资源，但是如果内网传输的话，文件数量不是很多的话，这个参数不必要的。

2

\--password-file=FILE

前面说过了，只有远端机器是rsync服务器，才能用这个参数

如果你以为个FILE写的是ssh 登陆的密码，那就大错特错了，不少人犯了这个错误。

3

–stats: Adds a little more output regarding the file transfer status.

4

–progress: shows the progress of each file transfer. Can be useful to know if you have large files being backup up.

关于这个参数：

I frequently find myself adding the -P option for large transfers. It preserves partial transfers in case of interuption, and gives a progress report on each file as it’s being uploaded.

I move large media files back and forth on my servers, so knowing how long the transfer has remaining is very useful.

•Previous Entry: nginx 每天定时切割Nginx日志的脚本

•Next Entry: 如何开启MySQL的远程帐号
