---
title: 使用 Supervisor 管理进程
date: '2018-03-13'
description: Supervisor 是 Python 编写的进程管理工具，支持启动、重启、关闭单个或多个进程。介绍安装、配置 supervisord 和 program，以及使用 supervisorctl 进行进程管理的方法。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
---

Supervisor（http://supervisord.org）是用 Python 写的进程管理工具，可以方便地启动、重启、关闭进程（不仅是 Python 进程）。除了单个进程控制，还可同时启动/关闭多个进程，解决应用程序意外崩溃后的批量恢复问题。

## 安装

Supervisor 可运行在 Linux、Mac OS X 上。使用 pip 安装：

```bash
sudo pip install supervisor
```

Ubuntu 系统也可用 apt-get 安装。

## supervisord 配置

Supervisor 采用 C/S 模型，supervisord 是服务端。安装后可生成默认配置：

```bash
echo_supervisord_conf > /etc/supervisord.conf
```

基础配置项：

```ini
[unix_http_server]
file=/tmp/supervisor.sock          ; UNIX socket 文件，supervisorctl 使用

[inet_http_server]                 ; 可选，HTTP web 管理界面
port=127.0.0.1:9001                ; Web 后台 IP:端口
username=user                       ; 登录用户名
password=123                        ; 登录密码

[supervisord]
logfile=/tmp/supervisord.log        ; 日志文件
logfile_maxbytes=50MB               ; 日志文件大小，超出则 rotate
logfile_backups=10                  ; 保留备份数
loglevel=info                       ; 日志级别（debug/warn/trace）
pidfile=/tmp/supervisord.pid        ; pid 文件
nodaemon=false                      ; 是否前台启动（默认 daemon）
minfds=1024                         ; 可打开的最小文件描述符数
minprocs=200                        ; 可打开的最小进程数

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///tmp/supervisor.sock   ; 通过 UNIX socket 连接

[include]
files = /etc/supervisor/*.conf      ; 包含其他配置文件
```

启动 supervisord：

```bash
supervisord -c /etc/supervisord.conf
```

验证运行状态：

```bash
ps aux | grep supervisord
```

## Program 配置

在 `/etc/supervisor/` 目录下为每个应用创建配置文件。以 Flask 应用通过 gunicorn 运行为例：

命令行启动：

```bash
cd /home/leon/projects/usercenter
gunicorn -w 8 -b 0.0.0.0:17510 wsgi:app
```

对应的 Supervisor 配置：

```ini
[program:usercenter]
directory = /home/leon/projects/usercenter      ; 启动目录
command = gunicorn -w 8 -b 0.0.0.0:17510 wsgi:app   ; 启动命令
autostart = true                                ; supervisord 启动时自动启动
startsecs = 5                                   ; 启动 5 秒无异常退出即视为正常
autorestart = true                              ; 异常退出后自动重启
startretries = 3                                ; 启动失败重试次数
user = leon                                     ; 启动用户
redirect_stderr = true                          ; stderr 重定向到 stdout
stdout_logfile_maxbytes = 20MB                  ; stdout 日志文件大小
stdout_logfile_backups = 20                     ; stdout 日志备份数
stdout_logfile = /data/logs/usercenter_stdout.log ; stdout 日志文件
```

配置项说明：
- `[program:usercenter]` 中的 `usercenter` 是应用的唯一标识，所有操作都通过此名字实现
- 注意创建日志目录，supervisord 会自动创建日志文件但不会创建目录

## Tips

### Python 环境指定

两种方式：

1. 在 `command` 中使用绝对路径（推荐）：

```ini
command = /home/leon/.pyenv/versions/usercenter/bin/gunicorn -w 8 wsgi:app
```

2. 通过 `environment` 设置 PYTHONPATH：

```ini
environment = PYTHONPATH=$PYTHONPATH:/home/leon/.pyenv/versions/usercenter/bin/
```

### 后台进程

Supervisor 只能管理前台程序。若应用有后台选项，需关闭。

### 子进程管理

某些应用（如 Tornado）会产生子进程。为确保子进程也被正确停止，配置：

```ini
stopasgroup = true
killasgroup = true
```

## supervisorctl 使用

supervisorctl 是命令行客户端工具。进入交互式 shell：

```bash
supervisorctl -c /etc/supervisord.conf
```

在 shell 内执行命令：

```bash
> status                    # 查看程序状态
> start usercenter          # 启动程序
> stop usercenter           # 关闭程序
> restart usercenter        # 重启程序
> reread                    # 读取新增配置文件（不启动）
> update                    # 重启配置被修改的程序
```

也可直接在 bash 中运行：

```bash
supervisorctl status
supervisorctl start usercenter
supervisorctl stop usercenter
supervisorctl restart usercenter
supervisorctl reread
supervisorctl update
```

## 其他功能

- 可配置 web 管理界面，使用 Basic Auth 认证
- 支持 group 进行分组管理
- 经常查看日志文件诊断问题（supervisord 日志、各 program 日志）
- 更多配置项参见官方文档：http://supervisord.org/index.html
