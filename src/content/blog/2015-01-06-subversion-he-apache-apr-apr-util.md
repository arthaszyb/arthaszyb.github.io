---
title: Subversion和Apache、apr、apr-util的关系
date: '2015-01-06'
description: SVN 服务器和客户端的安装要求。服务器可独立运行或与 Apache 配合使用；客户端在不同平台和访问协议下的依赖关系。
category: web-infra
tags:
  - apache
  - ssh
  - ssl-tls
draft: false
source: evernote-local-db
lang: zh
---

## SVN 服务器和客户端的关系

### SVN 服务器

**可选 Apache**：Subversion 服务器本身不需要 Apache，但可以选择使用 Apache 来支持 HTTP(S) 访问。

**访问方式选择**：
- **file:// 或 svn://**：只需安装 SVN，使用 `svnserve` 服务，无需 Apache
- **http:// 或 https://**：必须安装 Apache，配置 SVN 的 Apache 模块

### SVN 客户端

**Windows 平台**：安装 TortoiseSVN，开发者已处理所有依赖关系，一个软件搞定。

**Linux/Unix 平台**：根据访问协议类型有不同要求：
- **file:// 或 svn://**：只需编译安装 SVN
- **http://**：需要与 neon 库编译
- **https://**：需要与带 SSL 支持的 neon 库编译
- **任何协议**：都需要与 apr 和 apr-util 库编译

**依赖获取**：Subversion 官方发布的代码中通常包含 `subversion-deps-xxx.tar.bz2` 文件（如 1.4.3 版本对应 `subversion-deps-1.4.3.tar.bz2`），内含 neon、apr、apr-util 等依赖库。

## 完整编译部署指南

### 准备安装包

推荐使用的版本组合：

```
Apr: apr-1.2.11.tar.gz 和 apr-util-1.5.2.tar.gz
Apache: httpd-2.2.25.tar.gz
Subversion: subversion-1.6.5 和 subversion-deps-1.6.5.tar.gz
Zlib: zlib-1.2.8.tar.gz
Sqlite: sqlite-autoconf-3080002.tar.gz
```

**注意**：编译过程中可能提示缺少其他包，根据提示逐一安装。

### 分步编译

#### 1. 安装 apr-1.2.11

```bash
tar –zvxf apr-1.2.11.tar.gz
cd apr-1.2.11
./configure
make
make install
```

默认安装到 `/usr/local/apr`

#### 2. 安装 apr-util-1.2.11

```bash
tar –zvxf apr-util-1.2.11.tar.gz
cd apr-util-1.2.11
./configure --with-apr=/usr/local/apr
make
make install
```

#### 3. 安装 Sqlite

```bash
tar -zxvf sqlite-autoconf-3080002.tar.gz
cd sqlite-autoconf-3080002
./configure --prefix=/usr/local/sqlite
make
make install
```

#### 4. 安装 Apache httpd-2.2.25

```bash
tar –zvxf httpd-2.2.25.tar.gz
cd httpd-2.2.25
./configure \
  --prefix=/usr/local/apache \
  --with-apr=/usr/local/apr/bin/apr-1-config \
  --with-apr-util=/usr/local/apr/bin/apu-1-config \
  --enable-dav \
  --enable-maintainer-mod \
  --enable-rewrite \
  --enable-so \
  --with-sqlite=/usr/local/sqlite
make
make install
```

启动 Apache 并验证：

```bash
/usr/local/apache/bin/apachectl -k start
# 访问 http://localhost/ 应看到 "it works"
```

**注意**：`--with-apr` 和 `--with-apr-util` 参数在编译错误时可省略。

#### 5. 安装和配置 Subversion

```bash
tar –zvxf subversion-1.6.5.tar.gz
tar –zvxf subversion-deps-1.6.5.tar.gz
# 两个压缩包会解压到同一个 subversion-1.6.5 目录

cd subversion-1.6.5
./configure \
  --prefix=/usr/local/svn \
  --with-apxs=/usr/local/apache/bin/apxs \
  --with-apr=/usr/local/apr/bin/apr-1-config \
  --with-apr-util=/usr/local/apache/bin/apu-1-config \
  --with-zlib=/usr/local/zlib-1.2.8 \
  --enable-maintainer-mode \
  --with-sqlite=/usr/local/sqlite
make
make install
```

验证安装：

```bash
/usr/local/svn/bin/svnserve --version
```

应看到相关版本信息。

验证 Apache 模块加载：

```bash
# 检查 httpd.conf 中是否包含
LoadModule dav_svn_module modules/mod_dav_svn.so
LoadModule authz_svn_module modules/mod_authz_svn.so
```

### 建立和配置 SVN 版本库

#### 创建版本库

```bash
/usr/local/svn/bin/svnadmin create /svn/project/www
ls /svn/project/www
# 应显示 db, hooks, locks, format 等文件/目录
```

#### 导入项目文件

```bash
/usr/local/svn/bin/svn import /share/www \
  file:///svn/project/www \
  -m "Initial import"
```

此操作将 `/share/www` 下的文件导入到版本库，修订版为 1。

#### 配置权限

设置目录权限为只有 Apache 用户可访问：

```bash
chmod -R 700 /svn/project
chown -R apache:apache /svn/project
```

**重要**：直接 chmod 会导致 SVN 客户端无法访问，需要修改 Apache 用户配置。编辑 `/usr/local/apache/conf/httpd.conf`：

```apache
User apache
Group apache
```

如果系统没有 apache 用户和组，需要先创建：

```bash
useradd apache
groupadd apache
```

### Apache 支持 SVN 的配置

编辑 `/usr/local/apache/conf/httpd.conf`，文件末尾添加：

```apache
<Location /svn>
    DAV svn
    SVNPath /svn/project/www
    AuthType Basic
    AuthName "Subversion Repository"
    AuthUserFile /usr/local/apache/svn-auth-file
    AuthzSVNAccessFile /usr/local/apache/auth.conf
    Require valid-user
</Location>
```

说明：
- `DAV svn`：启用 WebDAV 支持 SVN
- `SVNPath`：版本库根目录
- `AuthUserFile`：用户密码文件（由 htpasswd 生成）
- `AuthzSVNAccessFile`：权限控制文件

### 用户和权限管理

#### 添加用户

```bash
# 首次创建用户文件（使用 -c 标志）
/usr/local/apache/bin/htpasswd -c /usr/local/apache/svn-auth-file user1
# 后续添加用户（不使用 -c）
/usr/local/apache/bin/htpasswd /usr/local/apache/svn-auth-file user2
```

#### 配置权限控制

编辑 `/usr/local/apache/auth.conf`：

```ini
[groups]
Admin = user1,user2
Develop = u1,u2

[www:/]
user1 = rw
user2 = r
@develop = rw

[/]
* = r
```

说明：
- `[groups]`：定义用户组
- `[www:/]`：对版本库 www 根目录的权限
- `[/]`：对所有版本库的权限
- `rw` 表示读写，`r` 表示只读
- `@groupname` 表示整个组

**重要**：authz.conf 文件中所有行必须顶头写，不能有缩进，否则报错。

### 启动服务

```bash
# 重启 Apache
/usr/local/apache/bin/apachectl -k restart

# 启动 SVN svnserve（可选，用于 svn:// 访问）
/usr/local/svn/bin/svnserve -d -r /svn/project

# 验证
ps -ef | grep svnserve
```

### 访问 SVN 版本库

通过 HTTP 访问：
```
http://192.168.0.1/svn/www
```

会提示输入用户名和密码。输入后可以看到版本库中的内容。

### 调试常见问题

#### 查看 Apache 是否安装及版本

```bash
# 如果是自动安装的 Apache
apachectl -v

# 如果是源码编译
/usr/local/apache2/bin/apachectl -v

# 或查看配置文件位置
apachectl -c
```

#### RPM 安装的 Apache

```bash
rpm -q httpd
```

## 附录：Linux 下查看 Apache 配置

**通过 SSH 查看远程 Linux 上的 Apache 信息**：

```bash
# 查看是否安装及版本（RPM 安装）
rpm -q httpd

# 查看源码安装的版本和路径
apachectl -v
apachectl -c
```

通常源码编译的 Apache 安装在 `/usr/local/apache2/bin/apachectl`。
