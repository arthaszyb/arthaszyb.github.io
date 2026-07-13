---
title: git 克隆远程仓库并在本地修改提交
date: '2018-08-13'
description: 克隆远程 git 仓库到本地，修改文件，提交变更并推送到远程仓库的步骤说明。
category: misc
tags:
  - git
draft: false
source: evernote-local-db
lang: zh
origin_url: https://segmentfault.com
---

git 克隆、修改和提交的基本流程。

## 步骤

1. 在 GitHub 或码云创建新项目，复制远程仓库地址

2. 克隆仓库到本地：

```bash
git clone https://github.com/your-repo-url
```

   当文件夹中出现 .git 时说明克隆成功。

3. 修改文件（如 README.md）后，检查状态：

```bash
git status
```

   出现红色表示文件未添加到暂存区。

4. 添加所有文件到暂存区：

```bash
git add .
```

5. 提交到仓库区：

```bash
git commit -a -m 'your message'
```

   （`git commit -a` 可提交所有修改，`git commit -m` 仅提交暂存区的文件）

6. 推送到远程仓库：

```bash
git push -u origin master
```

   `-u` 指定 origin 为默认主机，后续可直接使用 `git push`。
