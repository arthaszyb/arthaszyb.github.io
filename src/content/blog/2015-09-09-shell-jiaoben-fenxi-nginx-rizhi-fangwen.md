---
title: shell脚本分析 nginx日志访问次数最多及最耗时的页面(慢查询）
date: '2015-09-09'
description: >-
  编写 shell 脚本分析 nginx 日志，统计访问次数最多和最耗时的页面（慢查询）。用于服务器性能优化时识别高访问量和高耗时页面。
category: web-infra
tags:
  - nginx
  - mysql
  - shell-scripting
  - php
draft: false
source: evernote-local-db
lang: zh
---
shell 脚本分析 nginx 日志访问次数最多及最耗时的页面（慢查询）

当服务器压力较大时，我们经常需要做站点页面优化，找到那些访问次数高且耗时长的页面，进行相关优化。下面是这样一个常用的 shell 脚本，用于统计网页的慢访问页面（slowpage），类似于 mysql 的 slowquery。

## nginx 配置

```nginx
log_format main '$remote_addr - $remote_user [$time_local] $request '
'"$status" $body_bytes_sent "$http_referer" '
'"$http_user_agent" "$http_x_forwarded_for" $request_time';
access_log /var/log/nginx/access.log main buffer=32k;
```

从上面配置可以看到：ip 在第一列，页面耗时在最后一列，中间用空格分隔。因此在 awk 中，分别可以用 `$1` 和 `$NF` 读取到当前值。其中 NF 是常量，代表整个列数。

下面是分析代码的 shell 文件，可以存为 `slow.sh`：

```bash
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
[[ $2 == '1' ]] && field=1 && end=2 && msg="总访问次数统计";
[[ $2 == '2' ]] && field=3 && end=4 && msg="平均访问时间统计";
echo -e "\r\n\r\n";
echo -n "$msg";
seq -s '#' 30 | sed -e 's/[0-9]*//g';
awk '{split($7,bbb,"?");arr[bbb[1]]=arr[bbb[1]]+$NF; arr2[bbb[1]]=arr2[bbb[1]]+1; } END{for ( i in arr ) { print i":"arr2[i]":"arr[i]":"arr[i]/arr2[i]}}' $1 | sort -t: +$field -$end -rn |grep "pages" |head -30 | sed 's/:/\t/g'
}
```

执行用法：

```bash
[[ $# < 2 ]] && usage;
slowlog $1 $2;
```

只需要执行：

```bash
slow.sh <日志文件> <选项>
```

其中：
- `1` - 查询访问最频繁的30个页面
- `2` - 查询访问最耗时的30个页面

执行结果示例：

```bash
chmod +x slow.sh
./slow.sh /var/log/nginx/access.log 2
```

```text
平均访问时间统计
#############################
/pages/########1.php 4 120.456 30.114
/pages/########2.php 1 16.161 16.161
/pages/########3.php 212 1122.49 5.29475
/pages/########4.php 6 28.645 4.77417
```
