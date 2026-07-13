---
title: Bash 中关于日期时间操作的常用自定义函数
date: '2014-07-03'
description: 编写 Bash 脚本时常用的日期时间函数库，包含日期计算、时间戳转换、闰年判断等实用工具函数。
category: linux
tags:
  - shell-scripting
  - crontab
draft: false
source: evernote-local-db
lang: zh
---

在编写 Linux Bash 脚本时，经常会用到一些日期时间有关的命令。下面是多年 Shell 编程中常用的函数整理。

附件包括三个文件：
- `datetime.sh` - 包含了 Bash 中关于日期时间操作的常用自定义函数
- `test_datetime.sh` - 用来展示 datetime.sh 中自定义函数的用法
- `test_datetime.txt` - test_datetime.sh 的一次执行输出样本

## 执行命令

```bash
./test_datetime.sh > test_datetime.txt
```

## 函数库 (datetime.sh)

```bash
#!/bin/sh

# Copyright (c) 2010 codingstandards. All rights reserved.
# file: datetime.sh
# description: Bash 中关于日期时间操作的常用自定义函数
# license: LGPL
# author: codingstandards
# email: codingstandards@gmail.com
# version: 1.0
# date: 2010.02.27

# 昨天
yesterday() {
    date --date='1 day ago' +%Y-%m-%d
}

# 今天
today() {
    date +%Y-%m-%d
}

# 现在，包括日期和时间、纳秒
# 比如：2010-02-27 11:29:52.991774000
now() {
    date "+%Y-%m-%d %H:%M:%S.%N"
}

# 当前时间，包括日期和时间
# 比如：2010-02-27 11:51:04
curtime() {
    date '+%Y-%m-%d %H:%M:%S'
    # 也可写成：date '+%F %T'
}

# 取上个月的年月
# 比如：2010-01
last_month() {
    date --date='1 month ago' '+%Y-%m'
}

# 取上个月的年月（紧凑格式）
# 比如：201001
last_month_packed() {
    date --date='1 month ago' '+%Y%m'
}

# 取上个月的第一天
# 比如本月是 2010 年 2 月，那么结果就是 2010-01-01
first_date_of_last_month() {
    date --date='1 month ago' '+%Y-%m-01'
}

# 取上个月的最后一天
# 比如当前是 2010 年 2 月，那么结果就是 2010-01-31
last_date_of_last_month() {
    date --date="$(date +%e) days ago" '+%Y-%m-%d'
}

# 今天的星期
# day of week (0..6); 0 represents Sunday
day_of_week() {
    date +%w
}

# 上个小时
# 比如：2010-02-27-10
# 适合处理 log4j 生成的日志文件名
last_hour() {
    date --date='1 hour ago' +%Y-%m-%d-%H
}

# 当前的小时，为方便算术比较，结果不以 0 开头
# 比如：12
the_hour() {
    date +%k
}

# 当前的分钟，为方便算术比较，结果不以 0 开头
the_minute() {
    MM=$(date +%M)
    echo $((1$MM - 100))
}

# 当前的秒数
the_second() {
    SS=$(date +%S)
    echo $((1$SS - 100))
}

# 当前的年份
the_year() {
    date +%Y
}

# 当前的月份，为方便算术比较，结果不以 0 开头
the_month() {
    M=$(date +%m)
    echo $((1$M - 100))
}

# 当前的日期，为方便算术比较，结果不以 0 开头
the_date() {
    date +%e
}

# 取 n 天前的日期
# 比如：days_ago 0 就是今天，days_ago 1 就是昨天，days_ago -1 就是明天
# 格式：2010-02-27
days_ago() {
    date --date="$1 days ago" +%Y-%m-%d
}

# 打印中文的日期和星期
# 比如：2 月 27 日 星期六
chinese_date_and_week() {
    WEEKDAYS=(星期日 星期一 星期二 星期三 星期四 星期五 星期六)
    WEEKDAY=$(date +%w)
    MN=1$(date +%m)
    MN=$((MN - 100))
    DN=1$(date +%d)
    DN=$((DN - 100))
    DT="$MN 月 $DN 日 ${WEEKDAYS[$WEEKDAY]}"
    echo "$DT"
}

# 随机数字，0-9
rand_digit() {
    S="$(date +%N)"
    echo "${S:5:1}"
}

# 获取指定日期的秒数（自 1970 年）
# 比如：seconds_of_date "2010-02-27" 返回 1267200000
seconds_of_date() {
    if [ "$1" ]; then
        date -d "$1 $2" +%s
    else
        date +%s
    fi
}

# 根据秒数（自 1970 年）得到日期
# 比如：date_of_seconds 1267200000 返回 2010-02-27
date_of_seconds() {
    date -d "1970-01-01 UTC $1 seconds" "+%Y-%m-%d"
}

# 根据秒数（自 1970 年）得到日期时间
# 比如：datetime_of_seconds 1267257201 返回 2010-02-27 15:53:21
datetime_of_seconds() {
    date -d "1970-01-01 UTC $1 seconds" "+%Y-%m-%d %H:%M:%S"
}

# 判断是否闰年
# 如果 yyyy 是闰年，退出码为 0；否则非 0
leap_year() {
    yy=$1
    isleap="false"

    if [ $((yy % 4)) -ne 0 ] ; then
        : # not a leap year
    elif [ $((yy % 400)) -eq 0 ] ; then
        isleap="true"
    elif [ $((yy % 100)) -eq 0 ] ; then
        : # not a leap year
    else
        isleap="true"
    fi

    if [ "$isleap" == "true" ]; then
        return 0
    else
        return 1
    fi
}

# 判断 yyyy-mm-dd 是否合法的日期
# 如果是，退出码为 0；否则非 0
validity_of_date() {
    yy=$1
    mm=$2
    dd=$3
    days=0

    # 检查月份是否合法
    if [ $mm -le 0 -o $mm -gt 12 ]; then
        return 1
    fi

    # 获取该月的天数
    case $mm in
    1|01) days=31;;
    2|02) days=28;;
    3|03) days=31;;
    4|04) days=30;;
    5|05) days=31;;
    6|06) days=30;;
    7|07) days=31;;
    8|08) days=31;;
    9|09) days=30;;
    10) days=31;;
    11) days=30;;
    12) days=31;;
    *) days=-1;;
    esac

    # 闰年 2 月有 29 天
    if [ $mm -eq 2 ]; then
        if [ $((yy % 4)) -ne 0 ] ; then
            : # not a leap year
        elif [ $((yy % 400)) -eq 0 ] ; then
            days=29
        elif [ $((yy % 100)) -eq 0 ] ; then
            : # not a leap year
        else
            days=29
        fi
    fi

    # 检查日期是否合法
    if [ $dd -le 0 -o $dd -gt $days ]; then
        return 3
    fi

    return 0
}

# 获取 yyyy 年 mm 月的天数
# 比如：days_of_month 2 2007 结果是 28
days_of_month() {
    mm=$1
    yy=$2
    days=0

    if [ $mm -le 0 -o $mm -gt 12 ]; then
        echo -1
        return 1
    fi

    case $mm in
    1|01) days=31;;
    2|02) days=28;;
    3|03) days=31;;
    4|04) days=30;;
    5|05) days=31;;
    6|06) days=30;;
    7|07) days=31;;
    8|08) days=31;;
    9|09) days=30;;
    10) days=31;;
    11) days=30;;
    12) days=31;;
    *) days=-1;;
    esac

    if [ $mm -eq 2 ]; then
        if [ $((yy % 4)) -ne 0 ] ; then
            : # not a leap year
        elif [ $((yy % 400)) -eq 0 ] ; then
            days=29
        elif [ $((yy % 100)) -eq 0 ] ; then
            : # not a leap year
        else
            days=29
        fi
    fi

    echo $days
}
```

## 测试脚本 (test_datetime.sh)

```bash
#!/bin/sh

# 注意：根据 datetime.sh 的实际位置更改路径
. /opt/shtools/commons/datetime.sh

echo "当前时间（date）：$(date)"
echo "昨天（yesterday）：$(yesterday)"
echo "今天（today）：$(today)"
echo "现在（now）：$(now)"
echo "现在（curtime）：$(curtime)"
echo "上月（last_month）：$(last_month)"
echo "上月（last_month_packed）：$(last_month_packed)"
echo "上月第一天（first_date_of_last_month）：$(first_date_of_last_month)"
echo "上月最后一天（last_date_of_last_month）：$(last_date_of_last_month)"
echo "今天星期几（day_of_week）：$(day_of_week)"
echo "上个小时（last_hour）：$(last_hour)"
echo "当前的小时（the_hour）：$(the_hour)"
echo "当前的分钟（the_minute）：$(the_minute)"
echo "当前的秒钟（the_second）：$(the_second)"
echo "当前的年份（the_year）：$(the_year)"
echo "当前的月份（the_month）：$(the_month)"
echo "当前的日期（the_date）：$(the_date)"
echo "前天（days_ago 2）：$(days_ago 2)"
echo "明天（days_ago -1）：$(days_ago -1)"
echo "后天（days_ago -2）：$(days_ago -2)"
echo "十天前的日期（days_ago 10）：$(days_ago 10)"
echo "中文的日期星期（chinese_date_and_week）：$(chinese_date_and_week)"
echo "随机数字（rand_digit）：$(rand_digit)"
echo "随机数字（rand_digit）：$(rand_digit)"
echo "自 1970 年来的秒数（seconds_of_date）：$(seconds_of_date)"
echo "自 1970 年来的秒数（seconds_of_date 2010-02-27）：$(seconds_of_date 2010-02-27)"
echo "自 1970 年来的秒数（seconds_of_date 2010-02-27 15:53:21）：$(seconds_of_date 2010-02-27 15:53:21)"
echo "自 1970 年来的秒数对应的日期（date_of_seconds 1267200000）：$(date_of_seconds 1267200000)"
echo "自 1970 年来的秒数对应的日期时间（datetime_of_seconds 1267257201）：$(datetime_of_seconds 1267257201)"

if leap_year 2010; then
    echo "2010 年是闰年"
fi

if leap_year 2008; then
    echo "2008 年是闰年"
fi

if validity_of_date 2007 02 03; then
    echo "2007 02 03 日期合法"
fi

if validity_of_date 2007 02 28; then
    echo "2007 02 28 日期合法"
fi

if validity_of_date 2007 02 29; then
    echo "2007 02 29 日期合法"
fi

if validity_of_date 2007 03 00; then
    echo "2007 03 00 日期合法"
fi

echo "2010 年 2 月的天数（days_of_month 2 2010）：$(days_of_month 2 2010)"
echo "2008 年 2 月的天数（days_of_month 2 2008）：$(days_of_month 2 2008)"
```

## 执行输出示例

```
当前时间（date）：六 2 月 27 15:58:28 CST 2010
昨天（yesterday）：2010-02-26
今天（today）：2010-02-27
现在（now）：2010-02-27 15:58:28.734817000
现在（curtime）：2010-02-27 15:58:28
上月（last_month）：2010-01
上月（last_month_packed）：201001
上月第一天（first_date_of_last_month）：2010-01-01
上月最后一天（last_date_of_last_month）：2010-01-31
今天星期几（day_of_week）：6
上个小时（last_hour）：2010-02-27-14
当前的小时（the_hour）：15
当前的分钟（the_minute）：58
当前的秒钟（the_second）：28
当前的年份（the_year）：2010
当前的月份（the_month）：2
当前的日期（the_date）：27
前天（days_ago 2）：2010-02-25
明天（days_ago -1）：2010-02-28
后天（days_ago -2）：2010-03-01
十天前的日期（days_ago 10）：2010-02-17
中文的日期星期（chinese_date_and_week）：2 月 27 日 星期六
随机数字（rand_digit）：5
随机数字（rand_digit）：9
自 1970 年来的秒数（seconds_of_date）：1267257508
自 1970 年来的秒数（seconds_of_date 2010-02-27）：1267200000
自 1970 年来的秒数（seconds_of_date 2010-02-27 15:53:21）：1267257201
自 1970 年来的秒数对应的日期（date_of_seconds 1267200000）：2010-02-27
自 1970 年来的秒数对应的日期时间（datetime_of_seconds 1267257201）：2010-02-27 15:53:21
2008 年是闰年
2007 02 03 日期合法
2007 02 28 日期合法
2010 年 2 月的天数（days_of_month 2 2010）：28
2008 年 2 月的天数（days_of_month 2 2008）：29
```
