---
title: "Subversion和apache,apr,apr-util的关系"
date: 2015-01-06 08:26:09 +0000
categories: ["Apache"]
tags: []
description: "很多朋友初次接触Subversion时不是很理解subversion和apache的关系。 我在这里简单说明一下svn服务器和客户端的安装说明。 1.1服务器 subversion服务器是不需要apache的，但是可以使用apache，视具体情况来选择。 1、如果只要通过file://或svn://来访问，则不需要ap"
source: "evernote-local-db"
---

Subversion和apache,apr,apr-util的关系

很多朋友初次接触Subversion时不是很理解subversion和apache的关系。

我在这里简单说明一下svn服务器和客户端的安装说明。
1.1服务器

subversion服务器是不需要apache的，但是可以使用apache，视具体情况来选择。

1、如果只要通过file://或svn://来访问，则不需要apache，只安装svn即可，使用svnserve来作为服务。

2、如果你要建立一个可以通过http://或https://来访问的版本库服务器，则你需要使用apache。
1.2客户端

在windows下，不管你要访问的是什么类型的服务器，只要安装一个TortoiseSVN就可以了，开发者已经帮你搞定一切。

在类Linux系统下，如果你通过file://或svn://来访问，则只要编译安装svn就可以，

如果通过http://访问，则要同neon编译，

如果通过https://访问，则要同带ssl支持的neon编译，

不论怎样，都要同apr和apr-util编译。

neon、apr、apr-util也很容易获得，目前发布的subversion代码都会有一个叫做subversion-deps-xxx的文件，比如1.4.3的就是subversion-deps-1.4.3.tar.bz2

对于访问国外网站比较慢的朋友，下载Subversion和客户端，可以到
http://www.iUseSVN.com
，因带宽和流量有限，网站只对注册用户开放下载，这点有点麻烦，但是很值得，一是下载速度的确相当快，二是里面有很多热于与大家交流的Subversion爱好者
二、架设

2.1 首先准备好相关的安装包，我这里使用的是下列的几个包

Apr : apr-1.2.11.tar.gz 和 apr-util-1.5.2.tar.gz

Apache : httpd-2.2.25.tar.gz

Subversion: subversion-1.6.5和 subversion-deps-1.6.5.tar.gz
Zlib: zlib-1.2.8.tar.gz
Sqlite: sqlite-autoconf-3080002.tar.gz

注意：在安装过程中可能会提示需要安装其他的包，根据具体的情况来安装所需要的包，如果安装过程很顺利则说明你运气好！
2.2、安装和配置步骤：
1、安装apr-1.2.11
# tar –zvxf apr-1.2.11.tar.gz

# cd apr-1.2.11

# ./configure /* 安装不指定路径时 默认安装到/usr/local/apr

# make ; make install

2、安装 apr-util-1.2.11

# tar –zvxf apr-util-1.2.11.tar.gz

# cd apr-util-1.2.11

# ./configure - -with-apr=/usr/local/apr

# make ; make install

安装Sqlite
#tar -zxvf sqlite-autoconf-3080002.tar.gz
# ./configure --prefix=/usr/local/sqlite
# cd sqlite
# make
&
make install

3、安装 httpd-2.2.25.tar.gz

# tar –zvxf httpd-2.2.25.tar.gz

# cd httpd-2.2.25

# ./configure --prefix=/usr/local/apache --with-apr=/usr/local/apr/bin/apr-1-config --with-apr-util=/usr/local/apr/bin/apu-1-config --enable-dav --enable-maintainer-mod --enable-rewrite --enable-so --with-sqlite=/usr/local/sqlite
# make ; make install

安装好后启动apache

# /usr/local/apache/bin/apachectl –k start

用浏览器查看
http://localhost/
,得到it works，说明apache已经配置成功了。
周洋注：--with-apr和--with-apr-util参数在编译错误的情况下可不带

4、安装和配置 subversion

#tar –zvxf subversion-1.6.5.tar.gz

#tar –zvxf subversion-deps-1.6.5.tar.gz /*这两个自动解压成一个包 subversion-1.6.5

#cd subversion-1.6.5

#./configure --prefix=/usr/local/svn --with-apxs=/usr/local/apache/bin/apxs --with-apr=/usr/local/apr/bin/apr-1-config --with-apr-util=/usr/local/apr/bin/apu-1-config --with-zlib=/usr/local/zlib-1.2.8 --enable-maintainer-mode --with-sqlite=/usr/local/sqlite

#make

#make install

确定一下svn有没有安装成功

#/usr/local/svn/bin/svnserve - -version

会看到相关版本信息！

完了再看看apache 的相关模块有没有加载！如下！

LoadModule dav_svn_module modules/mod_dav_svn.so

LoadModule authz_svn_module modules/mod_authz_svn.so

到此如果一直都顺利的话就基本没什么问题！继续往下！

开始建立版本库

#/usr/local/svn/bin/svnadmin create /svn/project/www /*创建仓库"www"

#ls /svn/project/www /*查看有没有创建好,如果多了一些文件则说明版本库已经创建好

导入项目文件到版本库

下面这条语句将把路径/share/www下找到的项目文件导入到你创建的/svn/project/www 仓库中去，

提交后的修订版为1

#/usr/local/svn/bin/svn import /share/www
file:///svn/project/www
-m “注释”

配置提高svn版本库的安全性

#chmod –R 700 /svn/project /*不让其他人有该目录的权限

注意: 直接这么chmod会导致svn客户端无法访问,同时需要修改apache配置文件./conf/httpd.conf文件,(如果你的水平不够高的话, 这一步可以先跳过,以免给自己找麻烦!等把服务完全搞定后再来进一步提高安全性) 在httpd.conf文件中有这么一段内容:

User daemon

Group daemon

把上述内容改成:

User apache

Group apache

(我的系统在安装apache的时候,自动增加了apache用户和apache组,如果你系统没有这个用户和组,则请自己添加该用户和组)

修改svn仓库的所有者

#chown -R apache:apache /svn/project

5、配置apache支持svn

#vi /usr/local/apache/conf/httpd.conf

在文件末尾添加

DAV svn

SVNPath /svn/project/www (此处配置你的版本库根目录) --注意这里不要是svnpath

AuthType Basic （连接类型设置 基本验证）

AuthName "Hello welcome to here" （此处字符串内容修改为提示对话框标题）

AuthUserFile /usr/local/apache/svn-auth-file(此处修改为访问版本库用户的文件，

用apache 的htpasswd命令生成)

AuthzSVNAccessFile /usr/local/apache/auth.conf （此处修改为访问版本库权限的文件）

Require valid-user （"Require valid-user"告诉apache在authfile中所有的用户都可以访问。

如果没有它，则只能第一个用户可以访问新建库）

保存文件退出!

重新启动apache

# /usr/local/apache/bin/apachectl –k restart

先使用浏览器检测一下

打开浏览器访问
http://192.168.0.1/svn/www
会提示输入用户名密码

等到完成下面步骤就可以进去访问了,进去后如果有东西显示就说明成功。

下面就是对svn的用户和权限配置管理

6、配置svn权限管理(即authz.conf的配置)

1 . 添加用户:

# /usr/local/apache/bin/htpasswd –c /usr/local/apache/svn-auth-file user1

第一次设置用户时使用-c表示新建一个用户文件。回车后输入用户密码，完成对用户的增加

第二次添加用户不需要带 –c 参数 如:

# /usr/local/apache/bin/htpasswd /svn/passwd user2

2 . 权限分配:

#vi /svn/auth.conf

[groups] /*这个表示群组设置

Admin=usr1,user2 /*这个表示admin群组里的成员 user1,user2

Develop=u1, u2 /*这个表示Develop群组里的成员 u1,u2

[www:/] /*这表示，仓库www的根目录下的访问权限

user1 = rw /*www仓库user1用户具有读和写权限

user2 = r /* www仓库userl用户具只有读权限

@develop=rw /*这表示 群 develop的成员都具有读写权限

[/] /*这个表示在所有仓库的根目录下

* = r /*这个表示对所有的用户都具有读权限

注意：在编辑authz.conf文件时，所有行都必须要顶头写，不能有缩行出现，否则会报错："Access denied: ''user1'' ",里面的内容可以根据自己的需要自行添加,不必与我上面所写的相同!

7、重启apache服务和启动svn服务

#/usr/local/apache/bin/apachectl –k restart

就可以通过
http://192.168.0.1/svn/www
这个URL来访问仓库了，当然，受权限的限制，必须是合法用户才能访问且具有相应的权限

最后启动svn

#/usr/local/svn/bin/svn -d -r /svn/project

-d 表示以 daemon 方式(后台运行)运行

-r /svn/project 指定根目录是/svn/project

检查服务器是否启动正常:

#ps –ef|grep svnserve

如果显示如下，即为启动成功：

Root 6941 1 0 15:07 ? 00:00:00 svnserve -d ——listen-port 9999 -r /svn

接下来客户端TortoiseSVN直接安装，重启客户端计算机。

OK.到此 APACHE+SVN服务器的架设已经完成
三、附录：

linux 下命令行查看Apache是否安装、路径、版本。

SSH访问远程linux.如何查看里边是否安装了Apache ，安装路径，当前版本。

如果你是问linux自动安装的Apache的话，直接使用Apachectl-v命令，如果告诉你没有这个方法就可以知道系统没有安装Apache，如果已经安装了则显示Apache的版本，至于安装目录，使用Apachectl -c就可以知道了。

使用Apachectl的前提条件也得你知道Apache源码安装的全路径啊，一般 是/usr/local/Apache2/bin/Apachectl。 如通是通过rpm包安装的话直接rpm -q httpd 就能看有没有安装了
