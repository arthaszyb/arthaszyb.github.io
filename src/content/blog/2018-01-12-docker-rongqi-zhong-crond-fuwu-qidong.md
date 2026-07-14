---
title: Docker容器中crond服务启动后无法执行
date: '2018-01-12'
description: Docker 容器内 crontab 任务无法正常运行的问题排查与解决方案，涉及 rsyslog、PAM 模块配置和 pam_loginuid 权限问题。
category: container-virt
tags:
  - docker
  - crontab
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.minunix.com/2016/12/docker-crontab/
---

## 问题现象

在 Docker 容器内安装 crontab 后，启动 crond 服务但任务无法执行。

环境：
- CentOS 6.7
- 内核：Linux 3.10.101-1.el6.elrepo.x86_64

```bash
yum install crontabs
/etc/init.d/crond start
crontab -l
# */1 * * * * echo "aaaaaaaaaaaaa" >> /tmp/test.log
```

等待几分钟，发现 `/tmp/test.log` 文件未出现，说明 crond 没有正常工作。

## 排查步骤

### 启用 rsyslog 查看日志

```bash
/etc/init.d/rsyslog start
tail /var/log/crond
```

可能看到错误：`FAILED to open PAM security session (Cannot make / remove an entry for the specified session)`

查看 `/var/log/secure`：`pam_loginuid(crond:session): set_loginuid failed`

### 根本原因

`pam_loginuid.so` 模块用来设置已通过认证的进程的 uid，以使程序通过审核（audit）。但在 Docker 容器内，由于内核能力机制的安全限制，容器被严格限制只允许使用内核的部分能力。容器无法获取这些特权进程信息，导致 crond 启动时的 `set_loginuid` 失败。

由于 PAM 配置中使用了 `required` 机制（所有条件均须满足），这导致 crond 执行失败。

## 解决方案

修改 `/etc/pam.d/crond`，将 `pam_loginuid.so` 从 `required` 改为 `sufficient`：

```bash
cat /etc/pam.d/crond
# account required pam_access.so
# account include password-auth
# #session required pam_loginuid.so  #注释此行
# session include password-auth
# auth include password-auth
```

或者直接注释掉该行：

```bash
# cat /etc/pam.d/crond
# #session required pam_loginuid.so #注释此行
# session sufficient pam_loginuid.so
```

重启 crond：

```bash
/etc/init.d/crond restart
tailf /tmp/test.log  # 此时应该能看到任务执行日志
```

## 补充说明

**PAM 鉴证级别**（四种取值）：

- `required`：该行以及所有模块的成功是用户通过鉴别的必要条件。任何错误都会继续执行所有模块，最后才返回错误。
- `requisite`：同 required，但某个模块失败会立即返回错误。
- `sufficient`：该模块验证成功是用户通过鉴别的充分条件。成功则立即返回成功，失败则当做 optional 对待。
- `optional`：模块验证结果忽略，不影响最终结果。

在 Docker 容器中，使用 `sufficient` 而不是 `required` 可以让鉴证在 `pam_loginuid` 成功时直接通过，失败时进行其他尝试，从而绕过容器权限限制。
