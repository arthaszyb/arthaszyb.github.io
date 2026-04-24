---
title: "Nginx打开目录浏览功能(autoindex)"
date: 2013-10-08 09:03:19 +0000
categories: ["web"]
tags: []
description: "Nginx默认是不允许列出整个目录的。如需此功能， 打开nginx.conf文件，在location server 或 http段中加入 autoindex on; 另外两个参数最好也加上去: autoindex_exact_size off; 默认为on，显示出文件的确切大小，单位是bytes。 改为off后，显示出"
source: "evernote-local-db"
---

Nginx默认是不允许列出整个目录的。如需此功能，
打开nginx.conf文件，在location server 或 http段中加入
autoindex on;
另外两个参数最好也加上去:
autoindex_exact_size off;
默认为on，显示出文件的确切大小，单位是bytes。
改为off后，显示出文件的大概大小，单位是kB或者MB或者GB
autoindex_localtime on;
默认为off，显示的文件时间为GMT时间。
改为on后，显示的文件时间为文件的服务器时间
location /images {
root /var/www
ginx-default/ibugaocn;
autoindex on;
}
详细参照:http://wiki.nginx.org/NginxChsHttpAutoindexModule
