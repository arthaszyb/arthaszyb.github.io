---
title: Python 代码调试技巧
date: '2015-07-14'
description: Python 调试工具与方法的整理笔记，包括 pdb、PyCharm IDE、PyDev 以及日志功能的使用。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
---

Debug 是开发的重要技能，Python 提供多种调试工具和方法。

## pdb 调试

pdb 是 Python 内置调试工具，提供交互式源代码调试功能。

**常用命令**

| 命令 | 说明 |
|------|------|
| break / b | 设置断点 |
| continue / c | 继续执行程序 |
| list / l | 查看当前行的代码段 |
| step / s | 进入函数 |
| return / r | 执行到函数返回 |
| exit / q | 退出调试 |
| next / n | 执行下一行 |
| pp | 打印变量的值 |
| help | 帮助 |

**基本用法**

```python
import pdb
a = "aaa"
pdb.set_trace()
b = "bbb"
c = "ccc"
final = a + b + c
print final
```

运行脚本会在 `pdb.set_trace()` 处暂停，可以用 `n` + Enter 单步执行。

**调试函数**

```python
def combine(s1,s2):
    s3 = s1 + s2 + s1
    s3 = '"' + s3 +'"'
    return s3

a = "aaa"
pdb.set_trace()
b = "bbb"
c = "ccc"
final = combine(a,b)
print final
```

在函数调用处用 `s` 命令进入函数体调试。

**动态改变变量值**

```python
(Pdb) var = "1234"
(Pdb) !b="afdfd"
```

## PyCharm IDE 调试

PyCharm 是功能完整的 Python IDE，支持多线程、远程调试。

- 断点设置：在代码左侧边缘双击或 Ctrl+F8
- 表达式求值：选中表达式，Run > Evaluate Expression
- Variables 窗口：查看变量值
- Watches 窗口：监测指定变量变化
- 多线程支持：自动识别子线程，可分别调试

## PyDev 调试

PyDev 是 Eclipse 的 Python 插件。

安装：在 Eclipse 中 Help > Install New Software，添加 http://pydev.org/updates

配置 Python 解释器：Window > Preferences > Pydev > Interpreter – Python

运行调试脚本时支持传入命令行参数。

## 日志调试

Python 内置 `logging` 模块，比 print 调试更灵活。

**日志级别**

| Level | 用途 |
|-------|------|
| DEBUG | 详细信息，追踪问题 |
| INFO | 正常信息 |
| WARNING | 不可预见但不影响运行的问题 |
| ERROR | 功能受影响的严重问题 |
| CRITICAL | 程序无法继续运行 |

**基本使用**

```python
import logging
logger = logging.getLogger('myapp')
logger.setLevel(logging.INFO)
handler = logging.FileHandler('app.log')
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.info('normal infor')
logger.warning('warning info')
logger.error('error info')
```

**日志对象**

- logger：程序信息输出接口
- handler：处理信息输出（console、file、network）
- formatter：日志格式
- filter：决定哪些信息输出

日志支持层次继承关系，子 logger 名称为 `parent.child` 形式，适合大型项目的多模块日志管理。

## 总结

- **小脚本**：pdb 足够
- **IDE 开发**：PyCharm 功能最完整
- **大型项目**：结合 logging 模块和 IDE，支持多线程、参数调试
