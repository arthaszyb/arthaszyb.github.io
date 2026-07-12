---
title: 每10秒执行一次脚本的crontab
date: '2014-01-17'
description: >-
  crontab -e \ \ \ \ \ /bin/date /tmp/date.txt \ \ \ \ \ sleep 10; /bin/date
  /tmp/date.txt \ \ \ \ \ sleep 20; /bin/date /tmp/date.txt \ \ \ \ \ sleep 30;
category: linux
tags:
  - crontab
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
