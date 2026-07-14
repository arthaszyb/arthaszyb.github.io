---
title: Kubernetes Informer 详解
date: '2019-04-29'
description: "Client-go中的Informer工具包的设计原理、架构组件和工作流程详解，包括List/Watch机制、二级缓存、事件回调等核心概念。"
category: container-virt
tags:
  - kubernetes
draft: false
source: evernote-local-db
lang: zh
---

Informer 是 Client-go 中的一个核心工具包。Informer 内部实现极其复杂，但也是一个设计精良、安全可靠的组件。

## Informer 简介
### 基础功能
Informer 是 Client-go 中的一个核心工具包。在 Kubernetes 源码中，如果 Kubernetes 的某个组件，需要 List/Get Kubernetes 中的 Object，在绝大多 数情况下，会直接使用 Informer 实例中的 Lister()方法（该方法包含 了 Get 和 List 方法），而很少直接请求 Kubernetes API。Informer 最基本 的功能就是 List/Get Kubernetes 中的 Object。
如下图所示，仅需要十行左右的代码就能实现对 Pod 的 List 和 Get。
### 高级功能
Client-go 的首要目标是满足 Kubernetes 的自身需求。Informer 作为其中的核心工具包，面对 Kubernetes 极为复杂业务逻辑，如果仅实现 List/Get 功能，根本无法满足 Kubernetes 自身需求。因此，Informer 被设计为一个灵活而复杂的工具包，除 List/Get Object 外，Informer 还可以监听事件并触发回调函数等，以实现更加复杂的业务逻辑。
## Informer 设计思路

### 关键点
为了让 Client-go 更快地返回 List/Get 请求的结果、减少对 Kubenetes API 的直接调用，Informer 被设计实现为一个依赖 Kubernetes List/Watch API 、可监听事件并触发回调函数的二级缓存工具包。
#### 更快地返回 List/Get 请求

减少对 Kubenetes API 的直接调用：
使用 Informer 实例的 Lister() 方法， List/Get Kubernetes 中的 Object 时，Informer 不会去请求 Kubernetes API，而是直接查找缓存在本地内存中的数据(这份数据由 Informer 自己维护)。通过这种方式，Informer 既可以更快地返回结果，又能减少对 Kubernetes API 的直接调用。
#### 依赖 Kubernetes List/Watch API

Informer 只调用 Kubernetes List 和 Watch 两种 API：
- 初始化时先调用 List API 获得 resource 的全部 Object，缓存在内存
- 然后调用 Watch API 维护这份缓存
- 之后不再调用 Kubernetes API

用 List/Watch 维护缓存、保持一致性是典型做法。特殊的是，Informer 只在初始化时调用一次 List API，之后完全依赖 Watch API，没有 resync 机制。

Google Kubernetes 开发人员解释：现有的 List/Watch 机制完全能保证不漏掉任何事件，因此无需额外的 relist/resync。这说明 Kubernetes 完全信任 etcd。

#### 可监听事件并触发回调函数
Informer 通过 Watch API 监听某 resource 下的所有事件，可添加自定义回调函数。回调函数需实现三个方法：
- `OnAdd(obj interface{})` - 创建事件
- `OnUpdate(oldObj, newObj interface{})` - 更新事件
- `OnDelete(obj interface{})` - 删除事件

Controller 的设计实现中会经常用到这个功能。

#### 二级缓存
二级缓存（DeltaFIFO 和 LocalStore）：
- DeltaFIFO：存储 Watch API 返回的各种事件
- LocalStore：仅被 Lister 的 List/Get 方法访问

虽然 Informer 和 Kubernetes 之间没有 resync 机制，但 Informer 内部这两级缓存之间存在 resync 机制。

## Informer 详细解析
### 内部主要组件

Informer 包含六个主要组件：
- **Controller**：Informer 内部的 Controller（非 Kubernetes Controller）
- **Reflector**：通过 Watch API 监听 resource 下的所有事件
- **DeltaFIFO**：存储 Watch 事件的缓存队列
- **LocalStore**：提供本地内存缓存（Lister 调用）
- **Lister**：提供 List/Get 方法访问本地缓存
- **Processor**：记录回调函数实例，负责触发这些函数

### 工作流程详解
以 Pod 为例：

1. **初始化**：Reflector 调用 List API 获得所有 Pod，放入 Store
2. **查询**：调用 Lister 的 List/Get 方法时，直接从 Store 查询
3. **监听**：Informer 初始化完成后，Reflector 开始 Watch Pod 事件
4. **事件捕获**：Pod 被删除时，Reflector 监听到删除事件，发送到 DeltaFIFO
5. **缓存更新**：DeltaFIFO 存储事件，同时操作 Store 删除 pod_1
6. **事件处理**：DeltaFIFO Pop 事件到 Controller
7. **触发回调**：Controller 触发 Processor 的回调函数
8. **缓存同步**：LocalStore 周期性把所有 Pod 信息重新放到 DeltaFIFO（resync 机制）

## Informer 的内部原理比较复杂，但却是一个非常稳定可靠的 package，已被 Kubernetes 广泛使用。通过 List/Watch + 二级缓存 + 事件回调，实现了高效的本地缓存和事件驱动的业务逻辑。
