---
title: "shell脚本分析 nginx日志访问次数最多及最耗时的页面(慢查询）"
date: 2015-09-09 18:51:20 +0000
categories: ["Nginx [2]"]
tags: ["Pages"]
description: "Wednesday, September 9, 2015 6:51 PM shell 脚本分析 nginx 日志访问次数最多及最耗时的页面 ( 慢查询） 当服务器压力比较大，跑起来很费力时候。我们经常做站点页面优化，会去查找那些页面访问次数比较多，而且比较费时。 找到那些访问次数高，并且比较耗时的地址，就行相关优化，会"
source: "evernote-local-db"
---

shell脚本分析 nginx日志访问次数最多及最耗时的页面(慢查询）
Wednesday, September 9, 2015
6:51 PM
shell
脚本分析

nginx
日志访问次数最多及最耗时的页面
(
慢查询）
当服务器压力比较大，跑起来很费力时候。我们经常做站点页面优化，会去查找那些页面访问次数比较多，而且比较费时。

找到那些访问次数高，并且比较耗时的地址，就行相关优化，会取得立竿见影的效果的。

下面是我在做优化时候，经常用到的一段
shell

脚本。

这个也可以算是，统计
web
页面的
slowpage

慢访问页面，象
mysql slowquery

。

以下是我的：
nginx

配制

log_format main '$remote_addr - $remote_user [$time_local] $request '

'"$status" $body_bytes_sent "$http_referer" '

'"$http_user_agent" "$http_x_forwarded_for" $request_time';
access_log /var/log
ginx/access.log main buffer=32k;

从上面配置，可以看到：
ip
在

第一列，页面耗时是在最后一列，中间用空格分隔。

因此在
awk

中，分别可以用：
$1

$NF

读取到当前值。

其中
NF
是常量，代表整个列数。

下面是分析代码的
shell
文件，可以存为
slow.sh

#!/bin/sh
export PATH=/usr/bin:/bin:/usr/local/bin:/usr/X11R6/bin;

export LANG=zh_CN.GB2312;
function usage()

{

echo "$0 filelog options";

exit 1;

}
function slowlog()

{

#set -x;

field=$2;

files=$1;

end=2;

msg="";
[[ $2 == '1' ]]
&
&
field=1
&
&
end=2
&
&
msg="
总访问次数统计
";

[[ $2 == '2' ]]
&
&
field=3
&
&
end=4
&
&
msg="
平均访问时间统计
";
echo -e "\r\n\r\n";

echo -n "$msg";

seq -s '#' 30 | sed -e 's/[0-9]*//g';
awk '{split($7,bbb,"?");arr[bbb[1]]=arr[bbb[1]]+$NF; arr2[bbb[1]]=arr2[bbb[1]]+1; } END{for ( i in arr ) { print i":"arr2[i]":"arr[i]":"arr[i]/arr2[i]}}' $1 | sort -t: +$field -$end -rn |grep "pages" |head -30 | sed 's/:/\t/g'

}
[[ $#
<
2 ]]
&
&
usage;
slowlog $1 $2;

只需要执行：
slow.sh

日志文件
1
或者
2

1
：三十条访问最平凡的页面

2
：三十条访问最耗时的页面

执行结果如下：
chmod +x ./slow.sh
chmod +x slow.sh

./slow.sh /var/log
ginx/

./slow.sh /var/log
ginx/access.log 2

平均访问时间统计
#############################

/pages/########1.php 4 120.456 30.114

/pages/########2.php 1 16.161 16.161

/pages/########3.php 212 1122.49 5.29475
/pages/########4.php 6 28.645 4.77417

已使用 Microsoft OneNote 2016 创建。
