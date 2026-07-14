---
title: map实现python多线程
date: '2015-07-29'
description: 用 map 和 multiprocessing.dummy 库轻量化实现 Python 多线程/多进程，对比传统生产者-消费者模式的代码复杂度和性能提升。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
origin_url: http://www.zhangzhibo.net/2014/02/01/parallelism-in-one-line/
---
Python 多线程、多进程的轻量化实现笔记（翻译 + 应用补充）。

## 问题：传统生产者/消费者模式代码冗余

```python
import time
import threading
import Queue

class Consumer(threading.Thread):
    def __init__(self, queue):
        threading.Thread.__init__(self)
        self._queue = queue
    
    def run(self):
        while True:
            msg = self._queue.get()
            if isinstance(msg, str) and msg == 'quit':
                break
            print(“I'm a thread, and I received %s!!” % msg)
        print('Bye byes!')

def Producer():
    queue = Queue.Queue()
    worker = Consumer(queue)
    worker.start()
    start_time = time.time()
    while time.time() - start_time < 5:
        queue.put('something at %s' % time.time())
        time.sleep(1)
    queue.put('quit')
    worker.join()
```

需要定义类、管理队列、join 操作，代码样板化且易出错。

## 解决方案：用 map + ThreadPool

核心库：`multiprocessing.dummy`（线程版）和 `multiprocessing`（进程版）。

```python
from multiprocessing.dummy import Pool as ThreadPool

# 最简单的用法
pool = ThreadPool(4)  # 4 个线程
results = pool.map(urllib2.urlopen, urls)
pool.close()
pool.join()
```

等价于传统的 40+ 行代码，核心只有 1 行。

## 性能对比（6000 张图片生成缩略图）

```python
import os
from multiprocessing import Pool
from PIL import Image

SIZE = (75, 75)
SAVE_DIRECTORY = 'thumbs'

def get_image_paths(folder):
    return (os.path.join(folder, f) for f in os.listdir(folder) if 'jpeg' in f)

def create_thumbnail(filename):
    im = Image.open(filename)
    im.thumbnail(SIZE, Image.ANTIALIAS)
    base, fname = os.path.split(filename)
    save_path = os.path.join(base, SAVE_DIRECTORY, fname)
    im.save(save_path)

if __name__ == '__main__':
    folder = os.path.abspath('11_18_2013_R000_IQM_Big_Sur_Mon__e10d1958e7b766c3e840')
    os.mkdir(os.path.join(folder, SAVE_DIRECTORY))
    images = get_image_paths(folder)
    
    # 单进程：27.9 秒
    # for image in images:
    #     create_thumbnail(image)
    
    # 多进程：5.6 秒
    pool = Pool()
    pool.map(create_thumbnail, images)
    pool.close()
    pool.join()
```

## 核心概念

- **multiprocessing.dummy**：multiprocessing 的线程版本克隆（IO 密集型任务）
- **multiprocessing.Pool**：进程池（CPU 密集型任务）
- **Pool 参数**：processes 指定线程/进程数，默认为 CPU 核数

## GIL 影响

- Python 线程受全局解释器锁（GIL）限制，任一时刻仅一线程可用解释器，故为”并发”不”并行”
- **IO 密集型任务**用多线程（IO 期间释放解释器，其他线程可执行）
- **CPU 密集型任务**用多进程（绕过 GIL）

## 实际应用数据

```
单线程: 14.4 秒
4 线程池: 3.1 秒
8 线程池: 1.4 秒
13 线程池: 1.3 秒（线程数 >9 收益有限）
```

线程数过多会因切换开销反而降速，需通过实验找最优值。
