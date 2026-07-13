---
title: Python中执行系统命令常见的几种方法
date: '2015-07-27'
description: Python执行系统命令的四种方法总结（os.system、os.popen、subprocess、commands），各自的特点和适用场景。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
origin_url: http://wangwei007.blog.51cto.com/68019/1106857
---
Python执行系统命令的常用方法整理笔记。

## os.system()
在子终端运行系统命令，不返回执行结果。

```python
import os
os.system('ls')
```

## os.popen()
执行命令并返回信息对象，便于程序处理。

```python
import os
tmp = os.popen('ls *.sh').readlines()
# tmp: ['install_zabbix.sh\n', 'manage_deploy.sh\n', ...]
```

## subprocess 模块
支持线程控制和监控，返回结果，推荐使用。

```python
import subprocess
subprocess.call(["cmd", "arg1", "arg2"], shell=True)

p = subprocess.Popen('ls *.sh', shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
print(p.stdout.readlines())
for line in p.stdout.readlines():
    print(line,)
retval = p.wait()
```

## commands 模块
常用方法：getoutput() 返回输出，getstatusoutput() 返回状态码和输出。

```python
import commands
commands.getoutput('ls *.sh')
# 'install_zabbix.sh\nmanage_deploy.sh\n...'

commands.getstatusoutput('ls *.sh')
# (0, 'install_zabbix.sh\nmanage_deploy.sh\n...')
```

**注意**：处理中文时建议使用 subprocess，os.popen 会出错。
