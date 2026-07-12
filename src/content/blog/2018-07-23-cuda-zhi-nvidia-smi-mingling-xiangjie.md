---
title: CUDA之nvidia-smi命令详解
date: '2018-07-23'
description: nvidia-smi是查看GPU使用情况的常用命令，本文详解其输出中各个参数的含义及应用。
category: ai
tags:
  - gpu
  - cuda
  - linux-admin
draft: false
source: evernote-local-db
lang: zh
---
nvidia-smi是用来查看GPU使用情况的命令。通过它可以判断哪几块GPU空闲，了解GPU的当前使用状态。

## GPU信息表的各字段含义

- **Fan**：风扇转速，0-100%范围内变动。这是计算机期望的风扇转速；实际情况下如果风扇堵转，可能达不到显示的转速。有的设备不返回转速，因为它依靠其他外设（如空调房间）保持低温而不依赖风扇。
- **Temp**：温度，单位摄氏度。
- **Perf**：性能状态，从P0到P12。P0表示最大性能，P12表示最小性能。
- **Pwr**：能耗，上方是Persistence-M（持续模式状态）。持续模式虽然耗能大，但在新GPU应用启动时花费时间更少。
- **Bus-Id**：涉及GPU总线的东西，格式为domain:bus:device.function。
- **Disp.A**：Display Active，表示GPU的显示是否初始化。
- **Memory Usage**：显存使用率（在第五第六栏下方）。
- **GPU利用率**：第七栏是浮动的GPU利用率。
- **Compute M**：计算模式（在第八栏下方）。

## 关键概念

### 显存占用和GPU占用的区别

显存占用和GPU占用是两个不同的东西。显卡由GPU和显存等组成，显存和GPU的关系类似于内存和CPU的关系。

例如：跑caffe代码时显存占得少，GPU占得多；跑TensorFlow代码时，显存占得多，GPU占得少。

### 进程级显存占用

在GPU信息表下方有一张表示每个进程占用的显存使用率。这与整体GPU利用率是独立的。

## nvidia-smi命令选项

基本用法：`nvidia-smi [OPTION1 [ARG1]] [OPTION2 [ARG2]] ...`

### 主要选项

| 参数 | 说明 |
|---|---|
| `-h, --help` | 打印使用信息并退出 |
| `-L, --list-gpus` | 显示连接到系统的GPU列表 |
| `-i, --id=` | 指定目标GPU |
| `-f, --filename=` | 输出到指定文件，而不是stdout |
| `-l, --loop=` | 按指定秒数间隔探测，直到按Ctrl+C退出 |
| `-lms, --loop-ms=` | 按指定毫秒间隔探测 |
| `-q, --query` | 查询GPU信息 |
| `-u, --unit` | 显示单元信息而不是GPU信息 |
| `-x, --xml-format` | 生成XML格式输出 |

### 设备修改选项

| 参数 | 说明 |
|---|---|
| `-pm, --persistence-mode=` | 设置持续模式：0/DISABLED, 1/ENABLED |
| `-e, --ecc-config=` | 切换ECC支持：0/DISABLED, 1/ENABLED |
| `-p, --reset-ecc-errors=` | 重置ECC错误计数：0/VOLATILE, 1/AGGREGATE |
| `-c, --compute-mode=` | 设置计算模式：0/DEFAULT、1/EXCLUSIVE_THREAD（已弃用）、2/PROHIBITED、3/EXCLUSIVE_PROCESS |
| `--gom=` | 设置GPU操作模式：0/ALL_ON, 1/COMPUTE, 2/LOW_DP |
| `-r --gpu-reset` | 触发GPU重置 |

## 查询选项

使用`--query-gpu=`可以查询特定的GPU信息。使用`--help-query-gpu`获取更多信息。

常见的查询包括：
- `--query-supported-clocks`：支持的时钟列表
- `--query-compute-apps`：当前活动的计算进程列表
- `--query-accounted-apps`：被计数的计算进程列表
- `--query-retired-pages`：已退役的设备内存页列表

## 示例

查看GPU列表：
```bash
nvidia-smi -L
```

持续监控GPU状态（每秒更新一次）：
```bash
nvidia-smi -l 1
```

查看特定GPU的详细信息：
```bash
nvidia-smi -i 0 -q
```
