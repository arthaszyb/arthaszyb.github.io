---
title: "git克隆远程仓库并在本地修改提交 - 个人文章 - SegmentFault 思否"
date: 2018-08-13 12:13:13 +0000
categories: ["其他"]
tags: []
description: " SegmentFault 首页 问答 专栏 讲堂 发现  立即登录 免费注册 huangsh 1月28日 · 623 次阅读 git克隆远程仓库并在本地修改提交 原 git 原 1.首先在远程github或码云创建新项目 2.复制远程仓库地址 3.打开git命令行窗口，执行命令 git clone https:/"
source: "evernote-local-db"
---


SegmentFault
首页
问答
专栏
讲堂

发现

立即登录
免费注册
huangsh

1月28日 · 623 次阅读
git克隆远程仓库并在本地修改提交
原

git

原
1.首先在远程github或码云创建新项目
2.复制远程仓库地址
3.打开git命令行窗口，执行命令
git clone

https://github.com/你自己的地...
当文件夹中出现.git时说明克隆成功
4.现在修改一下README.md文件，修改完之后可以用
git status
看下当前的状态
出现红色说明文件没有添加到暂存区，用
git add.
（注意add后边有一个点）可以将所有文件添加到暂存区
再使用
git commit -a -m'msg'
提交暂存区到仓库区(没有在暂存区中的也能提交，git commit -m只能把暂存区中的提交)
5.
git push -u origin master
上面命令将本地的master分支推送到origin主机，同时指定origin为默认主机，后面就可以不加任何参数使用git push了
6.当出现这个结果的时候，说明已经推送到你的远程仓库了

新浪微博
微信
Twitter
Facebook
你可能感兴趣的文章
GIT
aLogy
版本管理工具
git
git 常用命令
syaka
git
git 及其基本操作
Mr_zhang
git
Git常识命令
李岫霖
git
Git基本操作
江南一点雨
git
Git 图解、常用命令和廖雪峰教程笔记总结
唐成勇
git
Git 基础命令
wubt
git
常用Git命令使用教程
精进吧Aaron
教程
命令行
思维导图
git
评论
默认排序

时间排序
想在上方展示你的广告？
在 SegmentFault，学习技能、解决问题
每个月，我们帮助 1000 万的开发者解决各种各样的技术问题。并助力他们在技术能力、职业生涯、影响力上获得提升。
免费注册

立即登录
产品
热门问答
热门专栏
热门讲堂
最新活动
圈子
找工作
移动客户端
资源
每周精选
用户排行榜
徽章
帮助中心
声望与权限
社区服务中心
开发手册
商务
人才服务
企业培训
活动策划
广告投放
区块链解决方案
合作联系
关于
关于我们
加入我们
联系我们
关注
产品技术日志
社区运营日志
市场运营日志
团队日志
社区访谈
微信

新浪微博

Github

Twitter
条款
服务条款
内容许可

扫一扫下载 App
Copyright © 2011-2018 SegmentFault. 当前呈现版本 17.06.16
浙ICP备 15005796号-2

浙公网安备 33010602002000号
杭州堆栈科技有限公司版权所有
CDN 存储服务由

又拍云

赞助提供
移动版

桌面版
{"status": 1, "msg": "Successfully!"}
