---
title: Linux 内存 buffer 和 cache 的区别
date: '2015-01-15'
description: 解读 free 命令各项内存统计的含义、实际可用内存的计算方式，以及 buffer（块设备读写缓冲）与 cache（文件系统页缓存）的区别。
category: linux
tags:
  - linux-admin
  - 存储
draft: false
source: evernote-local-db
lang: zh
origin_url: http://blog.csdn.net/tianlesoftware/article/details/6459044
---
## 一、内存使用说明

`free` 命令相对 top 提供了更简洁的内存使用视图（单位 KB）：

```text
[root@rac1 ~]# free
             total    used     free   shared  buffers  cached
Mem:        1035108 1008984   26124       0   124212   413000
-/+ buffers/cache:   471772  563336
Swap:       2096472  842320 1254152
```

Linux 内存分配机制优先使用物理内存：物理内存有空闲时不会释放已占用内存，即使占用内存的程序已关闭，其内存仍用作缓存，以加快再次访问。

**Mem 行**：Total 物理内存总量、Used 分配给缓存（含 buffers 与 cache）使用的量、Free 未分配内存、Shared 共享内存、Buffers 分配但未用的 buffers、Cached 分配但未用的 cache。

**-/+ buffers/cache 行**：Used 为实际使用的 buffers 与 cache 总量（即实际使用的内存总量）；Free 为未使用的 buffers/cache 与未分配内存之和（系统当前实际可用内存）。

由此可得：

```text
# 实际可用内存
Free(-/+ buffers/cache) = Free(Mem) + buffers(Mem) + Cached(Mem)
563336 = 26124 + 124212 + 413000

# 已分配内存
Used(Mem) = Used(-/+ buffers/cache) + buffers(Mem) + Cached(Mem)
1008984 = 471772 + 124212 + 413000

# 物理内存总量
total(Mem) = used(-/+ buffers/cache) + free(-/+ buffers/cache)
1035108 = 471772 + 563336
```

## 二、buffer 与 cache 的区别

> A buffer is something that has yet to be "written" to disk.
> A cache is something that has been "read" from the disk and stored for later use.

**Cache（高速缓存）**：位于 CPU 与主内存间、容量小但速度高的存储器。保存 CPU 刚用过或循环使用的数据，CPU 再次使用时可直接从 Cache 调用，减少等待。分 L1 Cache（集成在 CPU 内部）和 L2 Cache。

**Buffer（缓冲区）**：用于存储速度或优先级不同的设备之间传输的数据，减少进程相互等待，使从慢速设备读数据时快速设备的进程不中断。

在 free 命令中：

- **buffer**：作为 buffer cache 的内存，是块设备的读写缓冲区，更靠近存储设备，或直接是 disk 的缓冲区。
- **cache**：作为 page cache 的内存，是文件系统的缓存。

如果 cache 值很大，说明被缓存的文件数很多。若频繁访问的文件都能被 cache 住，磁盘读 IO 就会非常小。
