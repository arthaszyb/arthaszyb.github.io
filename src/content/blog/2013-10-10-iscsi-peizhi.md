---
title: iSCSI 配置
date: '2013-10-10'
description: iSCSI 存储网络的服务端和 Linux 客户端配置步骤，包括目标定义、服务启动、设备发现和登陆等
category: linux
tags:
  - iscsi
  - linux-admin
  - 存储
draft: false
source: evernote-local-db
lang: zh
---

## 服务端配置

**1. 安装 iSCSI target 工具**

```bash
yum install scsi-target-utils
```

**2. 启动 tgtd 服务并设置自启动**

```bash
service tgtd start
chkconfig tgtd on
```

**3. 配置服务端目标定义**

编辑 `/etc/tgt/targets.conf`：

```ini
<target iqn.2013-10.com.example.cluster1:iscsi>
  backing-store /dev/sdc
  initiator-address 192.168.70.41
</target>
```

其中 `backing-store` 指定要发布的设备（磁盘或分区），`initiator-address` 对客户端的访问控制。

**4. 重启 tgtd**

```bash
service tgtd restart
tgtadm --lld iscsi --op show --mode target
```

## Linux 客户端配置

**1. 安装 iSCSI 启动器**

```bash
yum install iscsi-initiator
```

**2. 启动 iSCSI 服务**

```bash
service iscsi start
```

**3. 搜寻 iSCSI 目标**

```bash
iscsiadm -m discovery -t sendtargets -p 192.168.70.52:3260
```

**4. 显示发现的目标**

```bash
iscsiadm -m node
```

**5. 登陆 iSCSI 目标**

```bash
iscsiadm -m node --targetname iqn.2013-10.com.example.cluster1:iscsi -p 192.168.70.52:3260 --login
```

至此挂载成功，可通过 `fdisk -l` 查看。

**6. 退出 iSCSI 目标**

```bash
iscsiadm -m node -T iqn.2013-10.com.example.cluster1:iscsi -p 192.168.70.52:3260 -u
```

完成以上步骤后可正常分区格式化。
