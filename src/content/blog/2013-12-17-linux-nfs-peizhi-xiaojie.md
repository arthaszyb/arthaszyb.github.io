---
title: Linux NFS 配置小结
date: '2013-12-17'
description: Linux NFS（网络文件系统）的配置步骤，包括服务安装、exports 配置文件编写、权限设置和客户端挂载
category: linux
tags:
  - nfs
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

## Redhat Linux NFS 配置

NFS简介：

NFS是网络文件系统的简写（network file system），主要用在linux或unix环境中，是有sun公司开发，并于1984年推出的一个RPC服务系统。

NFS功能介绍：

他可以将多个目录或者单个目录进行发布，例如我们在网刻系统的时候可以用NFS来共享光盘镜像，NFS是以发布目录的方式将文件进行发布，而客户端是以挂载的方式进行访问。客户端可以节省本地空间，将数据存放在nfs服务器上。NFS也可以针对但个用户以及多用户设置不同的访问权限。

详细配置步骤：

安装NFS必须要开启的服务有：nfs、portmap、

NFS的配置相对于其他服务是比较简单的，我们依然还是要注意防火墙以及SElinux，

首先我们检查软件是否已安装，这里我已经都安装了。

![](/images/legacy/legacy-6293a2a0de.png)

在安装redhat linux 时这些包默认就已被安装，如果你检查发现没有安装，可以使用一下命令进行安装；

#rpm –ivh nfs\*

#rpm –ivh portmap

配置NFS，配置文件在/etc/exports

首先我们使用vim打开/etc/exports 我们会发现这是一个空文件，里面没有任何内容。如果没有此文件，我们可以新创建一个，

这里我们举个例子来完成对NFS的配置，

例如：公司有多台计算机，而其中只有一台服务器有光驱，而我们其他的计算机也想安装光盘上的软件，现在我们就可以用NFS来实现。例如我们的服务器光驱挂载在/media上，接下来我们来编辑配置文件来实现以上的功能。

依然使用vi打开配置文件编辑以下内容：

![](/images/legacy/legacy-9d8adf5d1d.png)

然后保存退出，这个文件里我们只需编辑俩个字段：前面的为共享目录，后面的为哪些人可以访问以及访问权限，\*代表所有人（ro）为只读权限。

启动服务

![](/images/legacy/legacy-d408639fc9.png)

然后我们可以使用exportfs命令查询输出的目录

![](/images/legacy/legacy-3695558993.png)

客户端挂载

需要启动服务 portmap

使用mount命令挂载，例如我/下有nfs目录，我将挂载到nfs目录上

![](/images/legacy/legacy-f5439f68ba.png)

然后我们就可以访问光盘目录了，

反挂载使用umount /nfs

我们还可以使用shoumount --export 192.168.0.7 查看NFS所发布的目录

如果您想共享其他的目录也是安装同样的方法，注意权限问题，目录权限和共享权限。

一些相关共享权限：

ro 客户端为只读权限

rw 客户端为读写权限

root\_sqush 客户端使用root访问时映射为nobady （默认选项）

no\_root\_squash 客户端映射为root访问

启动服务的其它方式：/etc/rc.d/init.d/portmap start /etc/rc.d/init.d/nfs start

部分配置文件细节

exports文件内容格式：

<输出目录> \[客户端1 选项（访问权限，用户映射，其他）\] \[客户端2 选项（访问权限，用户映射，其他）\]

1.输出目录：

输出目录是指NFS系统中需要共享给客户机使用的目录；

2.客户端：

客户端是指网络中可以访问这个NFS输出目录的计算机

客户端常用的指定方式

指定ip地址的主机 192.168.0.200

指定子网中的所有主机 192.168.0.0/24

指定域名的主机 a.liusuping.com

指定域中的所有主机 \*.liusuping.com

所有主机 \*

3.选项：

选项用来设置输出目录的访问权限、用户映射等。NFS主要有3类选项：

访问权限选项

设置输出目录只读 ro

设置输出目录读写 rw

用户映射选项

all\_squash 将远程访问的所有普通用户及所属组都映射为匿名用户或用户组（nfsnobody）；

no\_all\_squash 与all\_squash取反（默认设置）；

root\_squash 将root用户及所属组都映射为匿名用户或用户组（默认设置）；

no\_root\_squash 与rootsquash取反；

anonuid=xxx 将远程访问的所有用户都映射为匿名用户，并指定该用户为本地用户（UID=xxx）；

anongid=xxx 将远程访问的所有用户组都映射为匿名用 户组账户，并指定该匿名用户组账户为本地用户组账户（GID=xxx）；

其它选项

secure 限制客户端只能从小于1024的tcp/ip端口连接nfs服务器（默认设置）；

insecure 允许客户端从大于1024的tcp/ip端口连接服务器；

sync 将数据同步写入内存缓冲区与磁盘中，效率低，但可以保证数据的一致性；

async 将数据先保存在内存缓冲区中，必要时才写入磁盘；

wdelay 检查是否有相关的写操作，如果有则将这些写操作 一起执行，这样可以提高效率（默认设置）；

no\_wdelay 若有写操作则立即执行，应与sync配合使用；

subtree 若输出目录是一个子目录，则nfs服务器将检查其父目录的权限（默认设置）；

no\_subtree 即使输出目录是一个子目录，nfs服务器也不检查其父目录的权限，这样可以提高效率；

/home/work 192.168.0.\*（rw,sync,no\_root\_squash）

内容表示：允许ip 地址范围在192.168.0.\*的计算机以读写的权限来访问/home/work 目录。

/home/work 也称为服务器输出共享目录。

括号内的参数意义描述如下：

rw:读/写权限，只读权限的参数为ro;

sync:数据同步写入内存和硬盘，也可以使用async,此时数据会先暂存于内存中，而不立即写入硬盘。

no\_root\_squash:NFS 服务器共享目录用户的属性，如果用户是 root,那么对于这个共享目录来说就具有 root 的权限。

接着执行如下命令，启动端口映射：

# /etc/rc.d/init.d/portmap start

最后执行如下命令启动NFS 服务，此时NFS 会激活守护进程，然后就开始监听 Client 端的请求：

# /etc/rc.d/init.d/nfs start

用户也可以重新启动Linux 服务器，自动启动Linux NFS 服务。

在NFS 服务器启动后，还需要检查Linux 服务器的防火墙等设置（一般需要关闭防火墙服务），确保没有屏蔽掉NFS 使用的端口和允许通信的主机，主要是检查Linux 服务器iptables,ipchains 等选项的设置，以及/etc/hosts.deny,/etc/hosts.allow 文件。

我们首先在Linux 服务器上进行NFS 服务器的回环测试，验证共享目录是否能够被访问。在Linux 服务器上运行如下命令：

# mount –t nfs 192.168.0.20:/home/work /mnt

# ls /mnt

命令将Linux 服务器的NFS 输出共享目录挂载到/mnt 目录下，因此，如果NFS 正常工作，应该能够在/mnt 目录看到/home/work 共享目录中的内容。

客户端 mount命令 mount –t nfs 192.168.0.20:/home/work /mnt/nfs –o nolock

简单脚本执行

host启动nfs:

snfs

#!/bin/bash

ifconfig eth0 192.168.0.20

/etc/rc.d/init.d/portmap start

/etc/rc.d/init.d/nfs start

嵌入式目标机挂载nfs:

mnfs:

#!/bin/sh

mount -t nfs 192.168.0.20:/home/work/nfs /mnt/nfs -o nolock

echo "nfs ok!"

在客户端查看NFS各种状态

showmount -e 可看有分享哪些目录

# showmount -a 可看出所有的 mount

# showmount -e 172.16.75.1

在服务端 显示当前主机NFS服务器中已经被NFS客户机挂载使用的共享目录 # showmount -d

检查NFS的运行级别：

# chkconfig --list portmap

# chkconfig --list nfs

根据需要设置在相应的运行级别自动启动NFS：

# chkconfig --level 235 portmap on

# chkconfig --level 235 nfs on

客户端开机自动挂载

通过修改/etc/fstab文件可以实现开机自动挂载nfs目录

\[root@linux-b nfs1\]# vim /etc/fstab

/dev/VolGroup00/LogVol00 / ext3 defaults 1 1

LABEL=/boot /boot ext3 defaults 1 2

devpts /dev/pts devpts gid=5,mode=620 0 0

tmpfs /dev/shm tmpfs defaults 0 0

proc /proc proc defaults 0 0

sysfs /sys sysfs defaults 0 0

/dev/VolGroup00/LogVol01 swap swap defaults 0 0

192.168.0.231:/nfs/frank /mnt/nfs1 nfs defaults 0 0

1、在配置NFS服务器之前用ping命令确保两个linux系统正常连接，如果无法连接关闭图形界面中的防火墙#service iptables stop

2、更改完“exports”文件后要输入exportfs –rv ，使得“exports”文件生效。

3、检查nfs服务是否开启，默认是关闭的。
