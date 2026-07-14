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

当使用export设置环境变量的时候，注意前面的环境变量会覆盖后面设置的环境变量。

例如：

<table><colgroup><col><col></colgroup><tbody><tr><td><div style="margin: 0px; padding: 0px 20px 0px 0px; border: none; outline: 0px; font-weight: inherit; font-style: inherit; font-family: "Source Code Pro", Consolas, Monaco, Menlo, Consolas, monospace; font-size: 0.85em; vertical-align: baseline; line-height: 22.4px; overflow: auto; color: rgb(102, 102, 102); text-shadow: rgb(68, 68, 68) 0px 1px; background: rgb(77, 77, 77); text-align: right;"><div><span>1</span></div><div><span>2</span></div></div></td><td><div style="margin: 0px; padding: 0px; border: none; outline: 0px; font-weight: inherit; font-style: inherit; font-family: "Source Code Pro", Consolas, Monaco, Menlo, Consolas, monospace; font-size: 10px; vertical-align: baseline; line-height: 22.4px; overflow: auto; color: rgb(238, 248, 252); text-shadow: rgb(68, 68, 68) 0px 1px; background: rgb(77, 77, 77);"><div><span>export JAVA_HOME/usr/java1.</span><span>7</span></div><div><span>export PATH=</span><span>$PATH</span><span>:</span><span>$JAVA</span><span>_HOME/bin</span></div></div></td></tr></tbody></table>

当在/etc/profile中设置这2个选项的时候，如果PATH中已经包含了java的运行时环境，那么此设置会失败。

要想使自定义设置生效，最好将自定义的path设置在前面，如下：

<table><colgroup><col><col></colgroup><tbody><tr><td><div style="margin: 0px; padding: 0px 20px 0px 0px; border: none; outline: 0px; font-weight: inherit; font-style: inherit; font-family: "Source Code Pro", Consolas, Monaco, Menlo, Consolas, monospace; font-size: 0.85em; vertical-align: baseline; line-height: 22.4px; overflow: auto; color: rgb(102, 102, 102); text-shadow: rgb(68, 68, 68) 0px 1px; background: rgb(77, 77, 77); text-align: right;"><div><span>1</span></div><div><span>2</span></div></div></td><td><div style="margin: 0px; padding: 0px; border: none; outline: 0px; font-weight: inherit; font-style: inherit; font-family: "Source Code Pro", Consolas, Monaco, Menlo, Consolas, monospace; font-size: 10px; vertical-align: baseline; line-height: 22.4px; overflow: auto; color: rgb(238, 248, 252); text-shadow: rgb(68, 68, 68) 0px 1px; background: rgb(77, 77, 77);"><div><span>export JAVA_HOME/usr/java1.</span><span>7</span></div><div><span>export PATH=</span><span>$JAVA</span><span>_HOME/bin:</span><span>$PATH</span></div></div></td></tr></tbody></table>

### 附：linux系统文件的执行顺序

在刚登录Linux时，首先启动 /etc/profile 文件，然后再启动用户目录下的 ~/.bash\_profile、 ~/.bash\_login或 ~/.profile文件中的其中一个，执行的顺序为：~/.bash\_profile、 ~/.bash\_login、 ~/.profile。如果 ~/.bash\_profile文件存在的话，一般还会执行 ~/.bashrc文件。因为在 ~/.bash\_profile文件中一般会有下面的代码：

if \[ \-f ~/.bashrc \] ; then

. ./bashrc

fi

~/.bashrc中，一般还会有以下代码：

if \[ \-f /etc/bashrc \] ; then

. /bashrc

fi

所以，~/.bashrc会调用 /etc/bashrc文件。最后，在退出shell时，还会执行 ~/.bash\_logout文件。

执行顺序为：/etc/profile -> (~/.bash\_profile | ~/.bash\_login | ~/.profile) -> ~/.bashrc -> /etc/bashrc -> ~/.bash\_logout
