---
title: 使用telnet探测php端口
date: '2015-09-25'
description: 一个 Shell 脚本，通过 telnet 定期探测 php-fpm 服务状态，当服务不可用时自动重启。
category: php
tags:
  - php
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---

这个脚本每 15 秒通过 telnet 探测 php-fpm 服务是否可用，若不可用则自动重启。

```bash
#!/bin/bash

#telnet应用在sh脚本中
#check php-fpm server up/down

TelLog=/tmp/telphp.log

while :
do
  sleep 15
  /usr/bin/telnet 127.0.0.1 9000 << EOF > $TelLog
quit
EOF

  SOK=`cat $TelLog | grep "Escape character" | wc -l`

  if [ $SOK -eq 1 ]; then
    echo "php-fpm is ok"
  else
    /usr/local/webserver/php/sbin/php-fpm restart
  fi
done
```

脚本通过检查 telnet 输出中的 "Escape character" 字符串来判断连接是否成功，成功时计数为 1，否则触发重启。
