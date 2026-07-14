---
title: CentOS 环境下 MySQL-python 安装过程
date: '2014-07-22'
description: CentOS 下编译安装 MySQL-python 驱动的完整步骤及常见问题解决。
category: python
tags:
  - mysql
  - python
draft: false
source: evernote-local-db
lang: zh
origin_url: http://lihuipeng.blog.51cto.com/3064864/887967
---

## 下载与基本配置

1. 下载 MySQL-python

```bash
# 从 https://sourceforge.net/projects/mysql-python/ 下载
tar xvf MySQL-python-1.2.3.tar.gz
cd MySQL-python-1.2.3
vi site.cfg
```

编辑 site.cfg，取消注释并配置 mysql_config 路径：

```ini
mysql_config = /usr/local/mysql/bin/mysql_config
```

## 依赖安装

首次运行 `python setup.py build` 通常会报缺失依赖错误。安装必要包：

```bash
yum install -y mysql-devel* python-devel
```

## 处理 setuptools 缺失

若报 `ImportError: No module named setuptools`，先装 setuptools：

```bash
wget http://pypi.python.org/packages/source/s/setuptools/setuptools-0.6c11.tar.gz
tar zxvf setuptools-0.6c11.tar.gz
cd setuptools-0.6c11
python setup.py build
python setup.py install
```

返回 MySQL-python 目录继续安装。

## 编译与安装

```bash
python setup.py build
python setup.py install
```

## 验证

```bash
python -c "import MySQLdb"
```

若有重复导入警告，删除源目录再测试即可。

## 快速脚本

```bash
#!/bin/bash
cfpath=$(whereis mysql_config | awk '{print $2}')
echo "mysql_config = $cfpath" >> site.cfg
yum install -y mysql-devel* python-devel
python setup.py build && python setup.py install
if python -c "import MySQLdb" > /dev/null; then
  exit 0
else
  exit 1
fi
```

## 版本差异

- Python 2：使用 `MySQLdb` 模块
- Python 3：使用 `mysql-connector-python`，安装方式相同（解压、build、install 三步）
