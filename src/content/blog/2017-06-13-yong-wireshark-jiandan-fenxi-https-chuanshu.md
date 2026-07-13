---
title: '用 Wireshark 分析 HTTPS 传输过程'
date: '2017-06-13'
description: >-
  通过 Wireshark 抓包观察 HTTPS（TLS）完整握手过程：TLS Hello → 证书交换 → 服务端 SYN → 对称密钥加密 → 数据交互；展示协议栈如何从公钥加密协商切换到对称密钥加密。
category: network
tags:
  - ssl-tls
  - 网络排查
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.freebuf.com/articles/system/37900.html
---
## 实验环境

- 操作系统：Kali linux 1.06 64位
- 软件：Wireshark
- 实验目的：查看 HTTPS 的协议传输过程
一、打开软件，
二、打开后，选择菜单下的edit的Prefenrces，选择protocols下的ssl（因为我们要观测的是https的传输过程），点击开始：
三、开始监听https传输数据：
因为我在放歌，所以看见数据传输很快哦，眨眼之间数据就跳走了：
回到正题，进入https站点，开始实践：
四、查看协议传输过程，（PS：Https=http+ssl）
1、 看见TLSv1了么？
第一个就是蓝色就是我们PC电脑端向服务器发送HELLO ，即浏览器向服务器请求一个安全的网页。
然后双击这个HELLO看下传输的内容：
2、服务器就把它的证书和公匙发回来，同时向服务端发送ACK报文以便服务端确认数据是否无误。
3、服务端发送一句：“你好”，这是服务端知道那个请求是你发送的（同时它也会发送ACK报文确认发给你数据是否无误），同时浏览器会检查证书是不是由可以信赖的机构颁发的，确认证书有效和此证书是此网站的。
4、浏览器使用公钥加密了一个随机对称密钥，包括加密的URL一起发送到服务器
然后就是浏览器与服务器的交互过程：
1、服务器用自己的私匙解密了你发送的钥匙。然后用这把对称加密的钥匙给你请求的URL链接解密。
2、服务器用你发的对称钥匙给你请求的网页加密。你也有相同的钥匙就可以解密发回来的网页了。
