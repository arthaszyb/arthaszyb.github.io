---
title: 一些不为人知的 Linux 命令
date: '2014-05-06'
description: 汇总一批实用但不太为人熟知的 Linux 命令，涵盖文本处理、数据操作、文件与二进制查看、网络调试和系统统计等场景。
category: linux
tags:
  - linux-admin
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---
一批实用但不太为人熟知（或很常见）的 Linux 命令：

- **xargs / parallel**：并行运行程序，选项丰富
- **sed / awk**：处理文本文件，比 Python 和 Ruby 还快
- **m4**：简单的宏处理命令
- **screen**：终端复用和会话持久工具
- **yes**：重复输出字符串
- **cal**：漂亮的日历
- **env**：运行一个命令，脚本中很有用
- **look**：查找以某字符串开头的英文单词
- **cut / paste / join**：数据操作命令
- **fmt**：格式化文本段
- **pr**：以页/列为单位格式化文本或大文件
- **fold**：使文本换行
- **column**：格式化文本成列或表格
- **expand / unexpand**：在制表符和空格间转换
- **nl**：添加行号；**seq**：打印行号
- **bc**：计算器；**factor**：输出整数的质因数
- **nc**：网络调试和数据传输
- **dd**：在文件和设备间移动数据
- **file**：判断文件类型；**stat**：查看文件状态
- **tac**：从最后一行倒序输出（与 cat 相反）
- **shuf**：对文件按行随机选择
- **comm**：按行比较有序文件
- **hd / bvi**：输出或编辑二进制文件；**strings**：查看二进制中的可见字符串
- **tr**：字符翻译或操作
- **iconv / uconv**：转换字符编码
- **split / csplit**：划分文件
- **7z**：高压缩率压缩
- **ldd**：查看动态库依赖；**nm**：查看目标文件符号表
- **ab**：网站服务器压力测试
- **strace**：调试系统调用
- **mtr**：路由跟踪；**cssh**：可视的并发 shell
- **wireshark / tshark**：数据包捕获和网络调试
- **host / dig**：查找 DNS
- **lsof**：查看进程文件描述符和 socket
- **dstat**：系统数据统计；**iostat**：CPU 和磁盘使用统计
- **htop**：top 的改进版
- **last**：登录历史；**w**：当前登录用户；**id**：查看用户/组信息
- **sar**：查看历史系统统计数据
- **iftop / nethogs**：查看 socket 或进程的网络利用率
- **ss**：查看网络统计信息
- **dmesg**：启动或系统错误信息
- **hdparm**：显示或设定磁盘参数
- **lsb_release**：查看发行版信息；**lshw**：查看硬件信息
- **fortune / ddate / sl**：取决于你是否觉得它们有用
