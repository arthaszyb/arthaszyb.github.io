---
title: "mysql使用binlog恢复数据"
date: 2014-08-21 09:29:47 +0000
categories: ["MySQL [2]"]
tags: ["Pages"]
description: "Thursday, August 21, 2014 9:29 AM ###############################方法一############################ #!/bin/bash mpath=\"/data1/mysql5022_3306/binlog\" for ((a=989;a "
source: "evernote-local-db"
---

mysql使用binlog恢复数据
Thursday, August 21, 2014
9:29 AM
###############################方法一############################
#!/bin/bash
mpath="/data1/mysql5022_3306/binlog"

for ((a=989;a
<
1360;a++))

do

if [[ $a -lt 1000 ]];then

b="0$a"

else

b=$a

fi

filename="${mpath}/mysql-log.00${b}"

if [[ -f $filename ]];then

echo "$filename"
#mysqlbinlog ${filename} >temp.log
#由于之上语句没有指定临时文件目录，所以大量临时数据会产生在/tmp下，容易引起磁盘爆满。使用下句：
mysqlbinlog --local-load=/data1/mysql5022_3306/tmp ${filename} >temp.log
cat temp.log|grep "version_property" >>result.log

fi

done

########################方法二##########################
#!/usr/bin/perl

#################################################################

#parse_binlog.pl: find proper mysql binlog file and print lines

# match a giving regex.

#Author: Curu Wong

#License: GPL v2

#Date: 2012-10-31

#################################################################

use strict;

use warnings;

use
File::Glob
':glob';

use
File::stat
;

use Getopt::Long;

sub parse_time{

my $time_str = shift;

my $ts = qx(date -d "$time_str" +%s);

return $ts;

}

#return file atime and mtime

sub get_amtime{

my $file = shift;

my $stat = stat($file);

return ($stat->atime,$stat->mtime);

}

sub select_binlog_files{

#$logbin is mysql --log-bin param

my $logbin = shift;

my $time_start = shift;

my $time_end = shift;

my @result;

my @files = bsd_glob("$logbin.[0-9]*");

for my $f (@files){

my ($atime, $mtime) = get_amtime($f);

push @result, $f if ($mtime >= $time_start
&
&
$atime
<
= $time_end);

}

return @result;

}

sub get_sql_from_binlog{

my $time_start = shift;

my $time_end = shift;

my $db = shift;

my $tbl = shift;

my @binlogfiles = @_;

my $mysqlbinlog_cmd="mysqlbinlog --start-datetime='$time_start' --stop-datetime='$time_end' @binlogfiles";

print STDERR "$mysqlbinlog_cmd\n";

open(my $BINLOG, "$mysqlbinlog_cmd|")

or die "unable to run mysqlbinlog:$!";

#separate record by binlog header

my $record_sep = "# at ";

local $/ = "\n$record_sep";

my $cur_db = "";

my $use_db = 0;

print '*' x 80,"\n";

print "db:$db, tbl:$tbl\n";

print '*' x 80,"\n";

my @tbl_regex = (

qr/^\s*CREATE\s+(?:TEMPORARY)?\s*TABLE\s*(?:IF\s+NOT\s+EXISTS)?\s*`?\b$tbl\b'?/i,

qr/^\s*ALTER\s+(?:IGNORE)?\s*TABLE\s+`?\b$tbl\b`?/i,

qr/^\s*(?:CREATE|DROP).+?\s+INDEX\s+.*?\s+ON\s+`?\b$tbl\b`?/i,

qr/^\s*DROP\s+(?:TEMPORARY)?\s*TABLE\s+.*?`?\b$tbl\b`?/i,

qr/^\s*RENAME\s+TABLE.*?\b$tbl\b/i,

qr/^\s*TRUNCATE\s+(?:TABLE)?\s*`?\b$tbl\b`?/i,

qr/^\s*DELETE.*?\s+FROM\s+`?\b$tbl\b`?/i,

qr/^\s*(?:INSERT|REPLACE)\s+(?:LOW_PRIORITY|DELAYED|HIGH_PRIORITY)?(?:\s+IGNORE)?(?:INTO\s+)?\s*`?\b$tbl\b`?/i,

qr/^\s*LOAD\s+DATA.*?INTO\s+TABLE\s+`?\b$tbl\b`?/i,

qr/^\s*UPDATE\s+.*?`?\b$tbl\b`?/i,

);

while(my $record =
<
$BINLOG>){

#skip next 2 line

$record = substr($record, index($record, "\n") + 1);

$record = substr($record, index($record, "\n") + 1);

my @statements = split /;\n/, $record;

for my $stmt (@statements){

if($stmt =~ /use\s+`?(\S+)`?/){

$cur_db = $1;

$use_db = 1;

}

next if($db
&
&
($db ne $cur_db));

if($use_db){

$use_db = 0;

print "$stmt;\n";

next;

}

print "$stmt;\n" if (!$tbl or grep { $stmt =~ m/$_/ } @tbl_regex);

}

}

close($BINLOG);

}

sub usage{

print "Usage: $0 [-i]
<
log-bin>
<
start_time>
<
stop_time>
<
db_name> [tbl_name]\n";

print "eg:\n";

print " $0 /var/lib/mysql/mysql-bin '2012-10-20 00:00:00' '2012-10-21 00:00:00' 'd_qqpcmgr_crash_raw'\n";

print "\n";

print "Note:
<
start_time> or
<
stop_time> must be in valid mysql DATETIME or TIMESTAMP format\n";

print " use -i option to ignore case in
<
regex>\n";

print "
<
log-bin> is the full file prefix of mysql binlog,not just filename prefix\n";

exit(1);

}

#main

my $ignore_case = 0;

#parse options

GetOptions('help|h' => \
&
usage,

);

if(@ARGV
<
5){

usage();

}

my ($dir, $time_start, $time_end, $db, $tbl) = @ARGV;

my @binlog = select_binlog_files($dir, parse_time($time_start), parse_time($time_end));

get_sql_from_binlog($time_start, $time_end, $db, $tbl, @binlog);

已使用 Microsoft OneNote 2016 创建。
