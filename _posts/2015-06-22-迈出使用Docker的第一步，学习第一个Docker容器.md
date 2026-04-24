---
title: "迈出使用Docker的第一步，学习第一个Docker容器"
date: 2015-06-22 17:56:08 +0000
categories: ["docker"]
tags: ["Pages"]
description: "Monday, June 22, 2015 5:56 PM 您的评价 : 收藏该经验 阅读目录 本文摘自《第一本 Docker 书》 在本文中，我们将迈出使用Docker的第一步，学习第一个Docker容器。本章还会介绍如何与Docker进行交互的基本知识。 1 确保Docker已经就绪 首先，我们会查看Docker是"
source: "evernote-local-db"
---

迈出使用Docker的第一步，学习第一个Docker容器
Monday, June 22, 2015
5:56 PM
迈出使用Docker的第一步，学习第一个Docker容器
您的评价
:

收藏该经验

阅读目录
本文摘自《第一本
Docker
书》
在本文中，我们将迈出使用Docker的第一步，学习第一个Docker容器。本章还会介绍如何与Docker进行交互的基本知识。
1 确保Docker已经就绪
首先，我们会查看Docker是否能正常工作，然后学习基本的Docker的工作流：创建并管理容器。我们将浏览容器的典型生命周期：从创建、管理到停止，直到最终删除。
第一步，查看
docker
程序是否存在，功能是否正常，如代码清单
3-1
所示。
代码清单
3-1

查看
docker
程序是否正常工作
?
1
2
3
4
5
6
7
8
9
$

sudo

docker info
Containers: 0
Images: 0
Storage Driver: aufs
Root Dir:

/var/lib/docker/aufs

Dirs: 144
Execution Driver: native-0.1
Kernel Version: 3.8.0-29-generic
Registry: [
https://index.docker.io/v1/
]
在这里我们调用了
docker
可执行程序的
info
命令，该命令会返回所有容器和镜像（镜像即是
Docker
用来构建容器的
“
构建块
”
）的数量、
Docker
使用的执行驱动和存储驱动（
execution and storage driver
），以及
Docker
的基本配置。
在前面几章我们已经介绍过，
Docker
是基于客户端
-
服务器构架的。它有一个
docker
程序，既能作为客户端，也可以作为服务器端。作为客户端时，
docker
程序向
Docker
守护进程发送请求（如请求返回守护进程自身的信息），然后再对返回来的请求结果进行处理。
2 运行我们的第一个容器
现在，让我们尝试启动第一个
Docker
容器。我们可以使用
docker run
命令创建容器，如代码清单
3-2
所示。
docker run
命令提供了
Docker
容器的创建到启动的功能，在本书中我们也会使用该命令来创建新容器。
代码清单3-2 创建第一个容器
?
1
2
3
4
5
6
7
8
9
$

sudo

docker run -i -t ubuntu

/bin/bash

Pulling repository ubuntu from

https://index.docker.io/v1

Pulling image 8dbd9e392a964056420e5d58ca5cc376ef18e2de93b5cc90e868a1bbc8318c1c (precise) from ubuntu
Pulling 8dbd9e392a964056420e5d58ca5cc376ef18e2de93b5cc90e868a1bbc8318c1c metadata
Pulling 8dbd9e392a964056420e5d58ca5cc376ef18e2de93b5cc90e868a1bbc8318c1c fs layer
Downloading 58337280/? (n/a)
Pulling image b750fe79269d2ec9a3c593ef05b4332b1d1a02a62b4accb2c21d589ff2f5f2dc (quantal) from ubuntu
Pulling image 27cf784147099545 () from ubuntu
root@fcd78e1a3569:/#
{
提示
}

官方文档列出了完整的
Docker
命令列表，你也可以使用
docker help
获取这些命令。此外，你还可以使用
Docker
的
man
页（即执行
man docker-run
）。
代码清单3-3所示命令的输出结果非常丰富，下面我们来逐条解析。
代码清单
3-3

docker run
命令
?
1
$

sudo

docker run -i -t ubuntu

/bin/bash
首先，我们告诉
Docker
执行
docker run
命令，并指定了
-i
和
-t
两个命令行参数。
-i
标志保证容器中
STDIN
是开启的，尽管我们并没有附着到容器中。持久的标准输入是交互式
shell
的
“
半边天
”
，
-t
标志则是另外
“
半边天
”
，它告诉
Docker
为要创建的容器分配一个伪
tty
终端。这样，新创建的容器才能提供一个交互式
shell
。若要在命令行下创建一个我们能与之进行交互的容器，而不是一个运行后台服务的容器，则这两个参数已经是最基本的参数了。
{
提示
}

官方文档上列出了
docker run
命令的所有标志，此外还可以用命令
docker help run
查看这些标志。或者，也可以用
Docker
的
man
页（也就是执行
man docker-run
命令）。
接下来，我们告诉
Docker
基于什么镜像来创建容器，示例中使用的是
ubuntu
镜像。
ubuntu
镜像是一个常备镜像，也可以称为
“
基础
”
（
base
）镜像，它由
Docker
公司提供，保存在
Docker HubRegistry
上。
你可以用

ubuntu

基础镜像（以及类似的

fedora
、
debian
、
centos
等镜像）为基础，在你选择的操作系统上构建自己的镜像。这里，我们基于此基础镜像启动了一个容器，并且没有对容器进行任何改动。
那么，在这一切的背后又都发生了什么呢？首先
Docker
会检查本地是否存在
ubuntu
镜像，如果本地还没有该镜像的话，那么
Docker
就会连接官方维护的
Docker Hub Registry
，查看
Docker Hub
中是否有该镜像。
Docker
一旦找到该镜像，就会下载该镜像并将其保存到本地宿主机中。
随后，
Docker
在文件系统内部用这个镜像创建了一个新容器。该容器拥有自己的网络、
IP
地址，以及一个用来和宿主机进行通信的桥接网络接口。最后，我们告诉
Docker
在新容器中要运行什么命令，在本例中我们在容器中运行
/bin/bash
命令启动了一个
Bash shell
。
当容器创建完毕之后，
Docker
就会执行容器中的
/bin/bash
命令，这时我们就可以看到容器内的
shell
了，就像代码清单
3-4
所示。
代码清单3-4 第一个容器的shell
?
1
root@f7cbdac22a02:/#
{注意}

在第4章中，我们将会看到如何构建自己的镜像并基于该镜像创建容器的基础知识。
3 使用第一个容器
现在，我们已经以
root
用户登录到了新容器中，容器的
ID

f7cbdac22a02``
，乍
``
看起来有些令人迷惑的字符串。这是一个完整的
Ubuntu
系统，你可以用它来做任何事情。下面我们就来研究一下这个容器。首先，我们可以获取该容器的主机名，如代码清单
3-5
所示。
代码清单3-5 检查容器的主机名
?
1
2
root@f7cbdac22a02:/# hostname
f7cbdac22a02
可以看到，容器的主机名就是该容器的
ID
。我们再来看看
/etc/hosts
文件，如代码清单
3-6
所示。
代码清单3-6 检查容器的/etc/hosts文件
?
1
2
3
4
5
6
7
8
root@f7cbdac22a02:/# cat /etc/hosts
172.17.0.4 f7cbdac22a02
127.0.0.1 localhost
::1 localhost ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
Docker
以在
hosts
文件中为该容器的
IP
地址添加了一条主机配置项。我们再来看看容器的网络配置情况，如代码清单
3-7
所示。
代码清单3-7 检查容器的接口
?
1
2
3
4
5
6
7
8
9
10
11
root@f7cbdac22a02:/# ip a
1: lo:
<
LOOPBACK,UP,LOWER_UP> mtu 1500 qdisc noqueue state UNKNOWN group default
link/loopback

00:00:00:00:00:00 brd 00:00:00:00:00:00
inet 127.0.0.1/8

scope host lo
inet6 ::1/128

scope host
valid_lft forever preferred_lft forever
899: eth0:
<
BROADCAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
link/ether

16:50:3a:b6:f2:cc brd ff:ff:ff:ff:ff:ff
inet 172.17.0.4/16

scope global eth0
inet6 fe80::1450:3aff:feb6:f2cc/64

scope link
valid_lft forever preferred_lft forever
我们可以看到，这里有
lo
的环回接口，还有
IP
为
172.17.0.4
的标准
eth0
网络接口，和普通宿主机是完全一样的。我们还可以查看容器中运行的进程，如代码清单
3-8
所示。
代码清单3-8 检查容器的进程
?
1
2
3
4
root@f7cbdac22a02:/# ps -aux
USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND
root 1 0.0 0.0 18156 1936 ? Ss May30 0:00

/bin/bash

root 21 0.0 0.0 15568 1100 ? R+ 02:38 0:00

ps

-aux
接下来我们要干些什么呢？安装一个软件包怎么样？如代码清单3-9所示。
代码清单3-9 在第一个容器中安装软件包
?
1
root@f7cbdac22a02:/# apt-get update
&
&
apt-get install vim
通过上述命令，我们就在容器中安装了Vim软件。
你可以继续在容器中做任何自己想做的事情。当所有工作都结束时，输入
exit
，就可以返回到
Ubuntu
宿主机的命令行提示符了。
这个容器现在怎样了？容器现在已经停止运行了！只有在指定的
/bin/bash
命令处于运行状态的时候，我们容器也才会相应地处于运行状态。一旦退出容器，
/bin/bash
命令也就结束了，这时容器也随之停止了运行。
但容器仍然是存在的，我们可以用
docker ps -a
命令查看当前系统中容器的列表
默认情况下，当执行
docker ps
命令时，只能看到正在运行的容器。如果指定
-a
标志，选项的话，那么
docker ps
命令会列出所有容器，包括正在运行的和已经停止的。
{
提示
}

你也可以为
docker ps
命令指定
-l
标志，该选项会列出最后一次运行的容器，包括正在运行和已经停止的。
从该命令的输出结果中我们可以看到关于这个容器的很多有用信息：
ID
、用于创建该容器的镜像、容器最后执行的命令、创建时间以及容器的退出状态（在上面的例子中，退出状态是
0
，因为容器是通过正常的
exit
命令退出的）。我们还可以看到，每个容器都有一个名称。
{
注意
}

有三种方式可以指代唯一容器：短
UUID
（如
f7cbdac22a02
）、长
UUID
（如
f7cbdac22a02e03c9438c729345e54db9d20cfa2ac1fc3494b6eb60872e74778
）或者名称（如
gray_cat
）。
4 容器命名
Docker
会为我们创建的每一个容器自动生成一个随机的名称。例如，上面我们刚刚创建的容器就被命名为
gray_cat
。如果想为容器指定一个名称，而不是使用自动生成的名称，则可以用
--name
标志来实现，如代码清单
3-10
所示。
代码清单3-10 给容器命名
?
1
2
$

sudo

docker run --name bob_the_container -i -t ubuntu

/bin/bash

root@aa3f365f0f4e:/# exit
上述命令将会创建一个名为
bob_the_container
的容器。一个合法的容器名称只能包含以下字符：小写字母
a~z
、大写字母
A~Z
、数字
0~9
、下划线、圆点、横线（如果用正则表达式来表示这些符号，就是
[a-zA-Z0-9_.-]
）。
在很多
Docker
命令中，我们都可以用容器的名称来替代容器
ID
，后面我们将会看到。容器名称有助于分辨容器，当构建容器和应用程序之间的逻辑连接时，容器的名称也有助于从逻辑上理解连接关系。具体的名称（如
web
、
db
）比容器
ID
和随机容器名好记多了。我推荐大家都使用容器名称，以更加方便地管理容器。
容器的命名必须是唯一的。如果我们试图创建两个名称相同的容器，则命令将会失败。如果要使用的容器名称已经存在，可以先用
docker rm
命令删除已有的同名容器后，再来创建新的容器。
5 重新启动已经停止的容器
bob_the_container
容器已经停止了，接下来我们能对它做些什么呢？如果愿意，我们可以用下面的命令重新启动一个已经停止的容器，如代码清单
3-11
所示。
代码清单3-11 启动已经停止运行的容器
?
1
$

sudo

docker start bob_the_container
除了容器名称，我们也可以用容器ID来指定容器，如代码清单3-12所示。
代码清单3-12 通过ID启动已经停止运行的容器
?
1
$

sudo

docker start aa3f365f0f4e
{
提示
}

我们也可以使用
docker restart
命令来重新启动一个容器。
这时运行不带
-a
标志的
docker ps
命令，就应该看到我们的容器已经开始运行了。
6 附着到容器上
Docker
容器重新启动的时候，会沿用
docker run
命令时指定的参数来运行，因此我们容器重新启动后会运行一个交互式会话
shell
。此外，我们也可以用
docker attach
命令，重新附着到该容器的会话上，如代码清单
3-13
所示。
代码清单3-13 附着到正在运行的容器
?
1
$

sudo

docker attach bob_the_container
我们也可以使用容器ID，重新附着到容器的会话上，如代码清单3-14所示。
代码清单3-14 通过ID附着到正在运行的容器
?
1
$

sudo

docker attach aa3f365f0f4e
现在，我们又重新回到了容器的Bash提示符，如代码清单3-15所示。
代码清单3-15 重新附着到容器的会话
?
1
root@aa3f365f0f4e:/#
{
提示
}

你可能需要按下回车键才能进入该会话。
如果退出容器的shell，容器也会随之停止运行。
7 创建守护式容器
除了这些交互式运行的容器（interactive container），我们也可以创建长期运行的容器。守护式容器（daemonized container）没有交互式会话，非常适合运行应用程序和服务。大多数时候我们都需要以守护式来运行我们的容器。下面我们就来启动一个守护式容器，如 代码清单3-16所示。
代码清单3-16 创建长期运行的容器
?
1
2
$

sudo

docker run --name daemon_dave -d ubuntu

/bin/sh

-c

"while true; do echo hello world; sleep 1; done"

1333bb1a66af402138485fe44a335b382c09a887aa9f95cb9725e309ce5b7db3
我们在上面的
docker run
命令使用了
-d
参数，因此
Docker
会将容器放到后台运行。
我们还在容器要运行的命令里使用了一个
while
循环，该循环会一直打印
hello world
，直到容器或其进程停止运行。
通过组合使用上面的这些参数，你可以发现
docker run
命令并没有像上一个容器一样将主机的控制台附着到新的
shell
会话上，而是仅仅返回了一个容器
ID
而已，我们还是在主机的命令行之中。如果我们执行
docker ps
命令，可以看到一个正在运行的容器，如代码清单
3-17
所示。
代码清单
3-17

查看正在运行的
daemon_dave
容器
?
1
2
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
1333bb1a66af ubuntu:14.04

/bin/sh

-c 'while

tr

32 secs ago Up 27 daemon_dave
8容器内部都在干些什么
现在我们已经有了一个在后台运行
while
循环的守护型容器。为了探究该容器内部都在干些什么，我们可以用
docker logs
命令来获取容器的日志，如代码清单
3-18
所示。
代码清单3-18 获取守护式容器的日志
?
1
2
3
4
5
6
7
8
9
$

sudo

docker logs daemon_dave
hello world
hello world
hello world
hello world
hello world
hello world
hello world
. . .
这里，我们可以看到
while
循环正在向日志里打印
hello world
。
Docker
会输出最后几条日志项并返回。我们也可以在命令后使用
-f
参数来监控
Docker
的日志，这与
tail -f
命令非常相似，如代码清单
3-19
所示。
代码清单3-19 跟踪守护式容器的日志
?
1
2
3
4
5
6
7
8
9
$

sudo

docker logs -f daemon_dave
hello world
hello world
hello world
hello world
hello world
hello world
hello world
. . .
{
提示
}

可以通过
Ctrl+C
退出日志跟踪。
我们也可以跟踪容器日志的某一片段，和之前类似，只需要在
tail
命令后加入
-f --lines
标志即可。例如，可以用
docker logs --tail 10 daemon_dave
获取日志的最后
10
行内容。另外，也可以用
docker logs --tail 0 -f daemon_dave
命令来跟踪某个容器的最新日志而不必读取整个日志文件。
为了让调试更简单，我们还可以使用
-t
标志为每条日志项加上时间戳，如代码清单
3-20
所示。
代码清单3-20 跟踪守护式容器的最新日志
?
1
2
3
4
5
6
7
$

sudo

docker logs -ft daemon_dave
[May 10 13:06:17.934] hello world
[May 10 13:06:18.935] hello world
[May 10 13:06:19.937] hello world
[May 10 13:06:20.939] hello world
[May 10 13:06:21.942] hello world
. . .
{
提示
}

同样，可以通过
Ctr+C
退出日志跟踪。
9 查看容器内的进程
除了容器的日志，我们也可以查看容器内部运行的进程。要做到这一点，要使用
docker top
命令，如代码清单
3-21
所示。
代码清单3-21 查看守护式容器的进程
?
1
$

sudo

docker

top

daemon_dave
该命令执行后，我们可以看到容器内的所有进程（主要还是我们的
while
循环）、运行进程的用户及进程
ID
，如代码清单
3-22
所示。
代码清单
3-22

docker``top
命令的输出结果
?
1
2
3
PID USER COMMAND
977 root

/bin/sh

-c

while

true;

do

echo

hello world;

sleep

1;

done

1123 root

sleep

1
10 在容器内部运行进程
在
Docker 1.3
之后，我们也可以通过
docker exec
命令在容器内部额外启动新进程。可以在容器内运行的

进程有两种类型：后台任务和交互式任务。后台任务在容器内运行且没有交互需求，而交互式任务则保持在前台运行。对于需要在容器内部打开
shell
的任务，

交互式任务是很实用的。下面我们先来看一个后台任务的例子，如代码清单
3-23
所示。
代码清单3-23 在容器中运行后台任务
?
1
$

sudo

docker

exec

-d daemon_dave

touch

/etc
ew_config_file
这里的
-d
标志表明需要运行一个后台进程，
-d
标志之后，指定的是要在内部执行这个命令的容器的名字以及要执行的命令。上面例子中的命令会在
daemon_dave
容器内创建了一个空文件，文件名为
/etc
ew_config_file
。通过
docker exec
后台命令，我们可以在正在运行的容器中进行维护、监控及管理任务。
我们也可以在
daemon_dave
容器中启动一个诸如打开
shell
的交互式任务，如代码清单
3-24
所示。
代码清单3-24 在容器内运行交互命令
?
1
$

sudo

docker

exec

-t -i daemon_dave

/bin/bashVersion:
和运行交互容器时一样，这里的
-t
和
-i
标志为我们执行的进程创建了
TTY
并捕捉
STDIN
。接着我们指定了要在内部执行这个命令的容器的名字以及要执行的命令。在上面的例子中，这条命令会在
daemon_dave
容器内创建一个新的
bash
会话，有了这个会话，我们就可以在该容器中运行其他命令了。
{
注意
}

docker exec
命令是
Docker 1.3
引入的，早期版本并不支持该命令。对于早期
Docker
版本，请参考第
6
章中介绍的
nsenter
命令。
11 停止守护式容器
要停止守护式容器，只需要执行
docker stop
命令，如代码清单
3-25
所示。
代码清单3-25 停止正在运行的Docker容器
?
1
$

sudo

docker stop daemon_dave
当然，也可以用容器ID来指代容器名称，如代码清单3-26所示。
代码清单3-26 通过容器ID停止正在运行的容器
?
1
$

sudo

docker stop c2c4e57c12c4
{
注意
}

docker stop
命令会向
Docker
容器进程发送
SIGTERM
信号。如果你想快速停止某个容器，也可以使用
docker kill
命令来向容器进程发送
SIGKILL
信号。
要想查看已经停止的容器的状态，则可以使用
docker ps
命令。还有一个很实用的命令
docker ps -n x
，该命令会显示最后
x
个容器，不论这些容器正在运行还是已经停止。
12 自动重启容器
如果由于某种错误而导致容器停止运行，我们还可以通过
--restart
标志，让
Docker
自动重新启动该容器。
--restart
标志会检查容器的退出代码，并据此来决定是否要重启容器。默认的行为是
Docker
不会重启容器。
代码清单
3-27
是一个在
docker run
命令中使用
—restart
标志的例子。
代码清单3-27 自动重启容器
?
1
2
$

sudo

docker run --restart=always --name daemon_dave -d ubuntu /
bin/sh

-c

"while true; do echo hello world; sleep 1; done"
在本例中，
--restart
标志被设置为
always
。无论容器的退出代码是什么，
Docker
都会自动重启该容器。除了
always
，我们还可以将这个标志设为
on-failure
，这样，只有当容器的退出代码为非
0
值的时候，才会自动重启。另外，
on-failure``
还接受
``
一个可选的重启次数参数，如代码清单
3-28
所示。
代码清单
3-28

为
on-failure
指定
count
参数
?
1
--restart=on-failure:5
这样，当容器退出代码为非0时，Docker会尝试自动重启该容器，最多重启5次。
{注意}

--restart标志是Docker1.2.0引入的选项。
13 深入容器
除了通过
docker ps
命令获取容器的信息，我们还可以使用
docker inspect``
来获得更多的容器信息，如代码清单
3-29
所示。
代码清单3-29 查看容器
?
1
2
3
4
5
6
7
8
9
10
11
12
$

sudo

docker inspect daemon_dave
[{
"ID":

"c2c4e57c12c4c142271c031333823af95d64b20b5d607970c334784430bcbd0f",
"Created":

"2014-05-10T11:49:01.902029966Z",
"Path":

"/bin/sh",
"Args": [
"-c",
"while true; do echo hello world; sleep 1; done"

],
"Config": {
"Hostname":

"c2c4e57c12c4",
. . .
docker inspect
命令会对容器进行详细的检查，然后返回其配置信息，包括名称、命令、网络配置以及很多有用的数据。
我们也可以用
-f
或者
--format
标志来选定查看结果，如代码清单
3-30
所示。
代码清单3-30 有选择地获取容器信息
?
1
2
$

sudo

docker inspect --format='{{ .State.Running }}'

daemon_dave
false
上面这条命令会返回容器的运行状态，示例中该状态为
false
。我们还能获取其他有用的信息，如容器
IP
地址，如代码清单
3-31
所示。
代码清单3-31 查看容器的IP地址
?
1
2
3
$

sudo

docker inspect --format

'{{ .NetworkSettings.IPAddress }}'

\
daemon_dave
172.17.0.2
{
提示
}

--format
或者
-f
标志远非表面看上去那么简单。该标志实际上支持完整的
Go
语言模板。用它进行查询时，可以充分利用
Go
语言模板的优势。
我们也可以同时指定多个容器，并显示每个容器的输出结果，如代码清单3-32所示。
代码清单3-32 查看多个容器
?
1
2
3
4
$

sudo

docker inspect --format

'{{.Name}} {{.State.Running}}'

\
daemon_dave bob_the_container
/daemon_dave

false

/bob_the_container

false
我们可以为该参数指定要查询和返回的查看散列（inspect hash）中的任意部分。
{
注意
}

除了查看容器，你还可以通过浏览
/var/lib/docker
目录来深入了解
Docker
的工作原理。该目录存放着
Docker
镜像、容器以及容器的配置。所有的容器都保存在
/var/lib/docker/containers
目录下。
14 删除容器
如果容器已经不再使用，可以使用
docker rm
命令来删除它们，如代码清单
3-33
所示。
代码清单3-33 删除容器
?
1
2
$

sudo

docker

rm

80430f8d0921
80430f8d0921
{
注意
}

需要注意的是，运行中的
Docker
容器是无法删除的！你必须先通过
docker stop
或
docker kill
命令停止容器，才能将其删除。
目前，还没有办法一次删除所有容器，不过可以通过代码清单3-34所示的小技巧来删除全部容器。
代码清单3-34 删除所有容器
?
1
docker

rm

`docker

ps

-a -q`
上面的
docker ps
命令会列出现有的全部容器，
-a
标志代表列出所有（
all
）容器，而
-q
标志则表示只需要返回容器的
ID
而不会返回容器的其他信息。这样我们就得到了容器
ID
的列表，并传给了
docker rm
命令，从而达到删除所有容器的目的。
小结
在本章中我们介绍了Docker容器的基本工作原理。这里学到的内容也是本书剩余章节中学习如何使用Docker的基础。
本文摘自《第一本Docker书》

已使用 Microsoft OneNote 2016 创建。
