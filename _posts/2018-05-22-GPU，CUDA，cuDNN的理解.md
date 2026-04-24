---
title: "GPU，CUDA，cuDNN的理解"
date: 2018-05-22 02:14:58 +0000
categories: ["机器学习"]
tags: []
description: "2017年08月17日 20:29:37 阅读数：5450 我们知道做深度学习离不开GPU，不过一直以来对GPU和CPU的差别，CUDA以及cuDNN都不是很了解，所以找了些资料整理下，希望不仅可以帮助自己理解，也能够帮助到其他人理解。 先来讲讲CPU和GPU的关系和差别吧。截图来自资料1（CUDA的官方文档）： 从上"
source: "evernote-local-db"
---

GPU，CUDA，cuDNN的理解
2017年08月17日 20:29:37
阅读数：5450
我们知道做深度学习离不开GPU，不过一直以来对GPU和CPU的差别，CUDA以及cuDNN都不是很了解，所以找了些资料整理下，希望不仅可以帮助自己理解，也能够帮助到其他人理解。
先来讲讲CPU和GPU的关系和差别吧。截图来自资料1（CUDA的官方文档）：
从上图可以看出GPU（图像处理器，Graphics Processing Unit）和CPU（中央处理器，Central Processing Unit）在设计上的主要差异在于
GPU有更多的运算单元（如图中绿色的ALU）
，而Control和Cache单元不如CPU多，这是因为GPU在进行并行计算的时候每个运算单元都是执行相同的程序，而不需要太多的控制。
Cache单元是用来做数据缓存的，CPU可以通过Cache来减少存取主内存的次数，也就是减少内存延迟（memory latency）。GPU中Cache很小或者没有，因为GPU可以通过并行计算的方式来减少内存延迟。
因此CPU的Cahce设计主要是实现低延迟，Control主要是通用性，复杂的逻辑控制单元可以保证CPU高效分发任务和指令。所以CPU擅长逻辑控制，是串行计算，而GPU擅长高强度计算，是并行计算。打个比方，GPU就像成千上万的苦力，每个人干的都是类似的苦力活，相互之间没有依赖，都是独立的，简单的人多力量大；CPU就像包工头，虽然也能干苦力的活，但是人少，所以一般负责任务分配，人员调度等工作。
可以看出GPU加速是通过大量线程并行实现的，因此对于不能高度并行化的工作而言，GPU就没什么效果了。而CPU则是串行操作，需要很强的通用性，主要起到统管和分配任务的作用。
————————————————————————-华丽的分割线——————————————————————-
CUDA
的官方文档（参考资料1）是这么介绍CUDA的：
a general purpose parallel computing platform and programming model that leverages the parallel compute engine in NVIDIA GPUs to solve many complex computational problems in a more efficient way than on a CPU.

换句话说CUDA是NVIDIA推出的用于自家GPU的
并行计算
框架，也就是说CUDA只能在NVIDIA的GPU上运行，
而且只有当要解决的计算问题是可以大量并行计算的时候才能发挥CUDA的作用。
接下来这段话摘抄自资料2。
在 CUDA 的架构下，一个程序分为两个部份：host 端和 device 端。Host 端是指在 CPU 上执行的部份，而 device 端则是在显示芯片上执行的部份。Device 端的程序又称为 “kernel”。通常 host 端程序会将数据准备好后，复制到显卡的内存中，再由显示芯片执行 device 端程序，完成后再由 host 端程序将结果从显卡的内存中取回。
接下来这段话摘抄自资料2。在 CUDA 架构下，显示芯片执行时的最小单位是thread。数个 thread 可以组成一个block。一个 block 中的 thread 能存取同一块共享的内存，而且可以快速进行同步的动作。每一个 block 所能包含的 thread 数目是有限的。不过，
执行相同程序的 block，可以组成grid。
不同 block 中的 thread 无法存取同一个共享的内存，因此无法直接互通或进行同步。因此，不同 block 中的 thread 能合作的程度是比较低的。不过，利用这个模式，可以让程序不用担心显示芯片实际上能同时执行的 thread 数目限制。例如，一个具有很少量执行单元的显示芯片，可能会把各个 block 中的 thread 顺序执行，而非同时执行。
不同的 grid 则可以执行不同的程序（即 kernel）。
————————————————————————-华丽的分割线——————————————————————-
cuDNN
（CUDA Deep Neural Network library）：是NVIDIA打造的针对深度神经网络的加速库，是一个用于深层神经网络的GPU加速库。如果你要用GPU训练模型，cuDNN不是必须的，但是一般会采用这个加速库。
