---
title: ssh批量登录并执行命令（python实现）
date: '2015-07-31'
description: "使用 Python 的 pexpect 或 paramiko 库实现 SSH 批量登录并执行命令，支持多线程并发连接，可用于局域网批量部署。"
category: python
tags:
  - ssh
  - python
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.cnblogs.com/ma6174/
---
SSH 批量登录并执行命令的 Python 实现笔记。

## 场景

局域网内大量同构 Linux 主机，需统一执行部署命令（安装软件、拷贝文件、关机等）。逐台手工操作耗时，需自动化解决方案。

## 方法一：pexpect 模块（自动交互）

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pexpect

def ssh_cmd(ip, passwd, cmd):
    ret = -1
    ssh = pexpect.spawn('ssh root@%s "%s"' % (ip, cmd))
    try:
        i = ssh.expect(['password:', 'continue connecting (yes/no)?'], timeout=5)
        if i == 0:
            ssh.sendline(passwd)
        elif i == 1:
            ssh.sendline('yes\n')
            ssh.expect('password: ')
            ssh.sendline(passwd)
        ssh.sendline(cmd)
        r = ssh.read()
        print(r)
        ret = 0
    except pexpect.EOF:
        print("EOF")
        ssh.close()
        ret = -1
    except pexpect.TIMEOUT:
        print("TIMEOUT")
        ssh.close()
        ret = -2
    return ret
```

特点：处理 SSH 首次连接的 yes/no 提示和密码输入。适合 telnet、FTP、SCP 等交互场景。

## 方法二：paramiko 模块（推荐，更快）

```python
#!/usr/bin/python
# -*- coding: utf-8 -*-

import paramiko
import threading

def ssh2(ip, username, passwd, cmd):
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(ip, 22, username, passwd, timeout=5)
        for m in cmd:
            stdin, stdout, stderr = ssh.exec_command(m)
            stdin.write("Y")  # 简单交互，输入 'Y'
            out = stdout.readlines()
            for o in out:
                print(o,)
        print('%s\tOK\n' % (ip))
        ssh.close()
    except:
        print('%s\tError\n' % (ip))

if __name__ == '__main__':
    cmd = ['cal', 'echo hello!']  # 要执行的命令列表
    username = ""  # 用户名
    passwd = ""    # 密码
    threads = []   # 多线程列表
    print("Begin......")
    for i in range(1, 254):
        ip = '192.168.1.' + str(i)
        a = threading.Thread(target=ssh2, args=(ip, username, passwd, cmd))
        a.start()
```

## 关键技巧

1. **多线程并发**：同时发起多个连接，不用多线程则每台需 5-10 秒，100+ 台需 20 分钟；用多线程可降至 2 分钟以内
2. **使用 root 用户**：避免普通用户执行命令时再次提示输入密码
3. **命令加 -y 参数**：apt-get install/remove 时避免交互确认，如 `apt-get install -y xxx`
4. **遍历全部 IP**：路由器自动分配 IP，保险起见全部扫描，避免遗漏主机
5. **命令列表化**：所有命令放入列表，遍历执行，易于管理
6. **预配置远端**：提前开启 root 用户、部署 SSH 服务器、设置开机自启
