---
title: Ubuntu 中 useradd 和 adduser 的区别
date: '2018-01-05'
description: "Ubuntu 创建用户的两种方法对比。useradd 是低级命令，参数繁琐但功能全面；adduser 是高级脚本，交互式操作，适合初级用户。"
category: linux
tags:
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
origin_url: http://os.51cto.com/art/201104/256231.htm
---

## useradd

低级 ELF 可执行程序。直接操作系统文件，创建用户但不创建 home 目录、不设置密码、不分配 shell。

用法示例：

```bash
sudo useradd test
# 创建一个"三无"用户：无 home 目录、无密码、无 shell

sudo useradd -m -d /home/test -s /bin/bash -p passwd test
# -m 创建 home 目录
# -d 指定 home 目录路径
# -s 指定 shell（如 /bin/bash）
# -p 指定密码（但注意此方式 -p 后面的密码需事先加密）
```

### 常用参数

- `-b BASE_DIR`：指定 home 目录的基目录
- `-d HOME_DIR`：指定 home 目录
- `-g GID`：指定用户所属组
- `-l`：不添加到 lastlog/faillog 数据库
- `-M`：不创建 home 目录
- `-r`：创建系统账户
- `-s SHELL`：指定 shell

## adduser

高级 Perl 脚本，交互式创建用户。系统逐步提示输入用户信息，更友好但过程较长。

```bash
sudo adduser test
# 交互式输入：全名、房间号、工作电话、家庭电话、其他信息、密码
```

## 修改用户密码

如果用 useradd 创建后需要设置密码，用 `usermod` 或 `passwd`：

```bash
sudo usermod --password PASSWD username
# 或
sudo passwd username
```

## 对比总结

| 特性 | useradd | adduser |
|-----|---------|---------|
| 类型 | 低级命令（ELF） | 高级脚本（Perl） |
| 操作方式 | 单行命令 + 参数 | 交互式对话 |
| 学习曲线 | 陡峭（参数众多） | 平缓（提示引导） |
| 适合人群 | 高阶用户、脚本编程 | 初级用户、手动操作 |
| 效率 | 高（自动化友好） | 低（交互式）|
