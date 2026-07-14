---
title: rsync 详解之 exclude 排除文件
date: '2014-06-13'
description: rsync 同步时使用 --exclude 排除指定文件和目录的方法；支持相对路径、通配符、文件列表等多种方式。
category: linux
tags:
  - rsync
  - ssh
draft: false
source: evernote-local-db
lang: zh
---

## 使用 --exclude 避开同步指定文件夹

参考：[rsync exclude files and folders](http://articles.slicehost.com/2007/10/10/rsync-exclude-files-and-folders)

常见需求：同步 `/` 下的 `/usr` 和 `/boot/`，但不想复制 `/proc` 和 `/tmp` 这些文件夹。

### 基本用法

添加 `--exclude` 参数来避开某个路径：

```bash
rsync --exclude "proc" ...
rsync --exclude 'sources' ...
```

**注意**：排除的路径必须是相对路径，不能是绝对路径。

### 例子：避开特定目录

源服务器 `/home/yjwan/bashshell` 有一个 `checkout` 文件夹：

```bash
[root@CentOS5-4 bashshell]# ls -dl checkout
drwxr-xr-x 2 root root 4096 Aug 21 09:14 checkout
```

目标服务器执行同步，避免复制这个文件夹：

```bash
rsync -av --exclude "checkout" yjwan@172.16.251.241:/home/yjwan/bashshell /tmp
```

验证结果：

```bash
[root@free /tmp/bashshell]# ls -d /tmp/bashshell/checkout
ls: /tmp/bashshell/checkout: No such file or directory
```

### 注意事项

1. 系统会把文件和文件夹一视同仁。如果 `checkout` 是一个文件，一样不会复制。

2. 如果只想避开文件夹内的某个子目录，可以这样写：

   ```bash
   rsync -av --exclude "checkout/123" ...
   ```

3. **不可写绝对路径**。下面的写法是错误的：

   ```bash
   rsync -av --exclude "/checkout" yjwan@172.16.251.241:/home/yjwan/bashshell /tmp
   ```

   这样写不会避免 `checkout` 被复制。输出示例：

   ```
   receiving file list … done
   bashshell/checkout/
   ```

4. 可以使用通配符避开不想复制的内容：

   ```bash
   rsync -av --exclude "fire*" ...
   ```

   这样 `fire` 打头的文件或文件夹全部不会被复制。

### 从文件读取排除列表

如果排除的文件过多，可以写到一个文件中，使用 `--exclude-from`：

```bash
rsync -av --exclude-from="/exclude.list" yjwan@172.16.251.241:/home/yjwan/bashshell /tmp
```

`exclude.list` 的位置是绝对路径，内容必须写为相对路径。例如，要避开 `checkout` 文件夹和 `fire` 打头的文件：

```
checkout
fire*
```

注意：用 `--exclude-from` 时不能用 `--exclude`。

## 验证同步结果

### 查看错误日志

在目标服务器检查是否复制出问题。

### 计算文件数量

在源服务器查看具体文件和文件夹的总个数：

```bash
ls -AlR|grep "^\[-d\]"|wc
```

在目标服务器计算一遍个数，对比是否一致。

### 使用 rsync 列表计数

如果使用了 `--exclude` 参数，可以先用不带目标地址的 rsync 命令列出应该被复制的文件：

```bash
[root@CentOS5-4 bashshell]# rsync -av /root/bashshell/ |grep "^\[-d\]" | wc
62 310 4249
```

与 `ls` 得到的结果对比：

```bash
[root@CentOS5-4 bashshell]# ls -AlR |grep "^\[-d\]"|wc
62 558 3731
```

两者应该一致。

应用 `--exclude` 后再计算：

```bash
[root@CentOS5-4 bashshell]# rsync -av --exclude "fire*" /root/bashshell/ |grep "^\[-d\]" | wc
44 220 2695
```

然后实际同步并验证目标机器的文件数：

```bash
[root@free /tmp]# ls -AlR /tmp/bashshell/ |grep "^\[-d\]"|wc
44 396 2554
```

两者应该同步。

## rsync 的其他常见参数

**`-z` / `--compress`**

压缩文件数据进行传输。如果网络带宽不足，压缩会提高效率但消耗 CPU。在内网传输且文件数量不多时，此参数不是必需的。

**`--compress-level=NUM`**

显式设置压缩级别。

**`--skip-compress=LIST`**

跳过特定后缀文件的压缩。

**`--password-file=FILE`**

仅当远端机器是 rsync 服务器时才能使用。注意：这是 rsync 服务的密码，不是 SSH 登陆密码。

**`--stats`**

输出更详细的文件传输状态信息。

**`--progress`**

显示每个文件的传输进度。对于大文件传输很有用。

使用 `-P` 选项的好处：保留中断的部分传输，同时显示每个文件的进度报告。对于传输大的媒体文件特别有用。
