---
title: 对其他用户设定文件/目录的特殊权限 (setfacl)
date: '2014-06-26'
description: 使用 setfacl 为特定用户/组设置 ACL 权限；需先检查文件系统支持，可在 fstab 或 tune2fs 中开启。
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

## 环境信息

本篇所使用的 setfacl 版本：

```bash
[root@rhel6-server acltest]# setfacl --version
setfacl 2.2.49
```

## 检查文件系统支持

查看文件系统是否支持 ACL 权限控制：

```bash
tune2fs -l /dev/sda3 | grep option
```

输出：`Default mount options: acl`

## 开启 ACL 支持

### 方法 1：修改 mount 选项

临时开启：

```bash
mount -o remount,acl /dev/vda3 /mnt/acltest
```

开机自动挂载（修改 /etc/fstab）：

```bash
vim /etc/fstab
```

添加 `acl` 选项：

```
/dev/vda3 /mnt/acltest ext4 defaults,acl 0 0
```

### 方法 2：使用 tune2fs 修改文件系统

tune2fs 开启 ACL 后已永久有效，无需再改 fstab：

```bash
# 开启 ACL
tune2fs -o acl /dev/vda3

# 取消 ACL
tune2fs -o ^acl /dev/vda3
```

## 设置 ACL 权限

给某个用户设置权限：

```bash
setfacl -m u:joe:rx bobdir/
```

给某个组设置权限：

```bash
setfacl -m g:aclgp1:rx bobdir/
```

取消某项权限：

```bash
setfacl -x g:aclgp1 bobdir/
```

对文件或目录进行赋权：

```bash
setfacl -m user:qqgj_oss:rwx /usr/local/services/analyze/
```

## 权限递归

若要实现权限递归，即对目录下所有子目录和文件均有一样的权限，加上 `-R` 参数。注意：执行后对新增的文件和目录无效。

```bash
setfacl -R -m user:qqgj_oss:rwx /usr/local/services/analyze/
```

## 设置目录的默认 ACL

为新增的文件/目录自动应用 ACL，设置目录的默认 ACL：

```bash
setfacl -d -m user:qqgj_oss:rwx $dir
```

实现对目录下所有文件、目录以及新增文件/目录都有 ACL：

```bash
setfacl -R -d -m user:qqgj_oss:rwx $dir
```

## 注意事项

关于组权限：setfacl 设置的权限只对主组（`useradd -g` 或 `usermod -g` 的组）有效，对附加组（`useradd -G` 或 `usermod -aG` 的组）无效。

setfacl 和 chmod 的权限可以相互覆盖。当两者权限不一致时，以 `getfacl` 看到的 `#effective:` 后的权限为准。
