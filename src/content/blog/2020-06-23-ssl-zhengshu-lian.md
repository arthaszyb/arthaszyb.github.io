---
title: SSL证书链
date: '2020-06-23'
description: >-
  SSL 证书链的结构与原理。完整的证书链分为三级：服务端证书、中间证书、根证书，形成信任链。
category: web-infra
tags:
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
---
## 证书链是什么？

完整的证书内容一般分为 3 级，服务端证书、中间证书、根证书，即 end-user certificates、intermediates certificates 和 root certificates。
- **end-user** - 用来加密传输数据的公钥的证书，是 HTTPS 中使用的证书。开发者把证书部署在 `qiniu.com` 的服务器上。
- **intermediates** - CA 用来认证公钥持有者身份的证书，即确认 HTTPS 使用的 end-user 证书属于 `qiniu.com`。
- **root** - 用来认证 intermediates 证书是合法证书的证书。
简单来说，end-user 证书上面的几级证书都是为了保证 end-user 证书未被篡改，保证是 CA 签发的合法证书，进而保证 end-user 证书中的公钥未被篡改。我们使用 end-user certificates 来确保加密传输数据的公钥(public key)不被篡改。

如何确保 end-user certificates 的合法性呢？这个认证过程类似于公钥认证过程：首先获取颁布 end-user certificates 的 CA 的证书，然后验证 end-user certificates 的 signature。

一般来说，root CAs 不会直接颁布 end-user certificates，而是授权给多个二级 CA。二级 CA 又可以授权给多个三级 CA，这些中间的 CA 就是 intermediates CAs，它们才会颁布 end-user certificates。
七牛云证书管理会在用户上传证书时检测证书的完整性。证书链不完整会自动帮用户补全，但无法保证补全的证书链 100% 是正确的。所以需要用户选择使用自传的证书还是系统补全后的证书。

## 工具和参考

- 证书链检测和修复：https://www.kkssl.com/ssltools/sslchain

## 查看证书链命令

```bash
# 查看域名的证书链
openssl s_client -connect www.xxx.com:443 -showcerts

# 查看证书信息
openssl x509 -noout -text -in /data/bkee/cert/bk_domain.crt
```
