---
title: "shadowsocksR手工安装步骤（debian9）"
date: 2019-03-04 07:15:48 +0000
categories: ["科学上网"]
tags: []
description: "方法一：物理机安装 下载ssR服务端wget https://github.com/maxsky/shadowsocksr-manyuser/archive/master.zip ，注意这里可能因各种原因404，需要找到合适可用的源即可 解压，进去，可以看README.md即可知道整个步骤了，这里简单说一下： 2.1."
source: "evernote-local-db"
---

shadowsocksR手工安装步骤（debian9）
方法一：物理机安装
下载ssR服务端wget
https://github.com/maxsky/shadowsocksr-manyuser/archive/master.zip
，注意这里可能因各种原因404，需要找到合适可用的源即可
解压，进去，可以看README.md即可知道整个步骤了，这里简单说一下：
2.1. 现在ssR主目录执行bash initcfg.sh
2.2. vi user-config.json，编辑服务端配置，然后cp到下层的shadowsocks目录中
2.3. 在shadowsocks目录中执行./logrun.sh启动服务，通过sserverlog看执行状态。此时一般是执行失败，提示“OSError: libsodium.so.23: cannot open shared object file”，这是由于选择了chacha20等加密算法，需要的依赖。
2.4. 安装依赖：apt install libsodium-dev。再启动服务成功。如果系统不是debian9或以上，可能需要另外做了。
安装ssr，提升网络质量
本来有个工具：
https://github.com/Sherlockwoo/shadowsocksR_1nstall
实际下载执行后会提示下载ssr服务端404，实际就是该源失效了。为了不去麻烦改ssr.sh脚本中各处变量，就用上面的手工方法去安装了。
另一篇笔记中的地址也都失效了，zf牛逼
附：
user-config.json
{
"server": "0.0.0.0",
"server_ipv6": "::",
"server_port":29650,
"local_address": "127.0.0.1",
"local_port": 1080,
"password": "Zy321100",
"method": "chacha20-ietf",
"protocol": "auth_sha1_v4",
"protocol_param": "",
"obfs": "plain",
"obfs_param": "",
"speed_limit_per_con": 0,
"speed_limit_per_user": 0,
"additional_ports" : {}, // only works under multi-user mode
"additional_ports_only" : false, // only works under multi-user mode
"timeout": 120,
"udp_timeout": 60,
"dns_ipv6": false,
"connect_verbose_info": 0,
"redirect": "",
"fast_open": false
}
方法二：容器安装
发现git上各个源都404后，居然都跑到dockerhub上了。容器化安装非常方便。找一个star最多的：
https://hub.docker.com/r/breakwa11/shadowsocksr
上面的说明都是之前git上的readme，具体容器安装方法以及配置都没写。只能从dockerfile上找了。发现其ss配置都在ENV中，且有默认值。那么我们想自定义配置就只能在启动命令中用-e key:value或者--env-file xxx.ini来做了
docker pull breakwa11/shadowsocksr
docker run -d -P breakwa11/shadowsocksr完成启动。
通过dockerfile中的默认值配置客户端即完成连接。
附：
dockerfile
FROM alpine:3.6
ENV SERVER_ADDR 0.0.0.0
ENV SERVER_PORT 51348
ENV PASSWORD psw ENV METHOD aes-128-ctr
ENV PROTOCOL auth_aes128_md5
ENV PROTOCOLPARAM 32
ENV OBFS tls1.2_ticket_auth_compatible
ENV TIMEOUT 300
ENV DNS_ADDR 8.8.8.8
ENV DNS_ADDR_2 8.8.4.4
ARG BRANCH=manyuser
ARG WORK=~
RUN apk --no-cache add python \
libsodium \
wget
RUN mkdir -p $WORK
&
&

\ wget -qO- --no-check-certificate https://github.com/shadowsocksr/shadowsocksr/archive/$BRANCH.tar.gz | tar -xzf - -C $WORK
WORKDIR $WORK/shadowsocksr-$BRANCH/shadowsocks
EXPOSE $SERVER_PORT
CMD python server.py -p $SERVER_PORT -k $PASSWORD -m $METHOD -O $PROTOCOL -o $OBFS -G $PROTOCOLPARAM
