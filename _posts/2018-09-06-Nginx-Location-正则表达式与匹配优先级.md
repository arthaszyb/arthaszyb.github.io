---
title: "Nginx Location 正则表达式与匹配优先级"
date: 2018-09-06 08:41:49 +0000
categories: ["Nginx [2]"]
tags: []
description: "Leebor 关注 2017.10.12 16:39* 字数 258 阅读 1444 评论 0 喜欢 0 部分内容摘抄自 Nginx官网 Syntax: location [ = | ~ | ~* | ^~ ] uri { ... } location @name { ... } Default: — Context:"
source: "evernote-local-db"
---

Nginx Location 正则表达式与匹配优先级

Leebor

关注
2017.10.12 16:39*

字数 258

阅读 1444
评论 0
喜欢 0
部分内容摘抄自

Nginx官网
Syntax:
location [ = | ~ | ~* | ^~ ] uri { ... }
location
@name { ... }
Default:
—
Context:

server, location
location正则表达式书写示例：
1. 等号（=）
表示完全匹配规则才执行操作
location = /index {
[ configuration A ]
}
URL为

http://{domain_name}/index

时，才会执行配置中操作。
2. 波浪号（~）
表示执行正则匹配，但区分大小写
location ~

/page/
\d{
1
,
2
} {
[ configuration B ]
}
URL 为

http://{domain_name}/page/1

匹配结尾数字为1-99时，配置生效。
3.波浪号与星号（~*）
表示执行正则匹配，但
不

区分大小写
location ~* /\.(jpg|jpeg|gif) {
[ configuration C ]
}
匹配所有url以
jpg、jpeg、gif
结尾时，配置生效。
4.脱字符与波浪号（^~）
表示普通字符匹配，前缀匹配有效，配置生效
location ^~ /images/ {
[ cofigurations D ]
}
URL 为

http://{domain_name}/images/1.gif

时，配置生效。
5.@
定义一个location，用于处理内部重定向
location

@error

{
proxy_pass http:
//error;
}
error_page

404

@error
;
各字符有效优先级
=
>
^~
>
~/~*
当
(~/~*)
中有多个正则匹配时，选择正则表达式最长的配置执行。
#######################################################################################################################
#yau触发事件
配置301yy到另一个域名上时，发现html能正常转发，但是css和js等静态文件均404错误。最后发现原因是我配置的301yy的location是这样的
location /301yy/ {
proxy_pass
http:/
ode_haici/;
静态文件根据匹配优先级走到了最后面的location上去了，因为~*优先级大于“ ”。所以加上^~后301yy的优先级就高于~*的了，就一并转发走了，解决问题。
所以后面在配置nginx时要注意好匹配优先级。
