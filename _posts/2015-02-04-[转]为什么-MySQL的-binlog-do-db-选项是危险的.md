---
title: "[转]为什么 MySQL的 binlog-do-db 选项是危险的"
date: 2015-02-04 16:15:00 +0000
categories: ["MySQL [2]"]
tags: ["Pages"]
description: "Wednesday, February 4, 2015 4:15 PM 大 | 中 | 小 [ 2009/10/19 10:09 | by ipaddr ] 原文 : http://www.mysqlperformanceblog.com/2009/05/14/why-mysqls-binlog-do-db-optio"
source: "evernote-local-db"
---

[转]为什么 MySQL的 binlog-do-db 选项是危险的
Wednesday, February 4, 2015
4:15 PM

[转]为什么 MySQL的 binlog-do-db 选项是危险的
大 | 中 | 小
[
2009/10/19 10:09 | by
ipaddr
]
原文
:
http://www.mysqlperformanceblog.com/2009/05/14/why-mysqls-binlog-do-db-option-is-dangerous/
作者:
Baron Schwartz
Why MySQL’s binlog-do-db option is dangerous
为什么 MySQL的 binlog-do-db 选项是危险的.
I see a lot of people filtering replication with binlog-do-db, binlog-ignore-db, replicate-do-db, and replicate-ignore-db. Although there are uses for these, they are dangerous and in my opinion, they are overused. For many cases, there's a safer alternative.
我发现很多人通过 binlog-do-db, binlog-ignore-db, replicate-do-db 和 replicate-ignore-db 来过滤复制(某些数据库), 尽管有些使用, 但是,在我看来,他们是危险的,并且他们被滥用了. 对于很多的实例,有更安全的替换方案.
The danger is simple: they don't work the way you think they do. Consider the following scenario: you set binlog-ignore-db to "garbage" so data in the garbage database (which doesn't exist on the slave) isn't replicated. (I'll come back to this in a second, so if you already see the problem, don't rush to the comment form.)
为什么危险很简单: 他们并不像你想的那样工作. 想象如下的场景: 你设置了 binlog-ignore-db = garbage, 所以 garbage数据库(在slave上不存在这个数据库) 中的数据不会被复制,(待会儿我再讲这个，如果你已经发现问题了，不要急于到评论表单)
Now you do the following:
现在做下面的事情:
$ mysql

mysql> delete from garbage.junk;

mysql> use garbage;

mysql> update production.users set disabled = 1 where user = "root";
You just broke replication, twice. Once, because your slave is going to execute the first query and there's no such table "garbage.junk" on the slave. The second time,
silently
, because the update to production.users isn't replicated, so now the root user isn't disabled on the slave.
复制会broke2次, 第一次，因为 slave尝试着去之西你给第一条语句，但是slave上并没有这样的表"garbage.junk" , 第二次, 隐含的, 因为 对 production.users不会被 复制,因为 root帐号并没有在slave上被禁用掉.
Why? Because binlog-ignore-db doesn't do what you think. The phrase I used earlier, "data in the garbage database isn't replicated," is a fallacy. That's not what it does. In fact, it
filters out binary logging for statements issued from connections whose default database is "garbage."
In other words, filtering is not based on the contents of the query -- it is based on what database you USE.
为什么? 因为 binlog-ignore-db 并不像你想的那样执行, 我之前说的, "在garbage数据库中的数据不会被复制" 是错的, 实际上(数据库)并没有这么做.事实上, 他是通过默认的数据库为“garbage" 的连接, 过滤二进制的(SQL)语句日志的. 换句话说, 过滤不是基于 查询的字符串的, 而实际于你used的数据库.
The other configuration options I mentioned work similarly. The binlog-do-db and binlog-ignore-db statements are particularly dangerous because they keep statements from ever being written to the binary log, which means you can't use the binary log for point-in-time recovery of your data from a backup.
其他我提到的配置选项也都类似. binlog-do-db 和 binlog-ignore-db 语句是特别危险的，因为他们将语句写入了二进制日志. 意味着你不能使用二进制日志从备份恢复指定时间的数据.
In a carefully controlled environment, these options can have benefits, but I won't talk about that here. (We covered that in
our book
.)
在严格控制的环境中, 这些选项是很有用的，但是我不会谈论这些(这些包含在我们的书中),
The safer alternative is to configure filters on the slave, with options that actually operate on the tables mentioned in the query itself. These are replicate-wild-* options. For example, the safer way to avoid replicating data in the garbage database is to configure replicate-wild-ignore-table=garbage.%. There are still edge cases where that won't work, but it works in more cases and has fewer gotchas.
安全的替换方案是 在 slave上配置过滤, 使用基于查询中真正涉及到的表的选项, 这些是: replicate-wild-* 选项, 例如, 避免复制 garbage数据库中的数据的安全的方案是 配置: replicate-wild-ignore-table=garbage.%. 这样做仍然有一些特殊的情况, 不能正常工作,但可以在更多的情况下正常工作,并且会遇到更少的意外 (gotchas).
If you are confused, you should read the
replication rules section of the manual
until you know it by heart
如果你有些疑惑了
,
你应该去读一读
手册上的复制规则一节
,
直到你真正明白为止
.

已使用 Microsoft OneNote 2016 创建。
