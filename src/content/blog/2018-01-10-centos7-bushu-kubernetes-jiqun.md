---
title: Centos7部署Kubernetes集群
date: '2018-01-10'
description: 使用 Centos7.3、Docker、etcd、flannel 等组件部署 Kubernetes 集群的完整步骤记录，包括环境准备、Master 和 Node 配置、网络覆盖层安装。
category: container-virt
tags:
  - kubernetes
  - docker
  - systemd
  - iptables
  - selinux
draft: false
source: evernote-local-db
lang: zh
origin_url: https://www.cnblogs.com/zhenyuyaodidiao/p/6500830.html
---

## 环境准备

物理机操作系统：CentOS 7.3.1611 64 位

```bash
uname -a
# Linux localhost.localdomain 3.10.0-514.6.1.el7.x86_64 #1 SMP Wed Jan 18 13:06:36 UTC 2017 x86_64 x86_64 x86_64 GNU/Linux

cat /etc/redhat-release
# CentOS Linux release 7.3.1611 (Core)
```

三台机器配置（Master/etcd/registry + Node1 + Node2）：

| 节点及功能 | 主机名 | IP |
|---|---|---|
| Master、etcd、registry | K8s-master | 10.0.251.148 |
| Node1 | K8s-node-1 | 10.0.251.153 |
| Node2 | K8s-node-2 | 10.0.251.155 |

### 设置主机名

```bash
hostnamectl --static set-hostname k8s-master
hostnamectl --static set-hostname k8s-node-1
hostnamectl --static set-hostname k8s-node-2
```

### 设置 hosts

```bash
echo '10.0.251.148 k8s-master
10.0.251.148 etcd
10.0.251.148 registry
10.0.251.153 k8s-node-1
10.0.251.155 k8s-node-2' >> /etc/hosts
```

### 关闭防火墙

```bash
systemctl disable firewalld.service
systemctl stop firewalld.service
```

## 部署 etcd

```bash
yum install etcd -y
```

编辑 `/etc/etcd/etcd.conf`，修改以下配置：

```bash
ETCD_NAME=master
ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
ETCD_LISTEN_CLIENT_URLS="http://0.0.0.0:2379,http://0.0.0.0:4001"
ETCD_ADVERTISE_CLIENT_URLS="http://etcd:2379,http://etcd:4001"
```

启动并验证：

```bash
systemctl start etcd
etcdctl set testdir/testkey0 0
etcdctl get testdir/testkey0
# 0
etcdctl -C http://etcd:4001 cluster-health
# member 8e9e05c52164694d is healthy: got healthy result from http://0.0.0.0:2379
# cluster is healthy
```

## 部署 Master

### 安装 Docker

```bash
yum install docker -y
```

配置 Docker (`/etc/sysconfig/docker`)：

```bash
OPTIONS='--selinux-enabled --log-driver=journald --signature-verification=false'
# 允许从 registry 中拉取镜像
OPTIONS='--insecure-registry registry:5000'
```

启动 Docker：

```bash
chkconfig docker on
service docker start
```

### 安装 Kubernetes

```bash
yum install kubernetes -y
```

### 配置 Master 组件

修改 `/etc/kubernetes/apiserver`：

```bash
KUBE_API_ADDRESS="--insecure-bind-address=0.0.0.0"
KUBE_API_PORT="--port=8080"
KUBE_ETCD_SERVERS="--etcd-servers=http://etcd:2379"
KUBE_SERVICE_ADDRESSES="--service-cluster-ip-range=10.254.0.0/16"
KUBE_ADMISSION_CONTROL="--admission-control=NamespaceLifecycle,NamespaceExists,LimitRanger,SecurityContextDeny,ResourceQuota"
```

修改 `/etc/kubernetes/config`：

```bash
KUBE_LOGTOSTDERR="--logtostderr=true"
KUBE_LOG_LEVEL="--v=0"
KUBE_ALLOW_PRIV="--allow-privileged=false"
KUBE_MASTER="--master=http://k8s-master:8080"
```

启动 Master 服务：

```bash
systemctl enable kube-apiserver.service
systemctl start kube-apiserver.service
systemctl enable kube-controller-manager.service
systemctl start kube-controller-manager.service
systemctl enable kube-scheduler.service
systemctl start kube-scheduler.service
```

## 部署 Node

### 安装 Docker 和 Kubernetes

同 Master 步骤。

### 配置 Node 组件

修改 `/etc/kubernetes/config`（同 Master）。

修改 `/etc/kubernetes/kubelet`：

```bash
KUBELET_ADDRESS="--address=0.0.0.0"
KUBELET_HOSTNAME="--hostname-override=k8s-node-1"
KUBELET_API_SERVER="--api-servers=http://k8s-master:8080"
KUBELET_POD_INFRA_CONTAINER="--pod-infra-container-image=registry.access.redhat.com/rhel7/pod-infrastructure:latest"
```

启动 Node 服务：

```bash
systemctl enable kubelet.service
systemctl start kubelet.service
systemctl enable kube-proxy.service
systemctl start kube-proxy.service
```

### 查看集群状态

```bash
kubectl -s http://k8s-master:8080 get node
# NAME           STATUS    AGE
# k8s-node-1     Ready     3m
# k8s-node-2     Ready     16s
```

## 配置网络覆盖层 - Flannel

### 安装 Flannel

```bash
yum install flannel -y
# 版本：0.0.5
```

### 配置 Flannel

编辑 `/etc/sysconfig/flanneld`：

```bash
FLANNEL_ETCD_ENDPOINTS="http://etcd:2379"
FLANNEL_ETCD_PREFIX="/atomic.io/network"
```

### 配置 etcd 中的 Flannel key

```bash
etcdctl mk /atomic.io/network/config '{ "Network": "10.0.0.0/16" }'
# { "Network": "10.0.0.0/16" }
```

### 启动 Flannel 并重启其他服务

Master 上执行：

```bash
systemctl enable flanneld.service
systemctl start flanneld.service
service docker restart
systemctl restart kube-apiserver.service
systemctl restart kube-controller-manager.service
systemctl restart kube-scheduler.service
```

Node 上执行：

```bash
systemctl enable flanneld.service
systemctl start flanneld.service
service docker restart
systemctl restart kubelet.service
systemctl restart kube-proxy.service
```
