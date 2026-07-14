---
title: 每 10 秒执行一次脚本的 crontab
date: '2014-01-17'
description: 在 crontab 中使用 sleep 实现每 10 秒执行一次任务的方法
category: linux
tags:
  - crontab
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---
crontab -e

\* \* \* \* \* /bin/date >>/tmp/date.txt

\* \* \* \* \* sleep 10; /bin/date >>/tmp/date.txt

\* \* \* \* \* sleep 20; /bin/date >>/tmp/date.txt

\* \* \* \* \* sleep 30; /bin/date >>/tmp/date.txt

\* \* \* \* \* sleep 40; /bin/date >>/tmp/date.txt

\* \* \* \* \* sleep 50; /bin/date >>/tmp/date.txt
