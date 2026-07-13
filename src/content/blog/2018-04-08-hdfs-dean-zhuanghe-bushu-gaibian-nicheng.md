---
title: HDFS 的安装和部署
date: '2018-04-08'
description: HDFS 集群部署完整步骤。包括环境准备、JDK 和 Hadoop 安装、SSH 信任配置、HDFS 配置文件编辑、格式化与启动流程。
category: monitoring
tags:
  - hadoop
  - ssh
draft: false
source: evernote-local-db
lang: zh
origin_url: https://blog.51cto.com/
---

## 准备工作

**机器规划**：
- Master：1 台（Namenode），如 cc-staging-session2
- Slave：2 台（DataNode），如 cc-staging-front、cc-staging-imcenter

**所有机器操作**：

创建 hadoop 用户：

```bash
useradd hadoop
passwd hadoop
```

安装 JDK，配置环境变量：

```bash
tar zxvf jdk-7u21-linux-x64.gz -C /usr/local/
```

编辑 `/etc/profile`，增加：

```bash
export JAVA_HOME=/usr/local/jdk1.7.0_21/
export JRE_HOME=/usr/local/jdk1.7.0_21/jre
export CLASSPATH=.:$JAVA_HOME/lib/tools.jar:$JAVA_HOME/lib/dt.jar
```

## 安装 Hadoop

下载 Hadoop：

```bash
wget http://archive.cloudera.com/cdh/3/hadoop-0.20.2-cdh3u6.tar.gz
wget http://archive.cloudera.com/cdh/3/hbase-0.90.6-cdh3u6.tar.gz
wget http://archive.cloudera.com/cdh/3/hive-0.7.1-cdh3u6.tar.gz
```

在 3 台机器上创建目录（name 目录仅在 master 上，权限 755）：

```bash
mkdir -p /hadoop/{install,name,data1,data2,tmp}
```

解压安装包：

```bash
tar zxvf hadoop-0.20.2-cdh3u6.tar.gz -C /hadoop/install/
chown -R hadoop.hadoop /hadoop
```

## SSH 信任配置

在 master 机器上（以 hadoop 用户）：

```bash
su - hadoop
ssh-keygen
ssh-copy-id -i .ssh/id_rsa.pub hadoop@cc-staging-front
ssh-copy-id -i .ssh/id_rsa.pub hadoop@cc-staging-imcenter
ssh-copy-id -i .ssh/id_rsa.pub hadoop@cc-staging-session2
```

测试 SSH 连接：

```bash
ssh hadoop@master
ssh hadoop@slave1
ssh hadoop@slave2
```

## 配置 HDFS

编辑 `$HADOOP_HOME/conf` 下的配置文件（所有节点保持一致）。

**core-site.xml**：

```xml
<property>
  <name>fs.default.name</name>
  <value>hdfs://master:9000</value>
</property>
```

**hdfs-site.xml**：

```xml
<property>
  <name>dfs.replication</name>
  <value>2</value>
</property>
<property>
  <name>dfs.name.dir</name>
  <value>/hadoop/name</value>
</property>
<property>
  <name>dfs.data.dir</name>
  <value>/hadoop/data1,/hadoop/data2</value>
</property>
<property>
  <name>dfs.datanode.ipc.address</name>
  <value>0.0.0.0:50020</value>
</property>
```

**mapred-site.xml**：

```xml
<property>
  <name>mapred.job.queue.name</name>
  <value>default</value>
</property>
```

## 格式化与启动

在 master 上初始化 HDFS（首次部署）：

```bash
$HADOOP_HOME/bin/hadoop namenode -format
```

启动 HDFS：

```bash
$HADOOP_HOME/bin/start-dfs.sh
$HADOOP_HOME/bin/start-mapred.sh
```

验证进程：

```bash
jps
```

查看 Web 界面：
- Namenode：http://master:50070
- JobTracker：http://master:50030
