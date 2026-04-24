---
title: "【Nginx】location下的alias与root的用法"
date: 2018-11-06 10:03:41 +0000
categories: ["web"]
tags: []
description: "2018年03月06日 16:05:52 _jayzhen_ 阅读数：161 标签： nginx conf 更多 个人分类： linux nginx 版权声明：本文为博主原创文章，未经博主允许不得转载。 https://blog.csdn.net/u013948858/article/details/79459455 "
source: "evernote-local-db"
---

【Nginx】location下的alias与root的用法
2018年03月06日 16:05:52

_jayzhen_

阅读数：161

标签：

nginx
conf

更多
个人分类：

linux
nginx
版权声明：本文为博主原创文章，未经博主允许不得转载。
https://blog.csdn.net/u013948858/article/details/79459455
yau： 本问题是我在配置一个location需要与/的root不同时出现的，如果子location的目录仍然用root的话，在访问时后端会将该url的path添加到其目录后，导致404.
改为alias后就好了
官网有教程（官网不会看，多喝六个核桃）
alias:
http:/
ginx.org/en/docs/http
gx_http_core_module.html#alias
root:
http:/
ginx.org/en/docs/http
gx_http_core_module.html#root
nginx指定文件路径有两种方式root和alias，root与alias主要区别在于nginx如何解释location后面的uri，这会使两者分别以不同的方式将请求映射到服务器文件上,说白了就是两者拼接文件路径的手段不一样。
root的用法
句法： root path;
默认： root html;
语境： http，server，location，if in location
示例：
location ^~ /request_path/dirt/ {
root /local_path/dirt/;
}
当客户端请求

/request_path/image/
f
ile.ext的时候，Nginx把请求解析映射为
/local_path/dirt/
request_path/dirt/
file.ext
alias的用法
句法： alias path;
默认： -
语境： location
示例：
location /request_path/dirt/ {
alias /local_path/dirt/file/;
}
当客户端请求
/request_path/dirt/
file.ext 的时候，Nginx把请求映射为
/local_path/dirt/file/
file.ext
注意这里是file目录，因为alias会把location后面配置的路径丢弃掉（比如/request_path/dirt/one.html,到alias那里就剩one.html了），把当前匹配到的目录指向到指定的目录。
其他：
1. 使用alias时，目录名后面一定要加"/"，不然会认为是个文件。
2. alias在使用正则匹配时，location后uri中捕捉到要匹配的内容后，并在指定的alias规则内容处使用。
location ~ ^/users/(.+\.(?:gif|jpe?g|png))$ {
alias /data/w3/images/$1;
}
3. alias只能位于location块中，而root的权限不限于location。
总结：
只能说遇到问题，不是谁都能解决，但是没有解决不了的问题。
