---
title: 内网环境如何检查证书链的完整性
date: '2020-06-23'
description: >-
  在内网环境中如何检查 SSL 证书链的完整性。通过 openssl 命令查看证书链级次，理解中间证书的作用和缺失的影响。
category: web-infra
tags:
  - nginx
  - apache
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
---
一个正确配置的 HTTPS 网站应该在证书中包含完整的证书链。可以通过 `openssl s_client -connect x.x.x.x:443` 命令来查看自己的网站配置。
其余内容可以无视，只看 `Certificate chain` 这一段：
---
Certificate chain
0s:/1.3.6.1.4.1.311.60.2.1.3=CN/1.3.6.1.4.1.311.60.2.1.2=Guangdong/1.3.6.1.4.1.311.60.2.1.1=Shenzhen/businessCategory=PrivateOrganization/serialNumber=440301103308619/C=CN/ST=\xE5\xB9\xBF\xE4\xB8\x9C\xE7\x9C\x81/L=\xE6\xB7\xB1\xE5\x9C\xB3\xE5\xB8\x82/postalCode=518067/street=\xE6\xB7\xB1\xE5\x9C\xB3\xE5\xB8\x82\xE5\x8D\x97\xE5\xB1\xB1\xE5\x8C\xBA\xE5\x8D\x97\xE6\xB5\xB7\xE5\xA4\xA7\xE9\x81\x931057\xE5\x8F\xB7\xE7\xA7\x91\xE6\x8A\x80\xE5\xA4\xA7\xE5\x8E\xA6\xE4\xBA\x8C\xE6\x9C\x9FA\xE6\xA0\x8B502#/O=WoSign\xE6\xB2\x83\xE9\x80\x9A\xE7\x94\xB5\xE5\xAD\x90\xE8\xAE\xA4\xE8\xAF\x81\xE6\x9C\x8D\xE5\x8A\xA1\xE6\x9C\x89\xE9\x99\x90\xE5\x85\xAC\xE5\x8F\xB8/CN=
www.wosign.com
i:/C=CN/O=WoSign CALimited/CN=WoSign Class 4 EV Server CA
1 s:/C=CN/O=WoSign CA Limited/CN=WoSignClass 4 EV Server CA
i:/C=CN/O=WoSign CALimited/CN=Certification Authority ofWoSign
2 s:/C=CN/O=WoSign CALimited/CN=Certification Authority of WoSign
i:/C=IL/O=StartComLtd./OU=Secure Digital CertificateSigning/CN=StartComCertification Authority
---
其中 0、1、2 是证书链中每一级证书的序号。0 是要被验证的网站所用的证书，其 CN 应该对应网站域名。

每一个序号后面，`s` 开头的一行是指证书，`i` 开头的一行是指此证书由谁签发。

- 0 的 CN 包含一个疑似中文域名加一个英文域名 `www.wosign.com`。它的签发者是 `WoSign CA Limited/CN=WoSign Class 4 EV Server CA`。
- 1 的证书就是 0 的签发者。而 1 自己又是由另一个证书 `Certification Authority of WoSign` 签发的。
- 再看下一级 2。它说 `Certification Authority of WoSign` 是由 `StartCom` 签发的。

所以这么一级级看下来，浏览器说，哦，2 的签发者我认识啊，安装包里有提到 `StartCom` 嘛。签名正确、验证无误，所以信任 2。那么也应该信任 2 签发的 1、1 签发的 0。所以这个网站可以信任。
## 不完整的证书链

然而，如果网站配置时，在 crt 文件中只包含了自己，而没包含一个完整到可以被浏览器内置数据验证的证书链，就有可能被浏览器拒绝。比如：

```bash
openssl s_client -connect touko.moe:443
```
---
Certificate chain
0 s:/CN=touko.moe
i:/C=CN/O=WoSign CA Limited/CN=WoSign CA Free SSL Certificate G2
---

只有 0 一组。说明 `s` 行中的 `touko.moe` 由 `i` 行中的 `WoSign CA Free SSL Certificate G2` 签发。没了。

这就是此坑最神奇之处：浏览器此时是否验证失败，是不一定的。有两种情况：

**A. 浏览器自安装以来，从未见过这个中间证书**
那么验证会失败。

**B. 浏览器以前见过、并且验证过这个中间证书**
那么验证会成功。

通常管理员自己会去证书发行商的 https 网站买证书，浏览器就会验证，然后将验证成功的中间证书全都缓存下来，为以后节省时间。当管理员（错误地）配置完自己的网站，去浏览测试的时候，完全不会遇到问题。因为他的浏览器已经认识这个中间证书了。
## 工具

[https://csr.chinassl.net/](https://csr.chinassl.net/) - 可以申请免费证书和检测外网证书链的完整性

## 在 Nginx 中配置证书链

一般 Windows 下的浏览器会自动帮你下载中间证书，但在移动端或其他终端则不一定。因此部署证书最好把中间证书都补上，特别是私网环境是必须的。

**Apache 配置：**
Apache 有 `certificate chain` 属性来指定中间证书。

**Nginx 配置：**
Nginx 没有 `Certificate Chain` 参数，如果有中间证书，需要把域名证书和中间证书合并，然后指定给 `ssl_certificate` 才行。

**重要：**
用 Nginx 配置 HTTPS 证书，如果有中间证书，一定要和域名证书合并再指定给 `ssl_certificate`。合并要求用户证书在前面，中间证书（bundle）在后面。
