---
title: "CUDA之nvidia-smi命令详解"
date: 2018-07-23 08:08:54 +0000
categories: ["机器学习"]
tags: []
description: "2017年03月19日 13:02:22 阅读数：25323 nvidia-smi是用来查看GPU使用情况的。我常用这个命令判断哪几块GPU空闲，但是最近的GPU使用状态让我很困惑，于是把nvidia-smi命令显示的GPU使用表中各个内容的具体含义解释一下。 这是服务器上特斯拉K80的信息。 上面的表格中： 第一栏的"
source: "evernote-local-db"
---

CUDA之nvidia-smi命令详解
2017年03月19日 13:02:22
阅读数：25323
nvidia-smi是用来查看GPU使用情况的。我常用这个命令判断哪几块GPU空闲，但是最近的GPU使用状态让我很困惑，于是把nvidia-smi命令显示的GPU使用表中各个内容的具体含义解释一下。

这是服务器上特斯拉K80的信息。
上面的表格中：
第一栏的Fan：N/A是风扇转速，从0到100%之间变动，这个速度是计算机期望的风扇转速，实际情况下如果风扇堵转，可能打不到显示的转速。有的设备不会返回转速，因为它不依赖风扇冷却而是通过其他外设保持低温（比如我们实验室的服务器是常年放在空调房间里的）。
第二栏的Temp：是温度，单位摄氏度。
第三栏的Perf：是性能状态，从P0到P12，P0表示最大性能，P12表示状态最小性能。
第四栏下方的Pwr：是能耗，上方的Persistence-M：是持续模式的状态，持续模式虽然耗能大，但是在新的GPU应用启动时，花费的时间更少，这里显示的是off的状态。
第五栏的Bus-Id是涉及GPU总线的东西，domain:bus:device.function
第六栏的Disp.A是Display Active，表示GPU的显示是否初始化。
第五第六栏下方的Memory Usage是显存使用率。
第七栏是浮动的GPU利用率。
第八栏上方是关于ECC的东西。
第八栏下方Compute M是计算模式。
下面一张表示每个进程占用的显存使用率。
显存占用和GPU占用是两个不一样的东西
，显卡是由GPU和显存等组成的，显存和GPU的关系有点类似于内存和CPU的关系。我跑caffe代码的时候显存占得少，GPU占得多，师弟跑TensorFlow代码的时候，显存占得多，GPU占得少。
背景
qgzang
@ustc
:~
$

nvidia-smi -h
1
1
输出如下信息：
NVIDIA System Management Interface – v352.79
NVSMI provides monitoring information for Tesla and select Quadro devices.
The data is presented in either a plain text or an XML format, via stdout or a file.
NVSMI also provides several management operations for changing the device state.
Note that the functionality of NVSMI is exposed through the NVML C-based
library. See the NVIDIA developer website for more information about NVML.
Python
wrappers to NVML are also available. The output of NVSMI is
not guaranteed to be backwards compatible; NVML and the bindings are backwards
compatible.
http://developer.nvidia.com
vidia-management-library-nvml/

http://pypi.python.org/pypi
vidia-ml-py/
Supported products:
Full Support
All Tesla products, starting with the Fermi architecture
All Quadro products, starting with the Fermi architecture
All GRID products, starting with the Kepler architecture
GeForce Titan products, starting with the Kepler architecture
Limited Support
All Geforce products, starting with the Fermi architecture
命令
nvidia-smi

[OPTION1 [ARG1]
]

[OPTION2 [ARG2]
]

...
1
1
参数
参数
详解
-h, –help
Print usage information and exit.
LIST OPTIONS:
参数
详解
-L, –list-gpus
Display a list of GPUs connected to the system.
qgzang@ustc
:~
$ nvidia
-smi

-L
GPU

0
: GeForce GTX TITAN X (
UUID:

GPU
-xxxxx
-xxx
-xxxxx
-xxx
-xxxxxx
)
1
2
1
2
SUMMARY OPTIONS:
参数
详解
-i,–id=
Target a specific GPU.
-f,–filename=
Log to a specified file, rather than to stdout.
-l,–loop=
Probe until Ctrl+C at specified second interval.
QUERY OPTIONS:
参数
详解
-q,
–query
-u,–unit
Show unit, rather than GPU, attributes.
-i,–id=
Target a specific GPU or Unit.
-f,–filename=
Log to a specified file, rather than to stdout.
-x,–xml-format
Produce XML output.
–dtd
When showing xml output, embed DTD.
-d,–display=
Display only selected information: MEMORY,
-l, –loop=
Probe until Ctrl+C at specified second interval.
-lms, –loop-ms=
Probe until Ctrl+C at specified millisecond interval.
SELECTIVE QUERY OPTIONS:
参数
详解
补充
–query-gpu=
Information about GPU.
Call –help-query-gpu for more info.
–query-supported-clocks=
List of supported clocks.
Call –help-query-supported-clocks for more info.
–query-compute-apps=
List of currently active compute processes.
Call –help-query-compute-apps for more info.
–query-accounted-apps=
List of accounted compute processes.
Call –help-query-accounted-apps for more info.
–query-retired-pages=
List of device memory pages that have been retired.
Call –help-query-retired-pages for more info.
[mandatory]
参数
命令
-i, –id=
Target a specific GPU or Unit.
-f, –filename=
Log to a specified file, rather than to stdout.
-l, –loop=
Probe until Ctrl+C at specified second interval.
-lms, –loop-ms=
Probe until Ctrl+C at specified millisecond interval.
DEVICE MODIFICATION OPTIONS:
参数
命令
补充
-pm, –persistence-mode=
Set persistence mode: 0/DISABLED, 1/ENABLED

-e, –ecc-config=
Toggle ECC support: 0/DISABLED, 1/ENABLED

-p, –reset-ecc-errors=
Reset ECC error counts: 0/VOLATILE, 1/AGGREGATE

-c, –compute-mode=
Set MODE for compute applications:
0/DEFAULT,1/EXCLUSIVE_THREAD (deprecated),2/PROHIBITED, 3/EXCLUSIVE_PROCESS
–gom=
Set GPU Operation Mode:
0/ALL_ON, 1/COMPUTE, 2/LOW_DP
-r –gpu-reset
Trigger reset of the GPU.

UNIT MODIFICATION OPTIONS:
参数
命令
-t, –toggle-led=
Set Unit LED state: 0/GREEN, 1/AMBER
-i, –id=
Target a specific Unit.
SHOW DTD OPTIONS:
参数
命令
–dtd
Print device DTD and exit.
-f, –filename=
Log to a specified file, rather than to stdout.
-u, –unit
Show unit, rather than device, DTD.
–debug=
Log encrypted debug information to a specified file.
Process Monitoring:
参数
命令
补充
pmon
Displays process stats in scrolling format.
“nvidia-smi pmon -h” for more information.
TOPOLOGY: (EXPERIMENTAL)
参数
命令
补充
topo
Displays device/system topology. “nvidia-smi topo -h” for more information.
Please see the nvidia-smi(1) manual page for more detailed information.
