---
title: BBR 拥塞控制算法实测
date: '2017-12-28'
description: 在 Google Cloud 上升级内核启用 BBR 算法，对比测试下载速度提升，记录遇到的坑和解决方案。
category: network
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
origin_url: https://flyfish.im/studynotes/1335.html
---

BBR 算法优化作用仅限于数据发送方。需要在下载时给目的服务器启用，上传时在本机启用。

下载速度对比（约提升4~5倍）。

坑1：升级内核后，会导致gce页面通过sshkey方式ssh登录失效，提示：如果刚好这个机器你刚生成，此时你是不知道用户密码的，那就没有办法了。

解决方法：机器生成后升级前，进系统 `passwd` 修改root密码，然后再去升级。这样登陆不了了你可以走公网ssh密码登录。

原因：需要去读bbr.sh，了解升级逻辑，看是不是版本匹配问题。

坑2：ssh密码登录进去后，你会发现你的整个/目录变成readonly了。

方法1：此时有个简单解决方法：

```bash
mount -o remount rw /
```

改好之后页面登录仍然不可用，说明不是因为readonly导致sshkey失效。还需要再去检查一下sshkey。

方法2：尝试fsck修复，然而并没有什么软用。好像也没有vnc进救援模式，只好用以前的快照重新做了一个实例，然后重新升级内核。

在reboot之前，编辑 `/etc/fstab`，将：

```text
UUID=xxxxxxxxxxxxxxxxxxxxxx / xfs defaults，barrier 1 1 1
```

改为：

```text
UUID=xxxxxxxxxxxxxxxxxxxxxx / xfs defaults 1 1
```

把barrier参数删除，这样才能够成功升级内核。
