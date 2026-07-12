---
title: Intel和AMD 与 x86、ARM、MIPS的区别
date: '2019-02-13'
description: 对Intel和AMD两家公司与CPU架构（x86、ARM、MIPS）的关系进行梳理，说明各架构的设计思路和应用场景。
category: ai
tags: []
draft: false
origin_url: https://www.zhihu.com/question/63627218/answer/211243489
source: evernote-local-db
lang: zh
---
## AMD和Intel

AMD和Intel都是x86/x86-64架构CPU的主要厂商。Intel早期开发了x86架构，AMD获得授权也开发x86。Intel向64位过渡时推出ia64，但因与x86不兼容市场反应差。AMD率先推出x86的64位兼容版本（x86-64），后来Intel也获得授权并采用。由于AMD先推出，所以x86-64也称为amd64。

除Intel和AMD外，还有VIA等少数公司有x86授权，但技术水平一般。

## x86、ARM和MIPS

早期CPU有两种设计思路：

- **CISC（复杂指令集）**：CPU逻辑电路复杂，可直接硬件实现复杂指令。x86是CISC的代表。
- **RISC（精简指令集）**：CPU设计简单，依靠简单指令组合完成复杂操作。ARM和MIPS是RISC典型代表。

现代x86逐步引入RISC理念，通过指令模块化改进内部实现。x86主要产品有Intel的至强、酷睿等，AMD的锐龙等。

## ARM架构

ARM是RISC典型代表，但发展中引入了部分复杂指令。ARM专利在ARM公司，高通、三星、苹果等需获得授权。ARM贵在便宜低功耗。

## MIPS架构

MIPS是学院派CPU，授权门槛低，广泛用于嵌入式领域（如路由器）。最活跃的是中国的龙芯，其LoongISA架构是MIPS的扩展。

## 性能对比

目前MIPS和ARM的性能与x86差距较大，但ARM优势是功耗低，MIPS的纯计算能力较强。此外还有Power CPU（RISC）和Alpha架构（侧重超算，如申威）等。
先说amd和intel
amd和Intel这俩公司的渊源很深，早期时Intel先是自己搞了个x86架构，然后amd拿到了x86的授权也可以自己做x86了。接着intel向64位过渡的时候自己搞了个ia64（x64架构）但是因为和x86架构不兼容市场反应极差，amd率先搞了x86的64位兼容（32和64的混合架构）也就是后来的x86-64，后来Intel也拿到了生产这货的授权（i和a两家专利交叉的很严重），也搞了x86-64，因为amd先搞出来的所以x86-64也叫amd64
目前amd和Intel是世界上最大的两家x86和x86-64的cpu厂家（intel比较给力，四分天下有其三）。除了这两家还有几家小的公司也有x86的授权，比如via，不过技术水平真的很一般。
再说x86，arm和mips
这三个的区别和联系要从cpu早期说起，早期的cpu有两个设计思路，1是把cpu内的逻辑电路做的非常复杂，这样可以直接用cpu硬件事先复杂指令，这个叫复杂指令集cisc；另一个思路是尽可能把cpu做的简单，依靠简单指令的组合迭代完成复杂指令，这个叫精简指令集risc
x86目前泛指x86和x86-64架构，这是因为x86-64完全兼容x86。早期的x86是cisc的代表，后来的发展中逐步引入了risc的部分理念，将内部指令的实现大量模块化，准确来说是一个cisc外加risc部分技术的架构。
目前x86的主要产品有Intel的至强，酷睿，奔腾，赛扬和凌动；amd的锐龙，apu等。上文提到的x64架构目前只有intel 安腾而且已经放弃了产品线。
到目前为止intel和amd的x86架构cpu虽然指令集上有很大差别了但是还是相互兼容的，所以软件可以直接用。'
再说arm。
arm是risc的典型代表，不过在arm的发展过程中引入了部分复杂指令（完全没有复杂指令的话操作系统跑起来异常艰难），所以是一个risc基础外加cisc技术的cpu。
arm的主要专利技术在arm公司手中，像高通，三星，苹果这些公司需要拿到arm的授权。
另一个risc的典型处理器就是mips。mips是一个学院派的cpu，授权门槛极低，因此很多厂家都做mips或者mips衍生架构。我们平时接触到的mips架构cpu主要用在嵌入式领域，比如路由器。
目前最活跃的mips是中国的龙芯，其loongisa架构其实是mips的扩展。
目前无论mips还是arm，性能和主流x86差距都很大，不过arm贵在便宜低功耗，mips则纯计算能力很强（学院派的东西貌似都这样）
除了上述几家，还有power cpu（risc的，老苹果用的就是这货）；alpha架构的cpu（侧重超算，目前貌似最活跃是中国申威，神威太湖之光的cpu就是这货）。
