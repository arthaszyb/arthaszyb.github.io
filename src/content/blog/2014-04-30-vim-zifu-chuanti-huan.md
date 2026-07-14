---
title: vim 字符串替换
date: '2014-04-30'
description: vim 中 :s 命令替换字符串的多种写法：行内/全文替换、指定行范围、更换分隔符，以及删除 Windows 换行符 ^M 的方法。
category: shell
tags:
  - vim
draft: false
source: evernote-local-db
lang: zh
---
vi/vim 中用 `:s` 命令替换字符串。记录几种写法方便查询。

## 基本替换

```text
:s/vivian/sky/      替换当前行第一个 vivian 为 sky
:s/vivian/sky/g     替换当前行所有 vivian 为 sky
:n,$s/vivian/sky/   替换第 n 行到最后一行每行第一个 vivian
:n,$s/vivian/sky/g  替换第 n 行到最后一行每行所有 vivian
:%s/vivian/sky/     替换每行第一个 vivian（等同 :g/vivian/s//sky/）
:%s/vivian/sky/g    替换每行所有 vivian（等同 :g/vivian/s//sky/g）
```

n 为数字，若 n 为 `.` 表示从当前行开始到最后一行。

## 更换分隔符

当替换内容含 `/` 时，可用 `#`、`+` 等作分隔符：

```text
:s#vivian/#sky/#                   用 # 作分隔符
:%s+/oradata/apras/+/user01/apras1+  用 + 作分隔符
```

## 删除文本中的 ^M

Windows 用回车换行（0D0A），Linux 用回车（0A），Windows 文件拷到 Unix 常带 `^M`。删除方法：

```text
cat filename1 | tr -d "^V^M" > newfile
sed -e "s/^V^M//" filename > outputfilename
# 在 vi 中：%s/^V^M//   或   :%s/^M$//g
```

注意 `^V` 和 `^M` 指 Ctrl+V 和 Ctrl+M，需手工输入而非粘贴。

## :s 命令小结

g 放命令末尾表示替换每次出现；不加 g 只替换首次出现；g 放命令开头（如 `:g/str1/s//str2/g`）表示对所有包含搜索串的行进行替换。
