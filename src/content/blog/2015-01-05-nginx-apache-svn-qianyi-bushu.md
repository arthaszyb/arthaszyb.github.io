---
title: Nginx+Apache+SVN迁移部署
date: '2015-01-05'
description: nginx 反向代理 Apache+SVN 服务的部署步骤和常见问题排查。涉及 SVN 目录迁移、Apache 配置、nginx 反向代理设置等。
category: web-infra
tags:
  - nginx
  - apache
draft: false
source: evernote-local-db
lang: zh
---

## 部署步骤

### 1. 迁移 SVN 目录和 Apache 配置
复制原服务器的 SVN 目录和 Apache 配置文件到新服务器。

### 2. 部署 SVN
安装 mod_dav_svn 模块：

```bash
yum install mod_dav_svn
```

此命令会在 `/etc/httpd/modules/` 目录下生成两个 Apache 需要的模块文件：
- `mod_dav_svn.so`
- `mod_authz_svn.so`

### 3. 编译部署 Apache
编译 Apache 时启用必要选项：

```bash
./configure --enable-dav --enable-so
make
make install
```

启动 Apache，此时应该能访问 SVN 页面。

### 4. 部署 Nginx
配置 nginx 反向代理转发请求到 Apache。

## 常见问题和解决方案

### 问题 1：nginx 反向代理返回 404

**原因**：listen 指令配置不正确

**解决**：将 `listen 80` 改为 `listen IP:80`（指定具体的 IP 地址）

### 问题 2：权限问题导致 SVN 无法访问

**原因**：nginx、Apache 和 SVN 目录的用户权限不一致

**解决**：确保三者使用相同的用户和权限

### 问题 3：SVN 迁移后恢复操作出错

**错误提示**：`Couldn't perform atomic initialization`

**解决方法**：

1. 删除原来错误建立的库：
```bash
rm -rf /PATH/TO/REPO
```

2. 使用正确的参数重建库：
```bash
svnadmin create --fs-type fsfs --pre-1.6-compatible /PATH/TO/REPO
```

关键参数：
- `--fs-type fsfs`：使用文件系统类型存储
- `--pre-1.6-compatible`：保证与旧版本兼容

## Nginx 反向代理配置

基本的 nginx 反向代理配置示例（具体配置需根据实际环境调整）：

```nginx
upstream apache_backend {
    server 127.0.0.1:8080;
}

server {
    listen 80;
    server_name svn.example.com;

    location / {
        proxy_pass http://apache_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

关键点：
- listen 必须指定 IP:PORT
- proxy_set_header 用于传递原始请求信息给后端
- 权限和用户配置必须在 Apache 中一致处理
