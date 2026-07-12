---
title: 使用telnet探测php端口
date: '2015-09-25'
description: >-
  #!/bin/bash #telnet应用在sh脚本中 #check php-fpm server up/down
  TelLog=/tmp/telphp.log while : do sleep 15; /usr/bin/telnet 127.0.0.1 9000 <<
  EOF $TelLog quit EOF
category: php
tags:
  - php
draft: false
source: evernote-local-db
lang: zh
---
#!/bin/bash

#telnet应用在sh脚本中

#check php-fpm server up/down

TelLog=/tmp/telphp.log

while :

do

sleep 15;

/usr/bin/telnet 127.0.0.1 9000 << EOF > $TelLog

quit

EOF

SOK=\`cat $TelLog | grep "Escape character" |wc -l\`

if \[ $SOK -eq 1 \];then

echo "php-fpm is ok"

else

/usr/local/webserver/php/sbin/php-fpm restart

fi

done
