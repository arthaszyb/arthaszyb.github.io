---
title: GPU、CUDA、cuDNN的理解
date: '2018-05-22'
description: 对GPU、CUDA和cuDNN的概念和关系进行梳理，说明GPU的架构特点、CUDA的编程模型以及cuDNN的用途。
category: ai
tags:
  - gpu
  - cuda
  - deep-learning
draft: false
source: evernote-local-db
lang: zh
---
## GPU和CPU的差异

GPU（图像处理器，Graphics Processing Unit）和CPU（中央处理器，Central Processing Unit）在设计上的主要差异：

- **GPU有更多的运算单元**（ALU），而Control和Cache单元不如CPU多。这是因为GPU在并行计算时每个运算单元执行相同的程序，不需要太多控制。
- **CPU的Cache设计**主要实现低延迟，Control实现通用性。复杂的逻辑控制单元使CPU能高效分发任务和指令。
- **GPU中的Cache**很小或没有，因为GPU通过并行计算的方式来减少内存延迟。

总结：CPU擅长逻辑控制和串行计算，GPU擅长高强度计算和并行计算。比喻说，GPU就像成千上万的苦力，每个人干的都是类似的苦力活；CPU就像包工头，人少但负责任务分配和人员调度。

GPU加速是通过大量线程并行实现的，对于不能高度并行化的工作而言，GPU没什么效果。

## CUDA

CUDA是NVIDIA推出的用于自家GPU的并行计算框架和编程模型，是一个通用并行计算平台和编程模型，用于解决复杂计算问题。CUDA只能在NVIDIA的GPU上运行，仅在计算问题可以大量并行计算时才能发挥作用。

### CUDA的架构

在CUDA架构下，一个程序分为两个部分：

- **Host端**：在CPU上执行的部分。
- **Device端**：在显示芯片上执行的部分，又称为"kernel"。

通常host端程序会将数据准备好后，复制到显卡的内存中，再由显示芯片执行device端程序，完成后再由host端程序将结果从显卡内存中取回。

### CUDA的执行单位

- **Thread**：执行的最小单位。
- **Block**：数个thread可以组成一个block，一个block中的thread能存取同一块共享内存，可以快速进行同步。每个block所能包含的thread数目有限。
- **Grid**：执行相同程序的block可以组成grid。不同block中的thread无法存取同一个共享内存，因此无法直接互通或进行同步。不过利用这个模式，程序不用担心显示芯片实际上能同时执行的thread数目限制。

不同grid可以执行不同的程序（即kernel）。

## cuDNN

cuDNN（CUDA Deep Neural Network library）是NVIDIA打造的针对深度神经网络的GPU加速库。如果要用GPU训练深度学习模型，cuDNN不是必需的，但一般会采用这个加速库来提升性能。
