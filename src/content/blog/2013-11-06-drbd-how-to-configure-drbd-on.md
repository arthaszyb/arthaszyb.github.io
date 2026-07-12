---
title: DRBD – How to configure DRBD on CentOS 6
date: '2013-11-06'
description: >-
  DRBD® refers to block devices designed as a building block to form high
  availability(HA) clusters - Distributed Replicated Block Device This is done
  by
category: linux
tags:
  - dns
  - crontab
  - php
  - raid
  - drbd
draft: false
source: evernote-local-db
lang: zh
---
[DRBD](http://www.drbd.org/)® refers to block devices designed as a building block to form [high availability](http://en.wikipedia.org/wiki/High-availability_cluster)(HA) clusters - Distributed Replicated Block Device This is done by mirroring a whole block device via an assigned network. Distributed Replicated Block Device can be understood as network based [raid](http://en.wikipedia.org/wiki/RAID)\-1.

So, Distributed Replicated Block Device is actually a network based [RAID 1](http://en.wikipedia.org/wiki/Standard_RAID_levels). You are configuring [DRBD](http://www.drbd.org/) on your system if you:

- need to secure data on certain disk and are therefore mirroring your data to another machine via network.

- configuring [High Availability](http://en.wikipedia.org/wiki/High-availability_cluster) cluster or service.

REQUIREMENTS:

- additional disk for synchronization on BOTH MACHINES (preferably same size)

- network connectivity between machines

- working [DNS](http://en.wikipedia.org/wiki/Domain_Name_System) resolution (can fix with /etc/hosts file)

- [NTP](http://en.wikipedia.org/wiki/Network_Time_Protocol) synchronized times on both nodes

I’ve had problems running drbd84 on CentOS 6.4 running kernel 2.6.32-358.6.1.el6.i686 so i used drbd83 package. Tell me how it works for you…

#### _Let’s start our DRBD CentOS 6.x guide._

1\. BOTH MACHINES: Install [ELRepo](http://elrepo.org/tiki/tiki-index.php) repository on your system.

\[root@foo1 ~\]/bin/rpm -ivh [http://elrepo.org/elrepo-release-6-5.el6.elrepo.noarch.rpm](http://elrepo.org/elrepo-release-6-5.el6.elrepo.noarch.rpm)

2. BOTH MACHINES: Install Distributed Replicated Block Device utils and kmod packages from [ELRepo](http://elrepo.org/tiki/tiki-index.php) (choose the version you prefer – drbd83 or drbd84 – i’ve had problems with drbd84 on kernel 2.6.32-358.6.1.el6.i686).

\[root@foo1 ~\]/usr/bin/yum install -y kmod-drbd83 drbd83-utils

3. BOTH MACHINES: Insert drbd module manually or just reboot both machines.

\[root@foo1 ~\]/sbin/modprobe drbd

4\. BOTH MACHINES: Create the Distributed Replicated Block Device resource file (/etc/drbd.d/disk1.res) and transfer it to the other machine (these files need to be exactly the same on both machines!).

/etc/drbd.d/disk1.res

resource disk1

{

startup {

wfc-timeout 30;

outdated-wfc-timeout 20;

degr-wfc-timeout 30;

}

net {

cram-hmac-alg sha1;

shared-secret sync\_disk;

}

syncer {

rate 100M;

verify-alg sha1;

}

on foo1.geekpeek.net {

device minor 1;

disk /dev/sdb;

address 192.168.1.100:7789;

meta-disk internal;

}

on foo2.geekpeek.net {

device minor 1;

disk /dev/sdb;

address 192.168.1.101:7789;

meta-disk internal;

}

}

5\. BOTH MACHINES: Make sure that DNS resolution is working as expected! To quickly fix DNS resolution add IP addresses FQDN to /etc/hosts on both machines as follows:

/etc/hosts

192.168.1.100 foo1 foo1.geekpeek.net

192.168.1.101 foo2 foo2.geekpeek.net

6\. BOTH MACHINES: Make sure that both machines are using NTP for time synchronization! To quickly fix this add an entry to your /etc/crontab file as follows and choose your NTP sync server:

/etc/crontab

1 \* \* \* \* root ntpdate your.ntp.server

7\. BOTH MACHINES: Initialize the DRBD meta data storage:

\[root@foo1 ~\]/sbin/drbdadm create-md disk1

8\. BOTH MACHINES: Start the Distributed Replicated Block Device service on both nodes:

\[root@foo1 ~\]/etc/init.d/drbd start

9\. On the node you wish to make a PRIMARY node run drbdadm command:

\[root@foo1 ~\]/sbin/drbdadm — –overwrite-data-of-peer primary disk1

10\. Wait for the Distributed Replicated Block Device disk initial synchronization to complete (100%) and check to confirm you are on primary node:

\[root@foo1 ~\]cat /proc/drbd

version: 8.3.15 (api:88/proto:86-97)

GIT-hash: 0ce4d235fc02b5c53c1c52c53433d11a694eab8c build by phil@Build32R6, 2012-12-20 20:23:49

1: cs:SyncSource ro:Primary/Secondary ds:UpToDate/Inconsistent C r—n-

ns:1060156 nr:0 dw:33260 dr:1034352 al:14 bm:62 lo:9 pe:78 ua:64 ap:0 ep:1 wo:f oos:31424

\[==================>.\] sync’ed: 97.3% (31424/1048508)K

finish: 0:00:01 speed: 21,240 (15,644) K/sec

\[root@foo1 ~\]# cat /proc/drbd

version: 8.3.15 (api:88/proto:86-97)

GIT-hash: 0ce4d235fc02b5c53c1c52c53433d11a694eab8c build by phil@Build32R6, 2012-12-20 20:23:49

1: cs:Connected ro:Primary/Secondary ds:UpToDate/UpToDate C r—–

ns:1081628 nr:0 dw:33260 dr:1048752 al:14 bm:64 lo:0 pe:0 ua:0 ap:0 ep:1 wo:f oos:0

11\. Create desired filesystem on Distributed Replicated Block Device device:

\[root@foo1 ~\]/sbin/mkfs.ext4 /dev/drbd1

You can now mount DRBD device on your primary node! Want to learn how to manage DRBD from command line? Read “[DRBD Management and Basic Command Usage on CentOS 6](http://www.geekpeek.net/drbd-management-command-usage/)” post.
