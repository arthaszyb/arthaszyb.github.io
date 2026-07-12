---
title: 朴素贝叶斯
date: '2017-08-10'
description: 使用scikit-learn的GaussianNB实现朴素贝叶斯分类器，包括模型训练、预测和准确度计算的示例代码。
category: ai
tags:
  - python
  - machine-learning
draft: false
source: evernote-local-db
lang: zh
---
朴素贝叶斯属于贝叶斯算法中的一个分支，是一种用于分类的监督学习算法。在scikit-learn中，可用`sklearn.naive_bayes.GaussianNB`实现。

应用流程分为三个步骤：

1. 实例化算法模块
2. 样本训练（fit）
3. 预测（predict）并计算准确度（score，需提供test数据的实际标签）

基本示例：

```python
import numpy as np
from sklearn.naive_bayes import GaussianNB

X = np.array([[-1, -1], [-2, -1], [-3, -2], [1, 1], [2, 1], [3, 2]])
Y = np.array([1, 1, 1, 2, 2, 2])

clf = GaussianNB()
clf.fit(X, Y)
print(clf.predict([[-0.8, -1]]))
# [1]
```

包含测试准确度的示例：

```python
def NBAccuracy(features_train, labels_train, features_test, labels_test):
    """compute the accuracy of your Naive Bayes classifier"""
    from sklearn.naive_bayes import GaussianNB
    clf = GaussianNB()
    clf.fit(features_train, labels_train)
    pred = clf.predict(features_train)
    accuracy = clf.score(features_test, labels_test)
    return accuracy
```

计算预测准确度还可以直接用预测值与实际标签对比。
