---
title: 在 CentOS 6.2 上安装 DRBD
date: '2013-11-06'
description: 使用 ELRepo 仓库在 CentOS 6.2 上安装和配置 DRBD 的步骤，包括 elrepo 下载、安装和 DRBD 主从配置
category: linux
tags:
  - drbd
draft: false
source: evernote-local-db
lang: zh
---

RHEL 6 和 CentOS 6.2 不再有 DRBD 的 yum 仓库。如果想在 RHEL 6 上安装 DRBD，需要有 RedHat 支持合同。使用 ELRepo 仓库来在 CentOS 6.2 上安装 DRBD。

**Step-1 : download elrep using wget**

\[root@dbase1 ~\]# mkdir /download

\[root@dbase1 ~\]# cd /download/\[root@dbase1 ~\]# wget [http://elrepo.org/elrepo-release-6-4.el6.elrepo.noarch.rpm](http://elrepo.org/elrepo-release-6-4.el6.elrepo.noarch.rpm)

**Output**

\--2012\-06\-17 12:17:44\-- [http://elrepo.org/elrepo-release-6-4.el6.elrepo.noarch.rpmResolving](http://elrepo.org/elrepo-release-6-4.el6.elrepo.noarch.rpmResolving) elrepo.org... 69.195.83.87Connecting to elrepo.org|69.195.83.87|:80... connected.

HTTP request sent, awaiting response... 200 OK

Length: 6936 (6.8K) \[application/x\-rpm\]Saving to: “elrepo\-release\-6\-4.el6.elrepo.noarch.rpm”

100%\[======================================\] 6,936 4.52K/s in 1.5s

2012\-06\-17 12:17:46 (4.52 KB/s) \- “elrepo\-release\-6\-4.el6.elrepo.noarch.rpm” saved \[6936/6936\]

**Step-2 : Install downloaded rpm**

\[root@dbase1 download\]# rpm \-ivUh elrepo\-release\-6\-4.el6.elrepo.noarch.rpm

**Output**

warning: elrepo\-release\-6\-4.el6.elrepo.noarch.rpm: Header V4 DSA/SHA1 Signature, key ID baadae52: NOKEY

Preparing... ########################################### \[100%\]

1:elrepo\-release ########################################### \[100%\]\[root@dbase1 download\]#

**RHEL 6 :**

**Step-3 : Edit /etc/yum.repos.d/elrepo.repo ( change line #8 ‘enable=0′ )** **注释：不要改为0，要1**

\[root@dbase1 download\]# vi /etc/yum.repos.d/elrepo.repo

\### Name: ELRepo.org Community Enterprise Linux Repository for el6### URL: [http://elrepo.org/](http://elrepo.org/)

\[elrepo\]

name\=ELRepo.org Community Enterprise Linux Repository \- el6

baseurl\=http://elrepo.org/linux/elrepo/el6/$basearch/

mirrorlist\=http://elrepo.org/mirrors-elrepo.el6

enabled\=0

gpgcheck\=1

gpgkey\=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-elrepo.org

protect\=0

**Step-4 : Now you can Install drbd83 on your CentOs 6.2 Box with ‘yum’.**

\[root@dbase1 download\]# yum \--enablerepo\=elrepo install drbd83\-utils kmod\-drbd83

**Output**

Loaded plugins: fastestmirror, presto

Loading mirror speeds from cached hostfile

\* base: centos.fastbull.org

\* elrepo: elrepo.org

\* extras: centos.fastbull.org

\* updates: centos.fastbull.org

elrepo | 1.9 kB 00:00

elrepo/primary\_db | 393 kB 00:44

Setting up Install ProcessResolving Dependencies

Dependencies Resolved

\================================================================================

Package Arch Version Repository Size\================================================================================Installing:

drbd83\-utils i686 8.3.13\-1.el6.elrepo elrepo 220 k

kmod\-drbd83 i686 8.3.13\-1.el6.elrepo elrepo 172 k

Installing for dependencies:

perl i686 4:5.10.1\-119.el6\_1.1 base 9.7 M

perl\-Module\-Pluggable i686 1:3.90\-119.el6\_1.1 base 37 k

perl\-Pod\-Escapes i686 1:1.04\-119.el6\_1.1 base 30 k

perl\-Pod\-Simple i686 1:3.13\-119.el6\_1.1 base 209 k

perl\-libs i686 4:5.10.1\-119.el6\_1.1 base 590 k

perl\-version i686 3:0.77\-119.el6\_1.1 base 49 k

Transaction Summary\================================================================================Install 8 Package(s)

Total download size: 11 M

Installed size: 31 M

Is this ok \[y/N\]: y

Downloading Packages:Setting up and reading Presto delta metadata

Processing delta metadata

Package(s) data still to download: 11 M

(1/8): drbd83\-utils\-8.3.13\-1.el6.elrepo.i686.rpm | 220 kB 00:12

(2/8): kmod\-drbd83\-8.3.13\-1.el6.elrepo.i686.rpm | 172 kB 00:06(3/8): perl\-5.10.1\-119.el6\_1.1.i686.rpm | 9.7 MB 10:18

(4/8): perl\-Module\-Pluggable\-3.90\-119.el6\_1.1.i686.rpm | 37 kB 00:00

(5/8): perl\-Pod\-Escapes\-1.04\-119.el6\_1.1.i686.rpm | 30 kB 00:03

(6/8): perl\-Pod\-Simple\-3.13\-119.el6\_1.1.i686.rpm | 209 kB 00:19

(7/8): perl\-libs\-5.10.1\-119.el6\_1.1.i686.rpm | 590 kB 00:43

(8/8): perl\-version\-0.77\-119.el6\_1.1.i686.rpm | 49 kB 00:03

\--------------------------------------------------------------------------------Total 16 kB/s | 11 MB 11:32

warning: rpmts\_HdrFromFdno: Header V4 DSA/SHA1 Signature, key ID baadae52: NOKEY

Retrieving key from [file:///etc/pki/rpm-gpg/RPM-GPG-KEY-elrepo.orgImporting](file://etc/pki/rpm-gpg/RPM-GPG-KEY-elrepo.orgImporting) GPG key 0xBAADAE52:

Userid : elrepo.org (RPM Signing Key for elrepo.org)

Package: elrepo\-release\-6\-4.el6.elrepo.noarch (installed)

From : /etc/pki/rpm\-gpg/RPM\-GPG\-KEY\-elrepo.org

Is this ok \[y/N\]: y

Running rpm\_check\_debug

Running Transaction TestTransaction Test SucceededRunning TransactionWarning: RPMDB altered outside of yum.

Installing : 1:perl\-Pod\-Escapes\-1.04\-119.el6\_1.1.i686 1/8

Installing : 3:perl\-version\-0.77\-119.el6\_1.1.i686 2/8

Installing : 4:perl\-libs\-5.10.1\-119.el6\_1.1.i686 3/8

Installing : 1:perl\-Pod\-Simple\-3.13\-119.el6\_1.1.i686 4/8

Installing : 1:perl\-Module\-Pluggable\-3.90\-119.el6\_1.1.i686 5/8

Installing : 4:perl\-5.10.1\-119.el6\_1.1.i686 6/8

Installing : drbd83\-utils\-8.3.13\-1.el6.elrepo.i686 7/8

Installing : kmod\-drbd83\-8.3.13\-1.el6.elrepo.i686 8/8

Working. This may take some time ...Done.

Installed:

drbd83\-utils.i686 0:8.3.13\-1.el6.elrepo

kmod\-drbd83.i686 0:8.3.13\-1.el6.elrepo

Dependency Installed:

perl.i686 4:5.10.1\-119.el6\_1.1

perl\-Module\-Pluggable.i686 1:3.90\-119.el6\_1.1

perl\-Pod\-Escapes.i686 1:1.04\-119.el6\_1.1

perl\-Pod\-Simple.i686 1:3.13\-119.el6\_1.1

perl\-libs.i686 4:5.10.1\-119.el6\_1.1

perl\-version.i686 3:0.77\-119.el6\_1.1

Complete!

\- See more at: [http://www.broexperts.com/2012/06/how-to-install-drbd-on-centos-6-2/#sthash.q91EgT1i.dpuf](http://www.broexperts.com/2012/06/how-to-install-drbd-on-centos-6-2/#sthash.q91EgT1i.dpuf)
