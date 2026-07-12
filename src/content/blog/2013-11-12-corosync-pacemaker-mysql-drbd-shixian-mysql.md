---
title: 'corosync + pacemaker + mysql + drbd 实现 MySQL 高可用'
date: '2013-11-12'
description: 通过 corosync + pacemaker + mysql + drbd 实现 MySQL 双节点高可用集群的完整部署方案，包括集群信息层、资源管理器、数据镜像和故障转移配置。
category: linux
tags:
  - mysql
  - 高可用
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
origin_url: 'http://litaotao.blog.51cto.com/6224470/1303307'
---

![](/images/legacy/legacy-45212149b0.jpg)

高可用集群整体方案整理笔记，包含组件关系、安装配置和故障转移验证。

## 环境

- OS: CentOS 6.x (RHEL 6.x)
- kernel: 2.6.32-358.el6.x86_64
- yum 源：

```ini
[centos]
name=sohu-centos
baseurl=http://mirrors.sohu.com/centos/$releasever/os/$basearch
gpgcheck=1
enable=0
gpgkey=http://mirrors.sohu.com/centos/RPM-GPG-KEY-CentOS-6

[epel]
name=sohu-epel
baseurl=http://mirrors.sohu.com/fedora-epel/$releasever/$basearch/
enable=1
gpgcheck=0
```

### 拓扑图

![](/images/legacy/legacy-5f9f9c6800.gif)

## 组件说明

**corosync**: 源自 OpenAIS 项目，实现 HA 心跳信息传输的集群信息层（Messaging Layer）工具，与 Heartbeat 并行流行。

**pacemaker**: 集群资源管理器 (CRM)，管理来自集群信息层的信息。常见的 CRM 有：
- heartbeat v1 → haresources
- heartbeat v2 → crm
- heartbeat v3 → pacemaker
- RHCS (cman) → rgmanager

corosync 与 pacemaker 的关系：

![](/images/legacy/legacy-fa51a8efe0.gif)

**MySQL**: 开源关系型数据库。

**DRBD**: 分布式复制块设备 (Distributed Replication Block Device)，通过在主从节点间同步数据块实现数据镜像（类似 RAID1）。主节点的磁盘写请求会通过网络同步到从节点，DRBD 一般是一主一从，读写和挂载只能在主节点上进行，但主从可互相切换。

DRBD 仅实现数据镜像，主节点故障时从节点可提供服务但不会自动切换。高可用集群通过 pacemaker 实现自动故障转移——当 DRBD 主节点故障时，集群自动将服务转移到从节点。

## 前置准备

### 配置 hosts

```bash
# 节点 jie2.com
sed -i s/`grep HOSTNAME /etc/sysconfig/network |awk -F '=' '{print $2}'`/jie2.com/g /etc/sysconfig/network
cat >>/etc/hosts << EOF
172.16.22.2 jie2.com jie2
172.16.22.3 jie3.com jie3
EOF

# 节点 jie3.com
sed -i s/`grep HOSTNAME /etc/sysconfig/network |awk -F '=' '{print $2}'`/jie3.com/g /etc/sysconfig/network
cat >>/etc/hosts << EOF
172.16.22.2 jie2.com jie2
172.16.22.3 jie3.com jie3
EOF
```

### SSH 互信

```bash
# 节点 jie2.com
ssh-keygen -t rsa -P ''
ssh-copy-id -i .ssh/id_rsa.pub jie3

# 节点 jie3.com
ssh-keygen -t rsa -P ''
ssh-copy-id -i .ssh/id_rsa.pub jie2
```

### 关闭 NetworkManager

```bash
# 两个节点都执行
chkconfig --del NetworkManager
chkconfig NetworkManager off
service NetworkManager stop
```

### 时间同步

```bash
# 两个节点都执行
ntpdate 172.16.0.1
```

## 安装 corosync + pacemaker

### 安装软件包

```bash
# 两个节点都执行
yum -y install corosync pacemaker
yum -y --nogpgcheck install crmsh-1.2.6-4.el6.x86_64.rpm pssh-2.3.1-2.el6.x86_64.rpm
```

### 配置 corosync.conf

```bash
cd /etc/corosync/
mv corosync.conf.example corosync.conf
```

编辑 `/etc/corosync/corosync.conf`：

```text
# Please read the corosync.conf.5 manual page
compatibility: whitetank

totem {
  version: 2
  secauth: on
  threads: 0
  interface {
    ringnumber: 0
    bindnetaddr: 172.16.0.0
    mcastaddr: 226.94.1.1
    mcastport: 5405
    ttl: 1
  }
}

logging {
  fileline: off
  to_stderr: no
  to_logfile: yes
  to_syslog: no
  logfile: /var/log/cluster/corosync.log
  debug: off
  timestamp: on
  logger_subsys {
    subsys: AMF
    debug: off
  }
}

amf {
  mode: disabled
}

service {
  ver: 0
  name: pacemaker
}

aisexec {
  user: root
  group: root
}
```

复制配置到 jie3：

```bash
scp corosync.conf jie3:/etc/corosync/
```

### 生成认证文件

```bash
corosync-keygen
# 需要输入足够的随机数，持续敲击键盘
scp authkey jie3:/etc/corosync/
```

### 启动服务

```bash
# 两个节点都执行
service corosync start
crm status
```

预期输出：
```
2 Nodes configured, 2 expected votes
Online: [ jie2.com jie3.com ]
```

## 编译安装 MySQL

两个节点的操作过程相同。

```bash
tar xf mysql-5.5.33.tar.gz
yum -y groupinstall "Development tools" "Server Platform Development"
cd mysql-5.5.33
yum -y install cmake

cmake . -DCMAKE_INSTALL_PREFIX=/usr/local/mysql \
  -DMYSQL_DATADIR=/mydata/data \
  -DSYSCONFDIR=/etc \
  -DWITH_INNOBASE_STORAGE_ENGINE=1 \
  -DWITH_ARCHIVE_STORAGE_ENGINE=1 \
  -DWITH_BLACKHOLE_STORAGE_ENGINE=1 \
  -DWITH_READLINE=1 \
  -DWITH_SSL=system \
  -DWITH_ZLIB=system \
  -DWITH_LIBWRAP=0 \
  -DMYSQL_UNIX_ADDR=/tmp/mysql.sock \
  -DDEFAULT_CHARSET=utf8 \
  -DDEFAULT_COLLATION=utf8_general_ci

make && make install

# 建立配置文件和脚本
cp /usr/local/mysql/support-files/my-large.cnf /etc/my.cnf
cp /usr/local/mysql/support-files/mysql.server /etc/rc.d/init.d/mysqld
cd /usr/local/mysql/

useradd -r -u 306 mysql
chown -R root:mysql ./*

# 关联系统识别的路径
echo "PATH=/usr/local/mysql/bin:$PATH" >/etc/profile.d/mysqld.sh
source /etc/profile.d/mysqld.sh
echo "/usr/local/mysql/lib" >/etc/ld.so.conf.d/mysqld.conf
ldconfig -v | grep mysql
ln -sv /usr/local/mysql/include/ /usr/local/mysqld
```

暂不初始化数据库，待 DRBD 配置完成后初始化。

## 安装 DRBD

注：DRBD 内核模块版本必须与内核版本匹配。

### 分区

```bash
# 两个节点都执行，创建 5GB 分区用于 DRBD
fdisk /dev/sda
# 操作：n → p → 3 → +5G → w
```

### 安装软件包

```bash
# 两个节点都执行
rpm -ivh drbd-kmdl-2.6.32-358.el6-8.4.3-33.el6.x86_64.rpm
rpm -ivh drbd-8.4.3-33.el6.x86_64.rpm
```

### 配置文件

编辑 `/etc/drbd.d/global_common.conf`：

```text
global {
  usage-count no;
}

common {
  protocol C;
  handlers {
    pri-on-incon-degr "/usr/lib/drbd/notify-pri-on-incon-degr.sh; /usr/lib/drbd/notify-emergency-reboot.sh; echo b > /proc/sysrq-trigger ; reboot -f";
    pri-lost-after-sb "/usr/lib/drbd/notify-pri-lost-after-sb.sh; /usr/lib/drbd/notify-emergency-reboot.sh; echo b > /proc/sysrq-trigger ; reboot -f";
    local-io-error "/usr/lib/drbd/notify-io-error.sh; /usr/lib/drbd/notify-emergency-shutdown.sh; echo o > /proc/sysrq-trigger ; halt -f";
  }
  startup {
  }
  disk {
    on-io-error detach;
  }
  net {
    cram-hmac-alg "sha1";
    shared-secret "mydrbdlab";
  }
  syncer {
    rate 1000M;
  }
}
```

编辑 `/etc/drbd.d/mydata.res`：

```text
resource mydata {
  on jie2.com {
    device /dev/drbd0;
    disk /dev/sda3;
    address 172.16.22.2:7789;
    meta-disk internal;
  }
  on jie3.com {
    device /dev/drbd0;
    disk /dev/sda3;
    address 172.16.22.3:7789;
    meta-disk internal;
  }
}
```

复制配置到 jie3：

```bash
scp global_common.conf mydata.res jie3:/etc/drbd.d/
```

### 初始化并启动

```bash
# 两个节点都执行
drbdadm create-md mydata
service drbd start
```

### 同步数据

```bash
# jie2.com：设为主节点
drbdadm primary --force mydata

# 查看同步进度
cat /proc/drbd
watch -n1 'cat /proc/drbd'

# 同步完成后，两边都应为 UpToDate/UpToDate
```

### 格式化

```bash
# 在主节点上格式化 DRBD 分区
mke2fs -t ext4 /dev/drbd0
```

## MySQL 与 DRBD 实现数据镜像

### 挂载与初始化

```bash
# jie2.com (主)
mkdir /mydata
mount /dev/drbd0 /mydata/
mkdir /mydata/data
chown -R mysql:mysql /mydata

# 修改 /etc/my.cnf
# datadir = /mydata/data
# innodb_file_per_table = 1

/usr/local/mysql/scripts/mysql_install_db --user=mysql --datadir=/mydata/data/ --basedir=/usr/local/mysql
service mysqld start
```

### 验证数据镜像

```bash
# jie2.com：创建测试数据库
mysql
> create database jie2;
> show databases;
> exit;

# jie2.com：停止 MySQL 并卸载 DRBD
service mysqld stop
umount /dev/drbd0
drbdadm secondary mydata

# jie3.com：切换为主节点
drbdadm primary mydata
mkdir /mydata
chown -R mysql:mysql /mydata
mount /dev/drbd0 /mydata

# 修改 /etc/my.cnf
# datadir = /mydata/data
# innodb_file_per_table = 1

service mysqld start
mysql
> show databases;  # 应可见 jie2 数据库
> exit;
```

## 利用 crmsh 配置 MySQL 高可用

DRBD 和 MySQL 作为集群管理的资源，不应开机自启。

### 停止服务

```bash
# 两个节点都执行
service mysqld stop
service drbd stop
# jie3：umount /dev/drbd0
```

### 定义集群资源

```bash
crm
configure
property stonith-enabled=false
property no-quorum-policy=ignore

# 定义 DRBD 资源
primitive mysqldrbd ocf:linbit:drbd params drbd_resource=mydata op monitor role=Master interval=10 timeout=20 op monitor role=Slave interval=20 timeout=20 op start timeout=240 op stop timeout=100
verify

# 定义主从资源
ms ms_mysqldrbd mysqldrbd meta master-max=1 master-node-max=1 clone-max=2 clone-node-max=1 notify=true
verify

# 定义文件系统资源
primitive mystore ocf:heartbeat:Filesystem params device="/dev/drbd0" directory="/mydata" fstype="ext4" op monitor interval=40 timeout=40 op start timeout=60 op stop timeout=60
verify

# 定义约束关系
colocation mystore_with_ms_mysqldrbd inf: mystore ms_mysqldrbd:Master
order ms_mysqldrbd_before_mystore mandatory: ms_mysqldrbd:promote mystore:start
verify

# 定义 VIP 和 MySQL 服务资源
primitive myvip ocf:heartbeat:IPaddr params ip="172.16.22.100" op monitor interval=20 timeout=20 on-fail=restart
primitive myserver lsb:mysqld op monitor interval=20 timeout=20 on-fail=restart
verify

# 定义服务约束关系
colocation myserver_with_mystore inf: myserver mystore
order mystore_before_myserver mandatory: mystore:start myserver:start
verify

colocation myvip_with_myserver inf: myvip myserver
order myvip_before_myserver mandatory: myvip myserver
verify

commit
```

### 查看资源状态

```bash
crm status
```

预期输出：
```
2 Nodes configured, 2 expected votes
Online: [ jie2.com jie3.com ]

Master/Slave Set: ms_mysqldrbd [mysqldrbd]
 Masters: [ jie3.com ]
 Slaves: [ jie2.com ]

mystore (ocf::heartbeat:Filesystem): Started jie3.com
myvip (ocf::heartbeat:IPaddr): Started jie3.com
myserver (lsb:mysqld): Started jie3.com
```

### 验证故障转移

```bash
# 切换主节点
crm node standby jie3.com
crm status

# 资源应转移到 jie2.com
# Masters: [ jie2.com ]
# Stopped: [ mysqldrbd:1 ]

# 取消备用
crm node online jie3.com
```

至此，MySQL 高可用集群部署完成。主要特点是 DRBD 实现数据同步，pacemaker 通过资源约束关系实现自动故障转移和服务转移。
