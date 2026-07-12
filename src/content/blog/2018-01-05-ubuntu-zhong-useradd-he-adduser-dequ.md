---
title: Ubuntu中useradd和adduser的区别
date: '2018-01-05'
description: >-
  2018年1月5日 9:47 Ubuntu中useradd和adduser的区别
  在Ubuntu中创建新用户，通常会用到两个命令：useradd和adduser，虽然作用一样，但用法却不尽相同。 本文接下来便为读者带来具体的解释。
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
2018年1月5日

9:47

**Ubuntu中useradd和adduser的区别**

在Ubuntu中创建新用户，通常会用到两个命令：useradd和adduser，虽然作用一样，但用法却不尽相同。本文接下来便为读者带来具体的解释。

作者：佚名来源：Linux社区|2011-04-20 09:07

收藏

分享

**[【限时免费】年底最强一次云计算大会，看传统、社区、互联网企业如何碰撞？](http://www.51cto.com/act/cloud/home)**

在**Ubuntu**中创建新用户，通常会用到两个命令：**useradd**和**adduser**。虽然作用一样，但用法却不尽相同：

1\. 使用useradd时，如果后面不添加任何[参数](http://bhanv.blog.51cto.com/729282/285491)选项，例如：#sudo useradd test创建出来的用户将是默认“三无”用户：一无Home Directory，二无密码，三无系统Shell。

2\. 使用adduser时，创建用户的过程更像是一种人机对话，系统会提示你输入各种信息，然后会根据这些信息帮你创建新用户。

useradd是一个ELF可执行程序；

useradd会添加用户名，并创建和用户名相同的组名，但它并不在/home[目录](http://os.51cto.com/art/201101/242411.htm)下创建基于用户名的目录,也不提示创建新的密码。

\-b, –base-dir BASE\_DIR 指定home目录的base目录

\-d, –home-dir HOME\_DIR 指定home目录

\-g, –gid GROUP 指定gid

\-l, –no-log-init do not add the user to the lastlog and

faillog databases

不要把用户添加到lastlog和failog中, 这个用户的登录记录不需要记载

\-M, –no-create-home 不要建立home目录

\-p, –password PASSWORD 指定新用户的密码

\-r, –system 建立一个系统帐号

\-s, –shell SHELL 指定shell

adduser -m -d /usr/system -s /bin/bash -p passwd system

而adduser是一个[perl脚本](http://anxiongbo.blog.51cto.com/805770/166111), 可以交互式地设定一些用户参数

问题:

adduser的-p 参数 并不能shadow密码

/usr/sbin/usermod 与 useradd的参数很类似

usermod –password PASSWORD username

总结上来讲，在Ubuntu中，adduser更适合初级使用者，因为不用去记那些繁琐的参数选项，只要跟着系统的提示一步一步进行下去就行，缺点就是整个创建过程比较复杂而漫长；而useradd比较适合有些高阶经验的使用者，往往一行命令加参数就能解决很多问题，所以创建起来十分方便。

来自 <[http://os.51cto.com/art/201104/256231.htm](http://os.51cto.com/art/201104/256231.htm)\>
