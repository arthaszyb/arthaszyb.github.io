---
title: 检查网段内的 IP 占用情况
date: '2014-02-10'
description: "Bash 脚本：扫描指定网段（如 192.168.9.0/24），通过 ping 测试检查每个 IP 的在线情况，找出不在线的 IP。"
category: shell
tags:
  - shell-scripting
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---

扫描网段内所有 IP 的在线状态，找出不在线的 IP：

```bash
#!/bin/bash
for i in $(seq 1 255);
do ping 192.168.9.$i -c 1 -w 2 >/dev/null 2>&1;
if [ $? != 0 ]; then
  echo "$i is not online";
fi;
done;
```

脚本说明：
- `seq 1 255`：生成 1 到 255 的序列
- `ping ... -c 1 -w 2`：向每个 IP 发送 1 个 ICMP 包，超时 2 秒
- `>/dev/null 2>&1`：重定向输出到 /dev/null（不显示 ping 结果）
- `if [ $? != 0 ]`：若 ping 失败（返回码非 0），输出该 IP 不在线

适用于快速扫描局域网内的 IP 占用情况。
