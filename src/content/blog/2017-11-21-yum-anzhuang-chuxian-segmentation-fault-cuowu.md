---
title: yum安装出现Segmentation fault错误解决方法
date: '2017-11-21'
description: '解决 yum 报 Segmentation fault 错误，需要重建 RPM 数据库而非更新 libz 库。'
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
origin_url: https://serverfault.com/questions/256385/yum-segmentation-fault-in-centos
---
yum 安装时出现 Segmentation fault 错误。网上多数解决方案说是 libz 库版本问题，但这是错的。

## 解决方法

重建 RPM 数据库：

```bash
rm -rf /var/lib/rpm/__db.*
rpm --rebuilddb
yum clean all
yum makecache
```

执行后重新尝试 yum 操作。
