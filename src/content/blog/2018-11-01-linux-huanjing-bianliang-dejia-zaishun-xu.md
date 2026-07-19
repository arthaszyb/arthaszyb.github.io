---
title: Linux 环境变量的加载顺序和优先级
date: '2018-11-01'
description: "使用 export 设置环境变量时，前面定义的变量会覆盖后面定义的同名变量。PATH 等变量的顺序直接影响命令查找和优先级。"
category: linux
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

当使用 export 设置环境变量的时候，注意前面的环境变量会覆盖后面设置的环境变量。

例如：

```bash
export JAVA_HOME/usr/java1.7
export PATH=$PATH:$JAVA_HOME/bin
```

当在 /etc/profile 中设置这 2 个选项的时候，如果 PATH 中已经包含了 java 的运行时环境，那么此设置会失败。

要想使自定义设置生效，最好将自定义的 path 设置在前面，如下：

```bash
export JAVA_HOME/usr/java1.7
export PATH=$JAVA_HOME/bin:$PATH
```

### 附：linux 系统文件的执行顺序

在刚登录 Linux 时，首先启动 /etc/profile 文件，然后再启动用户目录下的 `~/.bash_profile`、`~/.bash_login` 或 `~/.profile` 文件中的其中一个，执行的顺序为：`~/.bash_profile`、`~/.bash_login`、`~/.profile`。如果 `~/.bash_profile` 文件存在的话，一般还会执行 `~/.bashrc` 文件。因为在 `~/.bash_profile` 文件中一般会有下面的代码：

```bash
if [ -f ~/.bashrc ] ; then
. ./bashrc
fi
```

`~/.bashrc` 中，一般还会有以下代码：

```bash
if [ -f /etc/bashrc ] ; then
. /bashrc
fi
```

所以，`~/.bashrc` 会调用 /etc/bashrc 文件。最后，在退出 shell 时，还会执行 `~/.bash_logout` 文件。

执行顺序为：`/etc/profile` → (`~/.bash_profile` | `~/.bash_login` | `~/.profile`) → `~/.bashrc` → `/etc/bashrc` → `~/.bash_logout`
