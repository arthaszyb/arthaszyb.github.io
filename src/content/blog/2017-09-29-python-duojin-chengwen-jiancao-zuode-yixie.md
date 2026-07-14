---
title: Python 多进程文件操作理解
date: '2017-09-29'
description: 多进程同时写入文件会导致内容错乱。原因是操作系统的执行单元粒度导致进程切换无序。解决方案包括加锁和使用 multiprocessing.Pool 的回调函数。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.jianshu.com/p/dc3cb5315ded
---

## 问题

多进程都对同一文件进行写入时，会因资源争夺导致文件内容错乱。

## 原因

1. **操作系统的写入权限**：同一时间只能有一个进程写入文件
2. **随机调度**：操作系统随机决定哪个进程执行，顺序无序
3. **执行单元粒度**：最小执行单元是原子级别（一行汇编代码），不是 Python 源代码行。一个进程可能写入几个字后就被切换到另一个进程

例如：10 个进程各写 10 个字。进程 1 写 3 个字就被切换，进程 3 写 2 个字又被切换到进程 5，最终文件内容混乱。

## 解决方案

### 方案 1：加锁

对写入操作加锁，保证一次只有一个进程完成完整的写入操作：

```python
from multiprocessing import Lock

lock = Lock()
def write_file(lock, data):
    with lock:
        # 完整的写入操作
        f = open('file.txt', 'a')
        f.write(data)
        f.close()
```

缺点：程序执行效率下降，且若写入操作分散在代码多处难以控制。

### 方案 2：回调函数（推荐）

将写入操作与计算逻辑分离，使用 multiprocessing.Pool 的回调函数：

```python
import multiprocessing

def myCallback(x):
    # 文件操作，写入 x 到文件
    with open('file.txt', 'a') as f:
        f.write(str(x) + '\n')

def getInfo(num):
    # 返回需要写入的内容
    return num * 2

pool = multiprocessing.Pool()
for i in range(10):
    pool.apply_async(getInfo, (i,), callback=myCallback)
pool.close()
pool.join()
```

### apply_async 用法

- `apply_async(func, args, callback=...)`：传递不定参数，非阻塞，支持结果返回后回调
- `close()`：关闭 pool，使其不再接受新任务
- `join()`：主进程阻塞等待子进程退出（必须在 close 后调用）

### 注意事项

`pool.close()` 必须在所有 `apply_async` 之后，不能放在循环内或 apply 前调用。错误示例会导致 `AssertionError: assert self._state == RUN`。

正确顺序：

```python
pool = multiprocessing.Pool(processes=2)
result = []
for i in range(3):
    msg = "hello %d" % i
    result.append(pool.apply_async(func, [msg]))
pool.close()
pool.join()
print "Sub-process(es) done."
for obj in result:
    print obj.get(timeout=1)
```
