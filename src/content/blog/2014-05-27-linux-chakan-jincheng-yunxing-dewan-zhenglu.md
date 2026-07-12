---
title: Linux查看进程运行的完整路径方法
date: '2014-05-27'
description: >-
  2013年12月16日 ⁄ CentOS, Linux ⁄ 共 278字 ⁄ 字号 小 中 大 ⁄ 暂无评论 ⁄ 阅读 899 次
  通过ps及top命令查看进程信息时，只能查到相对路径，查不到的进程的详细信息，如绝对路径等。
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
2013年12月16日 ⁄ [CentOS](http://lovesoo.org/category/linux/centos), [Linux](http://lovesoo.org/category/linux) ⁄ 共 278字 ⁄ 字号 小 中 大 ⁄ [暂无评论](http://lovesoo.org/view-processes-running-linux-full-path-method.html#respond) ⁄ 阅读 899 次

通过[ps](http://lovesoo.org/tag/ps)及[top](http://lovesoo.org/tag/top)命令查看进程信息时，只能查到[相对路径](http://lovesoo.org/tag/%e7%9b%b8%e5%af%b9%e8%b7%af%e5%be%84)，查不到的进程的详细信息，如[绝对路径](http://lovesoo.org/tag/%e7%bb%9d%e5%af%b9%e8%b7%af%e5%be%84)等。这时，我们需要通过以下的方法来查看进程的详细信息：

[Linux](http://lovesoo.org/tag/linux)在启动一个进程时，系统会在/[proc](http://lovesoo.org/tag/proc)下创建一个以PID命名的文件夹，在该文件夹下会有我们的进程的信息，其中包括一个名为exe的文件即记录了[绝对路径](http://lovesoo.org/tag/%e7%bb%9d%e5%af%b9%e8%b7%af%e5%be%84)，通过[ll](http://lovesoo.org/tag/ll)或[ls](http://lovesoo.org/tag/ls) –l命令即可查看。

[ll](http://lovesoo.org/tag/ll) /[proc](http://lovesoo.org/tag/proc)/PID

![](/images/legacy/legacy-ca69df79a7.png)

cwd符号链接的是进程运行目录；

exe符号连接就是执行程序的[绝对路径](http://lovesoo.org/tag/%e7%bb%9d%e5%af%b9%e8%b7%af%e5%be%84)；

cmdline就是程序运行时输入的命令行命令；

environ记录了进程运行时的环境变量；

fd目录下是进程打开或使用的文件的符号连接。
