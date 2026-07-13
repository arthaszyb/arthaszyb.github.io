---
title: 使用zsh替换bash
date: '2016-07-22'
description: '安装和配置 zsh shell，修改用户默认登录 shell。'
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
## 安装 zsh

```bash
yum install zsh
```

## 修改默认 shell

### 列出所有已安装的 shell

```bash
chsh -l
```

### 设置默认 shell

```bash
chsh -s /full-path-to-shell
```

其中 `/full-path-to-shell` 是 `chsh -l` 输出的完整路径。

设置后，下次登录时会使用新的 shell。
