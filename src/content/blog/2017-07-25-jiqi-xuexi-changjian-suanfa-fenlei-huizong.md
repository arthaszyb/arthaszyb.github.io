---
title: 机器学习常见算法分类汇总
date: '2017-07-25'
description: 机器学习算法的分类体系整理，包括四种学习方式（监督、非监督、半监督、强化）和13类具体算法的概述。
category: ai
tags:
  - machine-learning
draft: false
origin_url: http://www.ctocio.com/hotnews/15919.html
source: evernote-local-db
lang: zh
---
## 学习方式

根据数据类型的不同，机器学习有多种学习方式。在建模和算法选择时，需要根据输入数据来选择最合适的算法。

### 监督式学习

输入数据称为"训练数据"，每组训练数据有明确的标识或结果。常见应用是分类问题和回归问题。常见算法包括：逻辑回归（Logistic Regression）、反向传递神经网络（Back Propagation Neural Network）。

### 非监督式学习

数据不被特别标识，学习模型推断数据的内在结构。常见应用包括关联规则学习和聚类。常见算法包括Apriori算法和k-Means算法。

### 半监督式学习

输入数据部分被标识，部分未被标识。模型首先学习数据的内在结构，再进行预测。应用包括分类和回归，常见算法包括图论推理算法（Graph Inference）和拉普拉斯支持向量机（Laplacian SVM）。

### 强化学习

输入数据直接反馈到模型，模型必须对反馈立刻作出调整。常见应用包括动态系统和机器人控制。常见算法包括Q-Learning和时间差学习（Temporal Difference Learning）。

在企业数据应用中，监督式学习和非监督式学习最常用。在图像识别等领域，由于存在大量未标识数据和少量可标识数据，半监督式学习是热门方向。强化学习更多应用在机器人控制等领域。

## 算法分类

根据算法的功能和形式的相似性进行分类。

### 回归算法

试图探索变量之间的关系。常见的回归算法包括：最小二乘法（Ordinary Least Square）、逻辑回归（Logistic Regression）、逐步式回归（Stepwise Regression）、多元自适应回归样条（Multivariate Adaptive Regression Splines）、本地散点平滑估计（Locally Estimated Scatterplot Smoothing）。

### 基于实例的算法

常用来对决策问题建立模型，也称为"赢家通吃"学习或"基于记忆的学习"。常见算法包括k-Nearest Neighbor（KNN）、学习矢量量化（Learning Vector Quantization，LVQ）、自组织映射算法（Self-Organizing Map，SOM）。

### 正则化方法

其他算法（通常是回归算法）的延伸，根据算法的复杂度进行调整。常见算法包括Ridge Regression、Least Absolute Shrinkage and Selection Operator（LASSO）、弹性网络（Elastic Net）。

### 决策树学习

根据数据的属性采用树状结构建立决策模型，用来解决分类和回归问题。常见算法包括：分类及回归树（Classification And Regression Tree，CART）、ID3（Iterative Dichotomiser 3）、C4.5、Chi-squared Automatic Interaction Detection（CHAID）、Decision Stump、随机森林（Random Forest）、多元自适应回归样条（MARS）、梯度推进机（Gradient Boosting Machine，GBM）。

### 贝叶斯方法

基于贝叶斯定理的一类算法，主要用来解决分类和回归问题。常见算法包括：朴素贝叶斯算法、平均单依赖估计（Averaged One-Dependence Estimators，AODE）、Bayesian Belief Network（BBN）。

### 基于核的算法

最著名的是支持向量机（SVM）。把输入数据映射到高阶向量空间，在高阶空间中分类或回归问题更容易解决。常见算法包括：支持向量机（Support Vector Machine，SVM）、径向基函数（Radial Basis Function，RBF）、线性判别分析（Linear Discriminate Analysis，LDA）。

### 聚类算法

按照中心点或分层的方式对输入数据进行归并，找到数据的内在结构。常见算法包括k-Means算法和期望最大化算法（Expectation Maximization，EM）。

### 关联规则学习

寻找最能解释数据变量之间关系的规则。常见算法包括Apriori算法和Eclat算法。

### 遗传算法

模拟生物繁殖的突变、交换和达尔文的自然选择。将问题的可能解编码为向量（个体），向量的每个元素称为基因，利用目标函数评价群体中的每个个体，根据适应度进行选择、交换、变异等遗传操作，得到新的群体。遗传算法适用于非常复杂和困难的环境。该研究已发展为人工智能的独立分支，代表人物为霍勒德（J.H.Holland）。

### 人工神经网络

模拟生物神经网络，是一类模式匹配算法，用于解决分类和回归问题。重要算法包括：感知器神经网络（Perceptron Neural Network）、反向传递（Back Propagation）、Hopfield网络、自组织映射（Self-Organizing Map，SOM）。

### 深度学习

对人工神经网络的发展。在计算能力日益廉价的今天，深度学习试图建立更大更复杂的神经网络。很多深度学习算法是半监督式学习算法，用于处理存在少量未标识数据的大数据集。常见算法包括：受限波尔兹曼机（Restricted Boltzmann Machine，RBN）、Deep Belief Networks（DBN）、卷积网络（Convolutional Network）、堆栈式自动编码器（Stacked Auto-encoders）。

### 降低维度算法

以非监督学习方式试图利用较少的信息来归纳或解释数据。可用于高维数据的可视化或简化数据以便监督式学习使用。常见算法包括：主成份分析（Principle Component Analysis，PCA）、偏最小二乘回归（Partial Least Square Regression，PLS）、Sammon映射、多维尺度（Multi-Dimensional Scaling，MDS）、投影追踪（Projection Pursuit）。

### 集成算法

用一些相对较弱的学习模型独立地就同样的样本进行训练，然后把结果整合起来进行整体预测。是一类非常强大且流行的算法。常见算法包括：Boosting、Bootstrapped Aggregation（Bagging）、AdaBoost、堆叠泛化（Stacked Generalization，Blending）、梯度推进机（Gradient Boosting Machine，GBM）、随机森林（Random Forest）、GBDT（Gradient Boosting Decision Tree）。
