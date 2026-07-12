---
title: PS1的设置
date: '2014-06-04'
description: >-
  export
  PS1="\\\[\\e\[31;1m\\\]\hostname\\\\\[\\e\[31;1m\\\]\\u\\\[\\e\[0m\\\]@\\\[\\e\[32;1m\\\]\/sbin/ifconfig
  em1|grep "inet addr:"|cut -d: -f 2|cut -d" "
category: linux
tags: []
draft: false
source: evernote-local-db
lang: zh
---
export PS1="\\\[\\e\[31;1m\\\]\`hostname\`\_\\\[\\e\[31;1m\\\]\\u\\\[\\e\[0m\\\]@\\\[\\e\[32;1m\\\]\`/sbin/ifconfig em1|grep "inet addr:"|cut -d: -f 2|cut -d" " -f1\`\\\[\\e\[0m\\\]:\\\[\\e\[35;1m\\\]\\w\\\[\\e\[0m\\\]\\\\$ " >>/etc/profile
