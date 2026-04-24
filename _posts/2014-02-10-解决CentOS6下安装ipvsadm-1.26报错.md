---
title: "解决CentOS6下安装ipvsadm-1.26报错"
date: 2014-02-10 03:24:10 +0000
categories: ["HA&LB"]
tags: []
description: "这次在CentOS6.2中测试安装缺发现一点小问题，特意记录一下： ipvsadm-1.26.tar.gz (for kernel 2.6.28-rc3 or later) - February 8, 2011 [root@host2 ~]# uname -r 2.6.32-220.el6.x86_64 [root@h"
source: "evernote-local-db"
---

解决CentOS6下安装ipvsadm-1.26报错
这次在CentOS6.2中测试安装缺发现一点小问题，特意记录一下：
ipvsadm-1.26.tar.gz
(for kernel 2.6.28-rc3 or later) - February 8, 2011
[root@host2 ~]# uname -r
2.6.32-220.el6.x86_64
[root@host2 ~]# cat /etc/redhat-release
CentOS release 6.2 (Final)
[root@host2 ipvsadm-1.26]# make

make -C libipvs

make[1]: Entering directory `/usr/src/ipvsadm-1.26/libipvs'

gcc -Wall -Wunused -Wstrict-prototypes -g -fPIC -DLIBIPVS_USE_NL -DHAVE_NET_IP_VS_H -c -o libipvs.o libipvs.c

In file included from libipvs.h:13,

from libipvs.c:23:

ip_vs.h:15:29: error: netlink
etlink.h: No such file or directory

ip_vs.h:16:31: error: netlink/genl/genl.h: No such file or directory

ip_vs.h:17:31: error: netlink/genl/ctrl.h: No such file or directory

In file included from libipvs.h:13,

from libipvs.c:23:

ip_vs.h:520: error: array type has incomplete element type

ip_vs.h:521: error: array type has incomplete element type

ip_vs.h:522: error: array type has incomplete element type

ip_vs.h:523: error: array type has incomplete element type

ip_vs.h:524: error: array type has incomplete element type

ip_vs.h:525: error: array type has incomplete element type

libipvs.c: In function ‘ipvs_nl_message’:

libipvs.c:57: warning: implicit declaration of function ‘nlmsg_alloc’

libipvs.c:57: warning: assignment makes pointer from integer without a cast

libipvs.c:61: warning: implicit declaration of function ‘genlmsg_put’

libipvs.c:61: error: ‘NL_AUTO_PID’ undeclared (first use in this function)

libipvs.c:61: error: (Each undeclared identifier is reported only once

libipvs.c:61: error: for each function it appears in.)

libipvs.c:61: error: ‘NL_AUTO_SEQ’ undeclared (first use in this function)

libipvs.c: In function ‘ipvs_nl_noop_cb’:

libipvs.c:69: error: ‘NL_OK’ undeclared (first use in this function)

libipvs.c: At top level:

libipvs.c:72: error: expected declaration specifiers or ‘...’ before ‘nl_recvmsg_msg_cb_t’

libipvs.c: In function ‘ipvs_nl_send_message’:

libipvs.c:76: warning: implicit declaration of function ‘nl_handle_alloc’

libipvs.c:76: warning: assignment makes pointer from integer without a cast

libipvs.c:78: warning: implicit declaration of function ‘nlmsg_free’

libipvs.c:82: warning: implicit declaration of function ‘genl_connect’

libipvs.c:85: warning: implicit declaration of function ‘genl_ctrl_resolve’

libipvs.c:91: warning: implicit declaration of function ‘nl_handle_destroy’

libipvs.c:96: warning: implicit declaration of function ‘nl_socket_modify_cb’

libipvs.c:96: error: ‘NL_CB_VALID’ undeclared (first use in this function)

libipvs.c:96: error: ‘NL_CB_CUSTOM’ undeclared (first use in this function)

libipvs.c:96: error: ‘func’ undeclared (first use in this function)

libipvs.c:99: warning: implicit declaration of function ‘nl_send_auto_complete’

libipvs.c:102: warning: implicit declaration of function ‘nl_recvmsgs_default’

libipvs.c: In function ‘ipvs_init’:

libipvs.c:127: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_getinfo_parse_cb’:

libipvs.c:149: warning: implicit declaration of function ‘nlmsg_hdr’

libipvs.c:149: warning: initialization makes pointer from integer without a cast

libipvs.c:152: warning: implicit declaration of function ‘genlmsg_parse’

libipvs.c:159: warning: implicit declaration of function ‘nla_get_u32’

libipvs.c:162: error: ‘NL_OK’ undeclared (first use in this function)

libipvs.c: In function ‘ipvs_getinfo’:

libipvs.c:176: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_flush’:

libipvs.c:199: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_nl_fill_service_attr’:

libipvs.c:215: warning: implicit declaration of function ‘nla_nest_start’

libipvs.c:215: warning: assignment makes pointer from integer without a cast

libipvs.c:219: warning: implicit declaration of function ‘NLA_PUT_U16’

libipvs.c:222: warning: implicit declaration of function ‘NLA_PUT_U32’

libipvs.c:225: warning: implicit declaration of function ‘NLA_PUT’

libipvs.c:229: warning: implicit declaration of function ‘NLA_PUT_STRING’

libipvs.c:236: warning: implicit declaration of function ‘nla_nest_end’

libipvs.c:239: warning: label ‘nla_put_failure’ defined but not used

libipvs.c: In function ‘ipvs_add_service’:

libipvs.c:255: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_update_service’:

libipvs.c:276: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_del_service’:

libipvs.c:296: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_zero_service’:

libipvs.c:321: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_nl_fill_dest_attr’:

libipvs.c:334: warning: assignment makes pointer from integer without a cast

libipvs.c:348: warning: label ‘nla_put_failure’ defined but not used

libipvs.c: In function ‘ipvs_add_dest’:

libipvs.c:366: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_update_dest’:

libipvs.c:396: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_del_dest’:

libipvs.c:425: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_set_timeout’:

libipvs.c:452: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c:454: warning: label ‘nla_put_failure’ defined but not used

libipvs.c: In function ‘ipvs_start_daemon’:

libipvs.c:473: warning: assignment makes pointer from integer without a cast

libipvs.c:483: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_stop_daemon’:

libipvs.c:504: warning: assignment makes pointer from integer without a cast

libipvs.c:514: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: At top level:

libipvs.c:526: warning: ‘struct nlattr’ declared inside parameter list

libipvs.c: In function ‘ipvs_parse_stats’:

libipvs.c:530: warning: implicit declaration of function ‘nla_parse_nested’

libipvs.c:548: warning: implicit declaration of function ‘nla_get_u64’

libipvs.c: In function ‘ipvs_services_parse_cb’:

libipvs.c:562: warning: initialization makes pointer from integer without a cast

libipvs.c:592: warning: implicit declaration of function ‘nla_get_u16’

libipvs.c:598: warning: implicit declaration of function ‘nla_data’

libipvs.c:599: warning: passing argument 2 of ‘memcpy’ makes pointer from integer without a cast

/usr/include/string.h:44: note: expected ‘const void * __restrict__’ but argument is of type ‘int’

libipvs.c:604: warning: implicit declaration of function ‘nla_get_string’

libipvs.c:605: warning: passing argument 2 of ‘strncpy’ makes pointer from integer without a cast

/usr/include/string.h:131: note: expected ‘const char * __restrict__’ but argument is of type ‘int’

libipvs.c:610: warning: passing argument 2 of ‘strncpy’ makes pointer from integer without a cast

/usr/include/string.h:131: note: expected ‘const char * __restrict__’ but argument is of type ‘int’

libipvs.c:614: warning: implicit declaration of function ‘nla_memcpy’

libipvs.c:618: warning: passing argument 2 of ‘ipvs_parse_stats’ from incompatible pointer type

libipvs.c:526: note: expected ‘struct nlattr *’ but argument is of type ‘struct nlattr *’

libipvs.c: In function ‘ipvs_get_services’:

libipvs.c:649: error: ‘NLM_F_DUMP’ undeclared (first use in this function)

libipvs.c:650: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_dests_parse_cb’:

libipvs.c:728: warning: initialization makes pointer from integer without a cast

libipvs.c:759: warning: passing argument 2 of ‘memcpy’ makes pointer from integer without a cast

/usr/include/string.h:44: note: expected ‘const void * __restrict__’ but argument is of type ‘int’

libipvs.c:771: warning: passing argument 2 of ‘ipvs_parse_stats’ from incompatible pointer type

libipvs.c:526: note: expected ‘struct nlattr *’ but argument is of type ‘struct nlattr *’

libipvs.c: In function ‘ipvs_get_dests’:

libipvs.c:809: error: ‘NLM_F_DUMP’ undeclared (first use in this function)

libipvs.c:813: warning: assignment makes pointer from integer without a cast

libipvs.c:829: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_get_service’:

libipvs.c:939: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_timeout_parse_cb’:

libipvs.c:972: warning: initialization makes pointer from integer without a cast

libipvs.c:986: error: ‘NL_OK’ undeclared (first use in this function)

libipvs.c: In function ‘ipvs_get_timeout’:

libipvs.c:1005: error: too many arguments to function ‘ipvs_nl_send_message’

libipvs.c: In function ‘ipvs_daemon_parse_cb’:

libipvs.c:1023: warning: initialization makes pointer from integer without a cast

libipvs.c:1048: warning: passing argument 2 of ‘strncpy’ makes pointer from integer without a cast

/usr/include/string.h:131: note: expected ‘const char * __restrict__’ but argument is of type ‘int’

libipvs.c:1051: error: ‘NL_OK’ undeclared (first use in this function)

libipvs.c: In function ‘ipvs_get_daemon’:

libipvs.c:1071: error: ‘NLM_F_DUMP’ undeclared (first use in this function)

libipvs.c:1072: error: too many arguments to function ‘ipvs_nl_send_message’

make[1]: *** [libipvs.o] Error 1

make[1]: Leaving directory `/usr/src/ipvsadm-1.26/libipvs'

make: *** [libs] Error 2
安装完以下这些软件
[root@host2 ipvsadm-1.26]# rpm -qa | grep popt
popt-1.13-7.el6.x86_64

popt-devel-1.13-7.el6.x86_64
[root@host2 ipvsadm-1.26]# rpm -qa | grep libnl
libnl-1.1-14.el6.x86_64

libnl-devel-1.1-14.el6.x86_64
[root@host2 ipvsadm-1.26]# make

make -C libipvs

make[1]: Entering directory `/usr/src/ipvsadm-1.26/libipvs'

gcc -Wall -Wunused -Wstrict-prototypes -g -fPIC -DLIBIPVS_USE_NL -DHAVE_NET_IP_VS_H -c -o libipvs.o libipvs.c

gcc -Wall -Wunused -Wstrict-prototypes -g -fPIC -DLIBIPVS_USE_NL -DHAVE_NET_IP_VS_H -c -o ip_vs_nl_policy.o ip_vs_nl_policy.c

ar rv libipvs.a libipvs.o ip_vs_nl_policy.o

ar: creating libipvs.a

a - libipvs.o

a - ip_vs_nl_policy.o

gcc -shared -Wl,-soname,libipvs.so -o libipvs.so libipvs.o ip_vs_nl_policy.o

make[1]: Leaving directory `/usr/src/ipvsadm-1.26/libipvs'

gcc -Wall -Wunused -Wstrict-prototypes -g -DVERSION=\"1.26\" -DSCHEDULERS=\""rr|wrr|lc|wlc|lblc|lblcr|dh|sh|sed|nq"\" -DPE_LIST=\""sip"\" -DHAVE_NET_IP_VS_H -c -o ipvsadm.o ipvsadm.c

ipvsadm.c: In function ‘print_largenum’:

ipvsadm.c:1383: warning: field width should have type ‘int’, but argument 2 has type ‘size_t’

gcc -Wall -Wunused -Wstrict-prototypes -g -DVERSION=\"1.26\" -DSCHEDULERS=\""rr|wrr|lc|wlc|lblc|lblcr|dh|sh|sed|nq"\" -DPE_LIST=\""sip"\" -DHAVE_NET_IP_VS_H -c -o config_stream.o config_stream.c

gcc -Wall -Wunused -Wstrict-prototypes -g -DVERSION=\"1.26\" -DSCHEDULERS=\""rr|wrr|lc|wlc|lblc|lblcr|dh|sh|sed|nq"\" -DPE_LIST=\""sip"\" -DHAVE_NET_IP_VS_H -c -o dynamic_array.o dynamic_array.c

gcc -Wall -Wunused -Wstrict-prototypes -g -o ipvsadm ipvsadm.o config_stream.o dynamic_array.o libipvs/libipvs.a -lnl

ipvsadm.o: In function `parse_options':

/usr/src/ipvsadm-1.26/ipvsadm.c:432: undefined reference to `poptGetContext'

/usr/src/ipvsadm-1.26/ipvsadm.c:435: undefined reference to `poptGetNextOpt'

/usr/src/ipvsadm-1.26/ipvsadm.c:660: undefined reference to `poptBadOption'

/usr/src/ipvsadm-1.26/ipvsadm.c:502: undefined reference to `poptGetNextOpt'

/usr/src/ipvsadm-1.26/ipvsadm.c:667: undefined reference to `poptStrerror'

/usr/src/ipvsadm-1.26/ipvsadm.c:667: undefined reference to `poptBadOption'

/usr/src/ipvsadm-1.26/ipvsadm.c:670: undefined reference to `poptFreeContext'

/usr/src/ipvsadm-1.26/ipvsadm.c:677: undefined reference to `poptGetArg'

/usr/src/ipvsadm-1.26/ipvsadm.c:678: undefined reference to `poptGetArg'

/usr/src/ipvsadm-1.26/ipvsadm.c:679: undefined reference to `poptGetArg'

/usr/src/ipvsadm-1.26/ipvsadm.c:690: undefined reference to `poptGetArg'

/usr/src/ipvsadm-1.26/ipvsadm.c:693: undefined reference to `poptFreeContext'

collect2: ld returned 1 exit status

make: *** [ipvsadm] Error 1
报错比之前少多了
查阅资料需要安装popt-static
http://mirror.centos.org/centos/6/os/x86_64/Packages/popt-static-1.13-7.el6.x86_64.rpm
[root@host2 ~]#
rpm -ivh popt-static-1.13-7.el6.x86_64.rpm
[root@host2 ipvsadm-1.26]# make

make -C libipvs

make[1]: Entering directory `/usr/src/ipvsadm-1.26/libipvs'

make[1]: Nothing to be done for `all'.

make[1]: Leaving directory `/usr/src/ipvsadm-1.26/libipvs'

gcc -Wall -Wunused -Wstrict-prototypes -g -o ipvsadm ipvsadm.o config_stream.o dynamic_array.o libipvs/libipvs.a -lpopt -lnl
顺利通过~！
