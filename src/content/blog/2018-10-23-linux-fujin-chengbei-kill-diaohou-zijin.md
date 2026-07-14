---
title: Linux 父进程被 kill 后子进程的状态
date: '2018-10-23'
description: "父进程被杀死后，子进程的不同命运：成为孤儿进程被 init 接管，或被销毁。"
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

第一种情况：

\[root@qht2 ~\]# ps -ef | grep httpd

root 3799 1 0 10:41 pts/0 00:00:00 /usr/sbin/nss\_pcache off /etc/httpd/alias

root 3803 1 3 10:41 ? 00:00:00 /usr/sbin/httpd

apache 3807 3803 0 10:41 ? 00:00:00 /usr/sbin/httpd

apache 3808 3803 0 10:41 ? 00:00:00 /usr/sbin/httpd

apache 3809 3803 0 10:41 ? 00:00:00 /usr/sbin/httpd

apache 3810 3803 0 10:41 ? 00:00:00 /usr/sbin/httpd

apache 3811 3803 0 10:41 ? 00:00:00 /usr/sbin/httpd

apache 3812 3803 0 10:41 ? 00:00:00 /usr/sbin/httpd

apache 3813 3803 0 10:41 ? 00:00:00 /usr/sbin/httpd

apache 3814 3803 0 10:41 ? 00:00:00 /usr/sbin/httpd

root 3816 3749 0 10:42 pts/0 00:00:00 grep httpd

\[root@qht2 ~\]# kill 3803

\[root@qht2 ~\]# ps -ef | grep httpd

root 3820 3749 0 10:42 pts/0 00:00:00 grep httpd

显然kill掉父进程，子进程也消亡了！

第二种情况：

我写了两个脚本a.sh 和b.sh， 在a.sh中调用b.sh，运行后显然有两个进程，而且a.sh为b.sh的父进程，然后我再另外一个terminal中kill 掉a.sh进程，但b.sh过寄给init进程，而不会终止！

我的例子如下：

\[root@qht2 ~\]# cat a.sh

#!/bin/sh

echo "A Begin"

./b.sh

echo "A End"

\[root@qht2 ~\]# cat b.sh

#!/bin/sh

echo "B Begin"

sleep 180

mkdir abcdef

echo "B End"

\[root@qht2 ~\]# ./a.sh

A Begin

B Begin

在这里等待（因为b.sh中有sleep 180）

打开另一个terminal，查看进程

\[root@qht2 ~\]# ps -ef | grep sh

。。。。。。

root 3984 3749 0 11:05 pts/0 00:00:00 /bin/sh ./a.sh

root 3985 3984 0 11:05 pts/0 00:00:00 /bin/sh ./b.sh ##显然b.sh是a.sh的子进程

root 3990 3838 0 11:05 pts/1 00:00:00 grep sh

\[root@qht2 ~\]# kill 3984

\[root@qht2 ~\]# ps -ef | grep sh

。。。。。。

root 3985 1 0 11:05 pts/0 00:00:00 /bin/sh ./b.sh

root 3992 3838 2 11:06 pts/1 00:00:00 grep sh

第一ternimal中的显示如下：

\[root@qht2 ~\]# ./a.sh

A Begin

B Begin

Terminated

但b.sh还是会运行（因为生成了abcdef目录）！

这两种情况的区别是：

父进程退出,子进程被init领养,继续运行,这才是正常的吧

而前一个,从名字看明显是一个守护进程,id=3803的是会话首进程,也是进程组的组长,KILL掉它,会导致SIGHUP发送给该进程组的每一个进程(就是所有父进程为3803的那些),默认情况下,SIGHUP会终止进程,所以全没了.

详细解释：

所有进程都是属于一个进程组的,而进程组又属于一个会话.

普通的进程所属的会话有控制终端,守护进程所属会话没有控制终端.

普通会话的首进程,同时也是建立与控制终端联系的进程,在它被KILL掉时,会向前台进程组就(a.sh)发送SIGHUP信号.默认情况下,接收到SIGHUP的进程会被终止.此时后台进程组(b.sh)不受影响.

守护进程的会话,因为没有控制终端,所以就没有前后台进程组之分,会话首进程同时也是进程组组长.它被KILL掉会向该组每个进程发送SIGHUP,导致组中进程被中止.

第二个试验,一个脚本调用另一个脚本的行为,创建了一个新的进程组,脚本a.sh是进程组组长,但却不是所在会话的首进程或控制进程,所以它被KILL掉,不影响同组的进程(b.sh),此时init进程会自动领养脚本B所在进程,并在它运行到结束时回收它所占用的资源.

可以用ps -eo pid,ppid,pgrp,session,comm跑一下.

对于第一种情况,就是守护进程,应该会发现那一堆进程的session(会话ID)和pgrp(组ID)都一样且是相同的,而且正好等于子进程的ppid,同时也是你KILL掉那个进程的pid.这样可以证实你KILL掉的是会话首进程.

对于第二种情况,你会发现,进程A和B,session和pgrp是一样的,但两者却并不相同,session的值虽无法确定,但pgrp却应该正好是进程A的pid,这说明了进程A是组长但却不是会话首进程,所以KILL掉它不会导致子进程被结束.

\[root@qht2 ~\]# ps -eo pid,ppid,pgrp,session,comm

PID PPID PGRP SESS COMMAND

1 0 1 1 init

\*\*\*

3621 1 3621 3621 httpd

3626 3621 3621 3621 httpd

3627 3621 3621 3621 httpd

3628 3621 3621 3621 httpd

3629 3621 3621 3621 httpd

3630 3621 3621 3621 httpd

3631 3621 3621 3621 httpd

3632 3621 3621 3621 httpd

3633 3621 3621 3621 httpd

3643 3574 3643 3574 a.sh

3644 3643 3643 3574 b.sh

3645 3644 3643 3574 sleep

3646 3571 3646 3646 bash

3674 3646 3674 3646 ps

\[root@qht2 ~\]#
