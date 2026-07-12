---
title: 对其他用户设定文件/目录的特殊权限(setfacl)
date: '2014-06-26'
description: >-
  本篇所使用的setfacl版本： \[root@rhel6-server acltest\]# setfacl --version setfacl
  2.2.49 查看文件系统是否支持acl权限控制： \[root@rhel6-server acltest\]# tune2fs -l /dev/sda3
  | grep
category: linux
tags:
  - vim
draft: false
source: evernote-local-db
lang: zh
---
本篇所使用的setfacl版本：

\[root@rhel6-server acltest\]# setfacl --version

setfacl 2.2.49

查看文件系统是否支持acl权限控制：

\[root@rhel6-server acltest\]# tune2fs -l /dev/sda3 | grep option

Default mount options: acl

开启acl支持有两种方法：

1）修改mount选项：

mount -o remount,acl /dev/vda3 /mnt/acltest

开机自动挂载：

vim /etc/fstab

/dev/vda3 /mnt/acltest ext4 defaults,acl 0 0

2）使用tune2fs修改文件系统信息：

tune2fs开启acl后已是永久有效，无需再改fstab的mount选项：

tune2fs -o acl /dev/vda3 修改文件系统自身信息来设置acl选项

tune2fs -o ^acl /dev/vda3 取消acl选项

给某个用户设置权限：

setfacl -m u:joe:rx bobdir/

给某个组设置权限：

setfacl -m g:aclgp1:rx bobdir/

取消某项权限

setfacl -x g:aclgp1 bobdir/

对于组权限，setfacl设置的权限只对主组（即useradd -g或usermod -g的组）有效，对附加组（即useradd -G或usermod -aG的组）无效，即使文件的所有组已改为附加组。

setfacl和chmod设置的权限可以相互覆盖，当二者设置的权限不一致时，以使用getfacl看到的“#effective:”后的权限为准。

对文件或者目录进行赋权

setfacl -m user:qqgj\_oss:rwx /usr/local/services/analyze/

若要实现权限递归,即对目录下所有子目录和文件均有一样的权限,则加上-R参数.(执行后对新增的文件和目录无效)

setfacl -R -m user:qqgj\_oss:rwx /usr/local/services/analyze/

设置目录的默认acl

setfacl -d -m user:qqgj\_oss:rwx $dir

实现对目录下所有文件和目录以及新增文件/目录都有acl

setfacl -R -d -m user:qqgj\_oss:rwx $dir
