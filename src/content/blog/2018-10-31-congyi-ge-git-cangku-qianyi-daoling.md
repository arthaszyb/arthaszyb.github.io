---
title: git 仓库完整迁移
date: '2018-10-31'
description: 从一个 git 托管服务（如 GitHub）完整迁移仓库到另一个服务（如 GitCafe），保留所有历史记录。
category: misc
tags:
  - git
draft: false
source: evernote-local-db
lang: zh
---

从一个 git 托管服务完整迁移仓库到另一个服务，保留所有版本历史。

## 迁移步骤

1. 从原地址克隆一份裸版本库（以 GitHub 为例）：

```bash
git clone --bare git://github.com/username/project.git
```

   `--bare` 标志创建不包含工作区的裸版本库，直接包含版本库内容。

2. 在新的 Git 服务器上创建一个新项目（如 GitCafe）。

3. 以镜像推送方式上传代码到新服务器：

```bash
cd project.git
git push --mirror git@gitcafe.com/username/newproject.git
```

   `--mirror` 标志使裸版本库对上游版本库进行了注册，可以在裸版本库中使用 `git fetch` 命令进行持续同步。

4. 删除本地裸版本库：

```bash
cd ..
rm -rf project.git
```

5. 从新服务器找到 Clone 地址，克隆到本地：

```bash
git clone git@gitcafe.com/username/newproject.git
```

这种方式完整保留了原版本库中的所有内容和历史记录。
