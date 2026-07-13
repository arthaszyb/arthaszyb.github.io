---
title: 多态和封装
date: '2017-07-21'
description: Python 中的多态体现在参数类型不受限制，同一操作在不同对象上产生不同结果。封装通过私有化（双下划线前缀）隐藏属性，使用 property 装饰器提供访问接口。
category: python
tags:
  - python
draft: false
source: evernote-local-db
lang: zh
origin_url: http://wiki.jikexueyuan.com/project/start-learning-python/211.html
---

## 多态

多态指相同的操作或讯息在不同对象上产生不同的行为。Python 中的多态体现在对参数类型不做限制。

```python
>>> "This is a book".count("s")
2
>>> [1,2,4,3,5,3].count(3)
2
```

同样的 `count()` 方法作用在字符串和列表上，处理逻辑不同但都能正常工作。

```python
>>> f = lambda x,y: x+y
>>> f(2, 3)
5
>>> f("qiw", "sir")
'qiwsir'
>>> f(["python","java"], ["c++","lisp"])
['python', 'java', 'c++', 'lisp']
```

`lambda` 函数对参数类型无限制，`+` 操作符根据对象类型而异。这就是多态。

### 鸭子类型

在 Python 中，"如果它走起来像鸭子、游泳起来像鸭子、叫起来也像鸭子，那就把它当作鸭子"。即：一个对象的有效语义由其当前的方法和属性决定，而不是由其类型。

### 继承中的多态

```python
#!/usr/bin/env python
# coding=utf-8
__metaclass__ = type

class Animal:
    def __init__(self, name=""):
        self.name = name
    def talk(self):
        pass

class Cat(Animal):
    def talk(self):
        print "Meow!"

class Dog(Animal):
    def talk(self):
        print "Woof!"

a = Animal()
a.talk()
c = Cat("Missy")
c.talk()
d = Dog("Rocky")
d.talk()
```

输出：
```text
Meow!
Woof!
```

同一个 `talk()` 方法在不同子类中有不同的实现。

## 封装和私有化

封装是将某些部分隐藏起来，使程序外部无法调用。Python 中使用双下划线前缀来私有化属性和方法。

```python
#!/usr/bin/env python
# coding=utf-8
__metaclass__ = type

class ProtectMe:
    def __init__(self):
        self.me = "qiwsir"
        self.__name = "kivi"
    def __python(self):
        print "I love Python."
    def code(self):
        print "Which language do you like?"
        self.__python()

if __name__ == "__main__":
    p = ProtectMe()
    print p.me
    print p.__name  # AttributeError: 'ProtectMe' object has no attribute '__name'
```

类内部可以调用私有方法，但类外部无法访问。

### 使用 property 访问私有属性

```python
#!/usr/bin/env python
# coding=utf-8
__metaclass__ = type

class ProtectMe:
    def __init__(self):
        self.me = "qiwsir"
        self.__name = "kivi"
    @property
    def name(self):
        return self.__name

if __name__ == "__main__":
    p = ProtectMe()
    print p.name  # kivi
```

使用 `@property` 装饰器可以以属性的形式访问私有属性，实现受控访问。
