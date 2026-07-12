---
title: Linux 下如何用 mdadm 实现软件 RAID
date: '2014-03-28'
description: "Linux 软件 RAID 完整指南：RAID 0/1/5 原理对比、mdadm 工具使用、磁盘分区与阵列创建、监控和管理、热备磁盘、磁盘故障处理等。"
category: linux
tags:
  - raid
draft: false
source: evernote-local-db
origin_url: 'http://www.php-oa.com/2007/10/17/linux-mdadm-raid.html'
lang: zh
---

## 背景

数据在企业中占重要地位，数据存储的安全性是使用计算机的重要问题。通常企业在服务器端采用冗余磁盘阵列（RAID）技术保护数据。高档服务器提供昂贵的硬件 RAID 控制器，但中小企业可以通过 Linux 软件 RAID 实现相同功能，既节省投资又能达到很好效果。

本文介绍在 Linux 下使用 mdadm 工具实现带有 Spare Disk 的软 RAID1（数据镜像）和其他 RAID 模式。

**环境**：
- 操作系统：RedHat Linux AS 4
- 内核版本：2.6.9-5.EL
- 支持：RAID0、RAID1、RAID4、RAID5、RAID6
- 磁盘：五块 36GB SCSI 磁盘（sda 用于系统，sdb/sdc/sdd/sde 组成 RAID5）

## 一、RAID 常用模式介绍

RAID（Redundant Array of Inexpensive Disk，冗余磁盘阵列）将多个磁盘组成一个阵列，通过分段存储和多磁盘并行读写来减少数据存取时间，同时利用不同技术实现数据冗余。好处：安全性高、速度快、容量大。

### RAID 0（条带化）

**特点**：将多个磁盘并列，成为一个大硬盘。按磁盘个数分段存储数据。速度最快，但**无数据冗余**，任何磁盘故障导致全部数据丢失。

- 磁盘利用率：n（n 个磁盘全部可用）
- 配置条件：最低 2 块磁盘，分区大小尽量相同
- 应用：对容量和速度要求高、容错率低，或集群环境

### RAID 1（镜像）

**特点**：磁盘镜像技术，在一个磁盘上存放数据的同时也在另一个磁盘上写一样的数据。因有备份磁盘，数据安全性最佳。写速度慢，但读取时性能接近 RAID0。

- 磁盘利用率：n/2
- 配置条件：最低 2 块磁盘，分区大小尽量相同
- 应用：数据库、金融系统等高可靠性要求场景，或读多写少情况

### RAID 5（校验块分散）

**特点**：以数据的校验位保证安全，校验位交互存放于各磁盘。任何一个磁盘故障都可根据其他磁盘的校验位重建数据。并行读写，性能高。

- 磁盘利用率：n-1
- 配置条件：最低 3 块磁盘，分区大小尽量相同
- 应用：事务处理环境，如售票系统、销售系统

## 二、mdadm 工具

mdadm 是单一程序，创建、管理 RAID 非常方便且稳定。支持 6 种模式：

- **Create**：创建阵列
- **Assemble**：激活阵列
- **Manage**：操作活动阵列中的设备
- **Follow/Monitor**：监控、告警、自动处理
- **Build**：对旧版本 md 驱动的旧阵列
- **Grow**：扩展阵列
- **Misc**：其他杂项操作

## 三、部署步骤

### 1. 准备磁盘

只有 Software RAID 格式的磁盘才能组成阵列，需使用 fdisk 对磁盘进行分区。

**对 sdb 分区**：

```bash
fdisk /dev/sdb
```

操作步骤：
- `n`：新建分区
- `t`：修改分区类型为 `fd`（Linux RAID autodetect）
- `w`：保存

**对 sdc、sdd 进行相同操作**。

### 2. 创建阵列

支持 LINEAR、RAID0、RAID1、RAID4、RAID5、RAID6、MULTIPATH。

**创建命令格式**：

```bash
mdadm [mode] [options]
```

**示例：创建 RAID0 阵列**

```bash
mdadm --create --verbose /dev/md0 --level=0 --raid-devices=3 /dev/sdb1 /dev/sdc1 /dev/sdd1
```

或简写：

```bash
mdadm -Cv /dev/md0 -l0 -n3 /dev/sd[bcd]1
```

其中：
- `-C/--create`：创建新阵列
- `-v/--verbose`：详细输出
- `-l/--level`：阵列模式
- `-n/--raid-devices`：参与阵列的磁盘数
- `-c`：指定 chunk size（默认 64K，例 `-c128` 为 128K）
- `-x/--spare-devices`：加入热备磁盘数量

### 3. 配置文件

mdadm 不强制要求 `/etc/mdadm.conf` 配置文件，但推荐配置以便追踪软 RAID 配置。

建立配置文件：

```bash
echo DEVICE /dev/sd[bcd]1 > /etc/mdadm.conf
mdadm -Ds >> /etc/mdadm.conf
mdadm --detail --scan >> /etc/mdadm.conf
```

### 4. 格式化阵列

将 `/dev/md0` 作为单独的设备操作：

```bash
mkfs.ext3 /dev/md0
mkdir /mnt/test
mount /dev/md0 /mnt/test
```

### 5. 开机自动挂载

编辑 `/etc/fstab`：

```bash
/dev/md0 /mnt/test auto defaults 0 0
```

## 四、监控和管理

### 1. 查看阵列状态

查看所有 md 驱动的阵列：

```bash
cat /proc/mdstat
```

查看指定阵列详细信息：

```bash
mdadm --detail /dev/md0   # 或 -D
```

### 2. 停止阵列

```bash
mdadm -S /dev/md0   # 或 --stop
```

**注意**：停止后，原组成阵列的磁盘将处于空闲状态，操作这些磁盘后将无法重启激活原阵列。

### 3. 启动阵列

```bash
mdadm -A /dev/md0 /dev/sd[bcd]1   # 或 --assemble
```

若已配置 `/etc/mdadm.conf`，可用 `-s` 自动查找：

```bash
mdadm -As /dev/md0
```

### 4. 检测磁盘

若未配置配置文件且忘记磁盘属于哪个阵列：

```bash
mdadm -E /dev/sdb1   # 或 --examine
```

获得 UUID 后可指定激活：

```bash
mdadm -Av /dev/md0 --uuid=8ba81579:e20fb0e8:e040da0e:f0b3fec8 /dev/sd*
```

### 5. 添加及删除磁盘

在 Manage 模式下对运行中的阵列进行操作，常用于处理故障磁盘、添加热备、替换磁盘。

**删除故障磁盘**：

```bash
mdadm /dev/md0 --fail /dev/sdc1 --remove /dev/sdc1
```

等待同步完成后，可添加新磁盘。

**注意**：RAID0 等模式不支持 `--fail` 和 `--remove`。

**添加新磁盘**：

```bash
mdadm /dev/md0 --add /dev/sdc1
```

对于满的阵列（如已有 2 块磁盘的 RAID1），`--add` 会自动将其作为 spare disk。

**注意**：RAID0 不支持 `--add`。

### 6. 监控

在 Follow 或 Monitor 模式下，可对阵列进行监控，当出现问题时发送邮件或自动处理。

```bash
nohup mdadm --monitor --mail=sysadmin --delay=300 /dev/md0 &
```

上述命令：每 300 秒监控一次，出错时发邮件给 sysadmin，`nohup` 和 `&` 使其后台持续运行。

**共享热备磁盘**：

可在 Follow 模式下为多个阵列定义 `spare-group`，当某个阵列的磁盘出现问题时，mdadm 自动从另一阵列的热备中移取磁盘加入。此功能仅对支持冗余的阵列有效（RAID1、RAID5 等），RAID0 无效。

配置示例：

```bash
DEVICE /dev/sd*
ARRAY /dev/md0 level=raid1 num-devices=3 spare-group=database
UUID=410a299e:4cdd535e:169d3df4:48b7144a
ARRAY /dev/md1 level=raid1 num-devices=2 spare-group=database
UUID=59b6e564:739d4d28:ae0aa308:71147fe7
```

## 五、其他操作

### 增加热备磁盘

创建时指定冗余磁盘：

```bash
mdadm -Cv /dev/md0 -l1 -n2 -x1 /dev/sd[bcd]1
```

其中 `-x1` 指定 1 个热备磁盘。

### 删除阵列

```bash
mdadm -S /dev/md0
# 或
rm /dev/md0
```

修改 `/etc/mdadm.conf`、`/etc/fstab` 等配置文件，删除相关条目，最后用 fdisk 对磁盘重新分区。

### 删除 RAID 中的硬盘

```bash
mdadm --stop /dev/md0
mdadm --remove /dev/md0
mdadm --zero-superblock /dev/sda
```

## 常用命令快速参考

| 操作 | 命令 |
|------|------|
| 启用阵列 | `mdadm -As /dev/md0` |
| 停止阵列 | `mdadm -S /dev/md0` |
| 显示详细信息 | `mdadm -D /dev/md0` |
| 查看状态 | `cat /proc/mdstat` |
| 标记故障 | `mdadm /dev/md0 --fail /dev/sdc1 --remove /dev/sdc1` |
| 添加磁盘 | `mdadm /dev/md0 --add /dev/sdc1` |

## 参考

- [mdadm 官方文档](http://www.linuxdevcenter.com/pub/a/linux/2002/12/05/RAID.html)
