---
title: nagios难忘的错误
date: '2013-08-07'
description: >-
  配置好各个objects文件和nagios.conf后检查语法，一直报错，提示每个配置文件都有问题，最后终于发现问题所在：time设置中有个7x24,我在其他配置文件中调用该参数时都写成了724，故无法调用该参数。
category: monitoring
tags:
  - nagios
draft: false
source: evernote-local-db
lang: zh
---
配置好各个objects文件和nagios.conf后检查语法，一直报错，提示每个配置文件都有问题，最后终于发现问题所在：time设置中有个7x24,我在其他配置文件中调用该参数时都写成了7*24，故无法调用该参数。于是为求简单直接将time中的这个参数改为7*24，还是报错，提示为有不合规范的字符，于是将7*24改为everytime并将其他文件也修改一致后即可
