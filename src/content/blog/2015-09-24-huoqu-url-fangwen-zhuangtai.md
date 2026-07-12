---
title: 获取url访问状态
date: '2015-09-24'
description: >-
  检查url访问状态,如下命令可直接跳过302跳转获取到最终访问状态 curl -I -s --retry 1 -m 3 -L $url -o
  /dev/null -w '%{http\code}'
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
检查url访问状态,如下命令可直接跳过302跳转获取到最终访问状态

curl -I -s --retry 1 -m 3 -L $url -o /dev/null -w '%{http\_code}'
