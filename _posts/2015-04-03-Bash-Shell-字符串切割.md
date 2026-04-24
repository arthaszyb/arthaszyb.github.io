---
title: "Bash Shell 字符串切割"
date: 2015-04-03 03:20:18 +0000
categories: ["shell"]
tags: []
description: "分类： Shell编程 2011-07-06 14:09 801人阅读 评论 (0) 收藏 举报 bash shell chj@linux-xzlr:Desktop\\> AAA=\"hello First-of All\" chj@linux-xzlr:Desktop\\> echo ${AAA#*-} of All chj"
source: "evernote-local-db"
---

Bash Shell 字符串切割
分类：
Shell编程
2011-07-06 14:09

801人阅读

评论
(0)

收藏

举报
bash
shell
Bash Shell 字符串切割

chj@linux-xzlr:Desktop\> AAA="hello First-of All"

chj@linux-xzlr:Desktop\> echo ${AAA#*-}

of All

chj@linux-xzlr:Desktop\> AAA=111-222

chj@linux-xzlr:Desktop\> echo ${AAA%-*}

111

chj@linux-xzlr:Desktop\> echo ${AAA#*-}

222

chj@linux-xzlr:Desktop\>

记住瞬间，精彩永恒

==============================================================

1.

--------------------------------------------------------------

chj@linux-xzlr:trunk\> AA="a bc d ef"

chj@linux-xzlr:trunk\> BB="d"

chj@linux-xzlr:trunk\> echo ${AA%%$BB*}

a bc

chj@linux-xzlr:trunk\> echo ${AA$BB}

bash: ${AA$BB}: bad substitution

chj@linux-xzlr:trunk\> echo ${AA#*$BB}

ef

chj@linux-xzlr:trunk\>

==============================================================

2.

--------------------------------------------------------------

cjash@linux-sdik:dl\> AAA=abcdef

cjash@linux-sdik:dl\> echo ${AAA:2}

cdef

cjash@linux-sdik:dl\> echo ${AAA-2}

abcdef

cjash@linux-sdik:dl\> echo ${AAA:-2}

abcdef

cjash@linux-sdik:dl\> echo ${AAA#2}

abcdef

cjash@linux-sdik:dl\> echo ${AAA#*2}

abcdef

cjash@linux-sdik:dl\> echo ${AAA 2}

bash: ${AAA 2}: bad substitution

cjash@linux-sdik:dl\> echo ${AAA$2}

bash: ${AAA$2}: bad substitution

cjash@linux-sdik:dl\> echo ${AAA: -2}

ef

cjash@linux-sdik:dl\> echo ${AAA%2}

abcdef

cjash@linux-sdik:dl\> echo ${AAA#*2}

abcdef

cjash@linux-sdik:dl\> echo ${AAA::2}

ab

cjash@linux-sdik:dl\>

==============================================================

3.

--------------------------------------------------------------

cjash@linux-sdik:ppp\> AAA=abcabcabc

cjash@linux-sdik:ppp\> echo ${AAA%${AAA: -2}}

abcabca

cjash@linux-sdik:ppp\>

==============================================================

4.

--------------------------------------------------------------

cjash@linux-sdik:ppp\> AAA=abcabcabc

cjash@linux-sdik:ppp\> echo ${AAA%${AAA: -2}}

abcabca

cjash@linux-sdik:ppp\>

==============================================================

5.

--------------------------------------------------------------

==============================================================

6.

--------------------------------------------------------------

==============================================================

7.

--------------------------------------------------------------

==============================================================

8.

--------------------------------------------------------------

==============================================================

9.
--------------------------------------------------------------
shell里面
value="L(50000:10000)"

FORM_LONG_LEFT_TIME_TALK=$value

FORM_LONG_TIME_TALK=${FORM_LONG_LEFT_TIME_TALK%:*}

FORM_LONG_TIME_TALK=${FORM_LONG_TIME_TALK#*(}

FORM_LONG_TIME_TALK=`expr ${FORM_LONG_TIME_TALK} / 1000`

FORM_LEFT_TIME_TALK=${FORM_LONG_LEFT_TIME_TALK#*:}

FORM_LEFT_TIME_TALK=${FORM_LEFT_TIME_TALK%)*}

FORM_LEFT_TIME_TALK=`expr ${FORM_LEFT_TIME_TALK} / 1000`
