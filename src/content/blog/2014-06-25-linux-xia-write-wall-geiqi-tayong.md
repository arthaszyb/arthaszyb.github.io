---
title: linux 下 write/wall 给其他用户发送即时消息
date: '2014-06-25'
description: Linux 终端内置的 write/wall 命令可实现同机用户之间的即时消息通讯；不支持中文，可禁用 mesg 防止消息打断编辑。
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
origin_url: http://verycto.blog.51cto.com/904981/394337
lang: zh
---

## write 命令：单向发送消息

查看当前登录用户和终端：

```bash
who
```

向特定用户的特定终端发送消息：

```bash
write <username> <tty/pts>
```

例如，发送给 pts/4 终端的 heylin 用户：

```bash
write heylin pts/4
# 输入消息后按 Ctrl+C 结束
hello, msg from xiaoji
```

说明：
- write 执行后可接收别人的消息，也可继续发消息
- 但如果一开始是别人先发送给你，则必须再打开一个终端才能发消息
- 不支持中文

## wall 命令：广播消息

`wall`（write all）命令广播消息给所有登录用户。旧版格式 `wall [message]` 已过时，新版需要通过管道或 here string/here document：

```bash
echo "hello,This is a message" | wall
```

或

```bash
wall <<<"11111111111"
```

输出示例：

```
Broadcast Message from hadoop@clone1
(/dev/pts/2) at 4:46 ...
11111111111
```

## 常用相关命令

查看当前所有登录用户及其终端：

```bash
finger
w
```

查看自己使用的终端：

```bash
tty
```

禁止别人把消息显示在我的终端：

```bash
mesg n
```

允许别人把消息显示在我的终端：

```bash
mesg y
```

## 注意

Linux 的终端消息有趣但有风险：如果正在编辑文件，消息会直接插入到文件内容中。慎用。

## 参考

- http://verycto.blog.51cto.com/904981/394337
- http://blog.donews.com/vanfan/archive/2011/12/20/1579866.aspx
