---
title: "ORALC的STDDEV、STDDEV_POP、STDDEV_SAMP等函数 - 潇湘隐者 - 博客园"
date: 2017-04-21 17:25:43 +0000
categories: ["网络"]
tags: ["Pages"]
description: "星期五, 四月 21, 2017 5:25 下午 已剪辑自 : http://www.cnblogs.com/kerrycode/archive/2011/06/03/2063860.html 今天一个同事碰到一个问题：用SQL求一个指标的计算公式： 其中 Xi 即指标， X — 指标均值， N 是指标个数，看到这样的"
source: "evernote-local-db"
---

ORALC的STDDEV、STDDEV_POP、STDDEV_SAMP等函数 - 潇湘隐者 - 博客园
星期五, 四月 21, 2017
5:25 下午
已剪辑自
:

http://www.cnblogs.com/kerrycode/archive/2011/06/03/2063860.html
今天一个同事碰到一个问题：用SQL求一个指标的计算公式：
其中
Xi
即指标，
X
—
指标均值，
N
是指标个数，看到这样的计算公式确实比较发愁。在处理问题前，先去恶补了下数理统计方面的知识（数理统计的知识基本上都还给老师了）：方差、标准差、平均值
.....

随机变量
是指
变量
的值无法预先确定仅以一定的可能性
(
概率
)
取值的量。它是由于随机而获得的非确定值，是概率中的一个基本概念。

样本方差

：样本中各数据与
样本平均数
的差的平方和的平均数叫样本方差。

样本标准差：样本方差的
算术平方根
叫做样本标准差。

样本方差和样本标准差都是衡量一个样本波动大小的量，样本方差或样本标准差越大，样本数据的波动就越大。 数学上一般用E{[X-E(X)]^2}来度量随机变量X与其均值E(X)即期望的偏离程度，称为X的方差。标准偏差公式：S = Sqrt[(∑(xi-x拨)^2) /N]公式中∑代表总和，x拨代表x的均值，^2代表二次方，Sqrt代表平方根。

假设有一组数值 x1, ..., xN （皆为实数），其平均值为：

此组数值的标准差为：
一
随机变量
X

的标准差定义为：

须注意并非所有随机变量都具有标准差，因为有些随机变量不存在期望值。

如果
随机变量

X

为

x1,...,xN

具有相同机率，则可用上述公式计算标准差。从一大组数值当中取出一样本数值组合

x1,...,xn

，常定义其样本标准差：

到这里估计有些人犯迷糊了，到底标准差是哪个呢？到底是除以n还是n-1呢？ （纠结这个也是由于后面的ORACLE函数而必须纠结），当时也是看见有些资料说标准差是这个，有些是哪个. 其实第一个公式是对一组固定数值而言，而第二歌公式是从随机变量随机抽样的N个样本（目前我是这样理解的，不知道对错与否）。

接下来我想找找ORACLE里面有没有这样的数学函数。刚开始想到STDDEV(DISTINCT|ALL)函数，ALL表示对所有的值求求标准偏差,DISTINCT表示只对不同的值求标准差，对于STDDEV、STDDEV_POP、STDDEV_SAMP这三者之间查别，也是一知半解：查看用户手册：定义如下所示：（水平有限，翻译不当，敬请指出）

其实到目前，我们知道了STDDEV与STDDEV_SAMP基本上是一致的。只是当只有一行数据时，返回的值不同而已，但是我们对STDDEV_POP与STDDEV之间区别还是不太清楚。只好硬着头皮写SQL脚本来验证一下这两个函数了。我们现在做个试验，假设SCOTT.EMP表的工资字段就是我们所要求的指标，我们要求SAL字段的标准方差，下面用最原始的SQL脚本来模拟一下吧。

--方法1
SELECT SQRT(SUM(SAL)/MAX(CNT))

FROM

(

SELECT POWER((SAL - AVG(SAL) OVER()),2) AS SAL,COUNT(1) OVER() AS CNT

FROM SCOTT.EMP

) ;

--方法2
SELECT SQRT(SUM( POWER((SAL - (SELECT AVG(SAL) FROM SCOTT.EMP)), 2)

/(SELECT COUNT(1) FROM SCOTT.EMP)))

FROM SCOTT.EMP

接下来我们来看看用STDDEV、STDDEV_POP函数计算的结果。从下图你就可以知道STDDEV_POP是哪个计算公式了吧。呵呵

那么STDDEV的计算公式是什么呢？我测试发现其实STDDEV的标准差计算公式是
SELECT SQRT(SUM( POWER((SAL - (SELECT AVG(SAL) FROM SCOTT.EMP)), 2)

/((SELECT COUNT(1) FROM SCOTT.EMP) -1)))

FROM SCOTT.EMP;

它们是等效的。有兴趣的可以试试。到此我么可以看出这几个ORACLE函数的计算公式：

STDDEV_POP STDDEV

另外附上其它几个也不太常用的函数：
CORR
功能描述：返回一对表达式的相关系数，它是如下的缩写：
COVAR_POP(expr1,expr2)/STDDEV_POP(expr1)*STDDEV_POP(expr2))
VARIANCE
功能描述：返回一对表达式的样本方差 SQRT（VARIANCE（expr）） = STDEV(expr)

COVAR_POP
功能描述：返回一对表达式的方差。 SQRT(COVAR_POP(expr)) = STDDEV_POP(expr)
COVAR_SAMP
功能描述：返回一对表达式的样本方差 SQRT(VOVAR_SAMP(expr)) = STDDEV_SAMP(expr)

已使用 Microsoft OneNote 2016 创建。
