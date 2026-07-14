---
title: Docker run 命令的使用方法
date: '2018-10-08'
description: "Docker run命令详细参数说明，包括运行模式、网络设置、资源限制、权限控制等核心用法。"
category: container-virt
tags:
  - docker
draft: false
source: evernote-local-db
lang: zh
---

## 命令格式

```bash
$ sudo docker run [OPTIONS] IMAGE[:TAG] [COMMAND] [ARG...]
```

OPTIONS 分为两类：
- 设置运行方式（前台/后台、容器ID、网络、CPU/内存）
- 设置权限和容器默认资源

## 运行模式：Detached vs Foreground

**后台运行 (-d)**

```bash
-d=false: Detached mode: Run container in the background, print new container id
```

容器运行在后台时，I/O 只能通过网络资源或共享卷进行。不能使用 `--rm` 选项。可通过 `docker attach` 重新附着到容器。

**前台运行（默认）**

```bash
-a=[] : Attach to STDIN, STDOUT and/or STDERR
-t=false : Allocate a pseudo-tty
--sig-proxy=true : Proxify all received signal to the process
-i=false : Keep STDIN open even if not attached
```

交互式操作需要 `-i -t` 参数。通过管道交互时不需要 `-t`：

```bash
$ echo test | docker run -i busybox cat
```

## 容器识别

**Name (--name)**

可用三种方式标识容器：
1. UUID 长命名：`f78375b1c487e03c9438c729345e54db9d20cfa2ac1fc3494b6eb60872e74778`
2. UUID 短命令：`f78375b1c487`
3. Name：`evil_ptolemy`

不指定时自动生成随机 UUID。

**PID 文件**

```bash
--cidfile="": Write the container ID to the file
```

**镜像版本**

```bash
docker run ubuntu:14.04
```

## IPC 设置

```bash
--ipc="" : Set the IPC mode for the container
  'container:<name|id>': reuses another container's IPC namespace
  'host': use the host's IPC namespace inside the container
```

IPC（POSIX/SysV IPC）命名空间提供隔离的共享内存、信号灯和消息队列。用于数据库、高性能应用等需要进程间高速通信的场景。

## 网络设置

```bash
--dns=[] : Set custom dns servers for the container
--net="bridge" : Set the Network mode for the container
--add-host="" : Add a line to /etc/hosts (host:IP)
--mac-address="" : Sets the container's Ethernet device's MAC address
```

网络模式：
- `bridge`（默认）：通过 veth 接口桥接
- `none`：无网络连接
- `host`：使用主机网络堆栈（不安全，允许访问 D-BUS 等系统服务）
- `container:<name|id>`：复用另一容器网络堆栈

关闭网络：

```bash
$ docker run --net none ubuntu
```

覆盖 DNS：

```bash
$ docker run --dns 8.8.8.8 ubuntu
```

设置 MAC：

```bash
$ docker run --mac-address 12:34:56:78:9a:bc ubuntu
```

### Container 网络模式示例

复用 Redis 容器网络：

```bash
$ sudo docker run -d --name redis example/redis --bind 127.0.0.1
$ sudo docker run --rm -ti --net container:redis example/redis-cli -h 127.0.0.1
```

### 管理 /etc/hosts

```bash
$ docker run -ti --add-host db-static:86.75.30.9 ubuntu cat /etc/hosts
172.17.0.22 09d03f76bf2c
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
127.0.0.1 localhost
::1 localhost ip6-localhost ip6-loopback
86.75.30.9 db-static
```

## 清理 (--rm)

```bash
--rm=false: Automatically remove the container when it exits (incompatible with -d)
```

自动删除退出的容器及其文件系统。注意：`--rm` 和 `-d` 不能共用。

## CPU 和内存限制

```bash
-m="": Memory limit (format: <number><optional unit>, where unit = b, k, m or g)
-c=0 : CPU shares (relative weight)
```

设置内存限制：

```bash
$ docker run -m 512m ubuntu
```

设置 CPU 优先级（相对权重）：

```bash
$ docker run -c 512 ubuntu  # 512/1024 = 50% CPU
```

## 权限和 Linux Capabilities

```bash
--cap-add: Add Linux capabilities
--cap-drop: Drop Linux capabilities
--privileged=false: Give extended privileges to this container
--device=[]: Allows you to run devices inside the container without --privileged
--lxc-conf=[]: (lxc exec-driver only) Add custom lxc options
```

特权模式：

```bash
$ docker run --privileged ubuntu
```

限制访问特定设备：

```bash
$ sudo docker run --device=/dev/snd:/dev/snd ubuntu
```

设备权限控制（`:rwm` = read/write/mknod）：

```bash
$ sudo docker run --device=/dev/sda:/dev/xvdc --rm -it ubuntu fdisk /dev/xvdc
$ sudo docker run --device=/dev/sda:/dev/xvdc:r --rm -it ubuntu fdisk /dev/xvdc
$ sudo docker run --device=/dev/sda:/dev/xvdc:w --rm -it ubuntu fdisk /dev/xvdc
$ sudo docker run --device=/dev/sda:/dev/xvdc:m --rm -it ubuntu fdisk /dev/xvdc
```

Capabilities 精细控制：

```bash
$ sudo docker run --cap-add=ALL --cap-drop=MKNOD ubuntu
$ docker run -t -i --rm --cap-add=NET_ADMIN ubuntu:14.04 ip link add dummy0 type dummy
```

FUSE 文件系统：

```bash
$ docker run --rm -it --cap-add SYS_ADMIN --device /dev/fuse sshfs
```

## SELinux 安全配置

```bash
--security-opt="label:user:USER" : Set the label user for the container
--security-opt="label:role:ROLE" : Set the label role for the container
--security-opt="label:type:TYPE" : Set the label type for the container
--security-opt="label:level:LEVEL" : Set the label level for the container
--security-opt="label:disable" : Turn off label confinement
--security-opt="apparmor:PROFILE" : Set apparmor profile
```

MLS 级别设置：

```bash
$ docker run --security-opt label:level:s0:c100,c200 -i -t fedora bash
$ docker run --security-opt label:level:TopSecret -i -t rhel7 bash
```

禁用安全策略：

```bash
$ docker run --security-opt label:disable -i -t fedora bash
```

指定 SELinux 类型：

```bash
$ docker run --security-opt label:type:svirt_apache_t -i -t centos bash
```

## 覆盖 Dockerfile 默认配置

### CMD 默认命令

```bash
$ sudo docker run [OPTIONS] IMAGE[:TAG] [COMMAND] [ARG...]
```

可用新命令覆盖镜像中的默认 CMD。

### ENTRYPOINT

```bash
--entrypoint="": Overwrite the default entrypoint set by the image
```

例如：

```bash
$ sudo docker run -i -t --entrypoint /bin/bash example/redis
$ sudo docker run -i -t --entrypoint /bin/bash example/redis -c ls -l
$ sudo docker run -i -t --entrypoint /usr/bin/redis-cli example/redis --help
```

### 端口暴露 (EXPOSE)

```bash
--expose=[]: Expose a port or a range of ports without publishing to host
-P=false : Publish all exposed ports to the host interfaces
-p=[] : Publish a container's port to the host
  Format: ip:hostPort:containerPort | ip::containerPort | hostPort:containerPort | containerPort
--link="" : Add link to another container (name:alias)
```

示例：

```bash
$ docker run -p 49880:80 ubuntu
$ docker run -P ubuntu  # 随机绑定到 49153-65535
```

查看端口映射：

```bash
$ docker port <containerid> 80
```

容器间链接：

```bash
$ sudo docker run -d --name redis-name dockerfiles/redis
$ sudo docker run --rm --link redis-name:redis_alias dockerfiles/redis env | grep REDIS
```

### 环境变量 (ENV)

```bash
HOME Set based on the value of USER
HOSTNAME The hostname associated with the container
PATH Includes popular directories, such as : /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
TERM xterm if the container is allocated a pseudo-TTY
```

设置环境变量：

```bash
$ sudo docker run -e "deep=purple" ubuntu env
declare -x HOME="/"
declare -x HOSTNAME="85bc26a0e200"
declare -x PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
declare -x deep="purple"
```

设置 hostname：

```bash
$ docker run -h myhost ubuntu
```

### 卷挂载 (VOLUME)

```bash
-v=[]: Create a bind mount with: [host-dir]:[container-dir]:[rw|ro]
--volumes-from="": Mount all volumes from the given container(s)
```

### 用户 (USER)

容器默认用户为 root。使用 `-u` 覆盖：

```bash
$ docker run -u username ubuntu
```

### 工作目录 (WORKDIR)

容器默认工作目录为 `/`。使用 `-w` 覆盖：

```bash
$ docker run -w /path/to/dir ubuntu
```
