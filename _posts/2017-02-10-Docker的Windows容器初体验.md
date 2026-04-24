---
title: "Docker的Windows容器初体验"
date: 2017-02-10 14:12:16 +0000
categories: ["docker"]
tags: ["Pages"]
description: "来源: 360圈 发布时间：2016-10-27 10:23:18 | 浏览次数：2317 | 关键词：容器,Windows,Docker,我们 热门标签： 情感社区 角色扮演 策略战棋 360浏览器 交友网站 同城交友 最近微软发布了 Windows Server 2016,其中最让广大开发者和运维同学期待的就是Do"
source: "evernote-local-db"
---

Docker的Windows容器初体验
来源:
360圈

发布时间：2016-10-27 10:23:18 | 浏览次数：2317 | 关键词：容器,Windows,Docker,我们
热门标签：
情感社区

角色扮演

策略战棋

360浏览器

交友网站

同城交友
最近微软发布了
Windows

Server 2016,其中最让广大开发者和运维同学期待的就是Docker对
Windows
容器的支持。
Windows支持两种不同类型的容器,即 Windows Server 容器和 Hyper-V 容器。 这两种类型的容器的使用方式相同,也支持相同的容器映像。 但是它们的实现机制不同,提供了不同的安全隔离级别
Windows Server 容器 - 非常类似与Linux中的容器,使用通过命名空间、资源控制实现进程隔离。每个Windows Server容器都与宿主机共享同一个内核。
Hyper-V 容器 - 每个容器都运行在一个高度优化的Hyper-V虚拟机中,所以容器拥有独立的内核。这样容器的隔离性会更好,但是启动速度会慢一些,其资源占用也会增加。
如果你手边没有Windows Server 2016的环境,我们也可以在Windows 10 操作系统上,使用Docker for Windows来开始实验。
前提条件
与基于Virtualbox的Docker Toolbox/Machine版不同,Docker for Windows 依赖于微软的虚拟化技术Hyper-V。64位的Windows 10在专业版、企业版和教育版中,提供了Hyper-V支持,但如果您使用的是家庭版,请升级后再做实验。
您可以通过控制面板的“程序“ > “启用或关闭Windows功能”来检查Hyper-V状态,中选中并开启Hyper-V。Docker for Windows也会在安装过程中自动开启相应设置。
另外你需要为Windows 10安装2016年度更新,来确保在Window内核已提供原生的Windows容器支持。
注:Windows 10目前只支持Hyper-V类型的Windows容器。
安装Docker for Windows Beta
与之前Docker Engine不同,最新的Docker for Windows提供了对Linux容器和Windows容器的支持。但值得注意的是:这两种容器模式不能被Docker Engine同时启用,但可以手工切换。
目前Docker for Windows对Windows容器的支持只在Beta版本中存在,你需要在下载链接中点击Get Docker for Windows (Beta) 来进行安装
设置Docker for Windows
在安装之后,我们启动PowerShell就可以通过Docker命令来管理容器。我们首先执行docker version 命令来检查Docker的版本和系统信息,这时我们可以发现Docker Engine运行在Linux容器模式。
PS C:\Users\denve> docker versionClient: Version: 1.12.2
API version: 1.24
Go version: go1.6.3
Git commit: bb80604 Built: Tue Oct 11 05:27:08 2016
OS/Arch: windows/amd64 Experimental: trueServer: Version: 1.12.2
API version: 1.24
Go version: go1.6.3
Git commit: bb80604 Built: Tue Oct 11 05:27:08 2016
OS/Arch: linux/amd64 Experimental: true
为了切换到Windows容器模式,我们先点击桌面托盘,再从Docker图标的右键菜单中选中 “Switch to Windows containers ...” 片刻之后,Windows 容器环境会就绪。
再次执行docker version 命令,这时Server的“OS/Arch”已经从“linux/amd64”切换为“windows/amd64”,Docker Engine已经运行在Windows容器模式
PS C:\Users\denve> docker versionClient: Version: 1.12.2
API version: 1.24
Go version: go1.6.3
Git commit: bb80604 Built: Tue Oct 11 05:27:08 2016
OS/Arch: windows/amd64 Experimental: trueServer: Version: 1.12.2-cs2-ws-beta
API version: 1.25
Go version: go1.7.1
Git commit: 050b611 Built: Tue Oct 11 02:35:40 2016
OS/Arch: windows/amd64
注:在Linux容器模式下,我们可以在Docker图标的右键菜单中选中“Settings...” 对Docker Engine进行更多设置,比如可以在“Docker Daemon”中设置Docker Hub的镜像地址,这样可以利用阿里云容器镜像服务提供的加速器来加快从镜像下载速度。但是这些设置对于Windows容器模式目前无效
开启Windows容器之旅
下面我们来做最简单的Docker操作,启动一个示例容器
PS C:\Users\denve> docker run microsoft/sample-dotnet
Welcome to .NET Core!
__________________
\
\ .... ....'
....
..........
.............'..'..
................'..'.....
.......'..........'..'..'....
........'..........'..'..'.....
.'....'..'..........'..'.......'.
.'..................'... ......
. ......'......... .....
. ......
.. . .. ......
.... . ....... ...... ....... ............
................ ...................... ........................'................
......................'..'...... .......
.........................'..'..... .......
........ ..'.............'..'.... ..........
..'..'... ...............'....... ..........
...'...... ...... .......... ...... ....... ........... ....... ........ ............. '...'.'. '.'.'.' ....
....... .....'.. ..'.....
.. .......... ..'........ ............ .............. ............. '..............
...........'.. .'.'............
............... .'.'............. .............'.. ..'..'...........
............... .'.............. ......... .............. .....
构建一个测试Docker镜像,其Dockerfile文件如下
FROM microsoft
anoserverCMD echo Hello World!
构建镜像并执行的结果如下
PS C:\Users\denve\test> docker build -t test .
Sending build context to Docker daemon 2.048 kB
Step 1/2 : FROM microsoft
anoserver
---> e14bc0ecea12
Step 2/2 : CMD echo Hello World!
---> Running in 0b0831046879
---> 3e506bc77617
Removing intermediate container 0b0831046879Successfully built 3e506bc77617
PS C:\Users\denve\test> docker run test
Hello World!
感觉是不是还不错,Docker为Windows容器和Linux容器提供了一致的用户体验。
测试Docker Compose
微软提供了一些官方的Windows容器示例,可以从下列项目获得
https://github.com/Microsoft/Virtualization-Documentation/tree/live/windows-container-samples/
我们可以利用docker-compose创建一个由asp.net博客应用和MS SQLServer构成的多容器应用
首先,下载示例代码
git clone
https://github.com/Microsoft/Virtualization-Documentationcd
.\Virtualization-Documentation\windows-container-samples/ASP-NET-Blog-Application
在“web/Dockerfile” 中添加如下一行
RUN powershell -Command Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters' -Name ServerPriorityTimeLimit -Value 0 -Type DWord
这时因为目前Windows容器的DNS解析还存在问题,有时不能从web容器中正确解析到“db“”服务的容器,导致应用无法正常启动。社区中已有讨论
https://github.com/docker/docker/issues/27499
,这里我们采用了文中提到的临时解决方案。
然后我们构建Docker应用镜像,并利用Docker Compose模板启动整个应用
docker-compose builddocker-compose up
执行完毕,我们可以通过docker compose ps命令查看容器状态
Name Command State Ports
-----------------------------------------------------------------------------------------aspnetblogapplication_db_1 cmd /S /C powershell ./sta ... Up 1433/tcp
aspnetblogapplication_web_1 c:\windows\system32\cmd.exe Up 0.0.0.0:80->80/tcp
使用下列命令,我们可以获得web服务容器的IP地址
docker inspect aspnetblogapplication_web_1
这时我们就可以通过
http:///BlogEngine
来访问Blog应用了!
总结
Windows容器的出现大大简化了Windows应用交付和运维的复杂性,对于微软的技术生态有着及其重要的意义。Docker在简化用户体验上做足了文章,现有工具链可以对Windows和Linux容器环境提供接近一致的能力。
同时Windows和Linux容器底层的实现机制还有很多不同,比如容器网络,基础镜像选择都有特别之处。未来我们会逐渐介绍。阿里云容器服务也会在未来的版本中提供对Windows容器的支持

来自

<
http://www.360quan.com/windows10/24145.html
>

已使用 Microsoft OneNote 2016 创建。
