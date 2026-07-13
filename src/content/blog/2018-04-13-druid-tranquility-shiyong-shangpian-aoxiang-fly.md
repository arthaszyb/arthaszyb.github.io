---
title: Druid Tranquility 使用笔记
date: '2018-04-13'
description: "关于 Druid Tranquility 实时数据摄入的笔记。Tranquility 是独立的 HTTP 服务，通过配置 JSON 文件定义数据源、schema、聚合指标，接收实时数据。"
category: monitoring
tags:
  - druid
draft: false
source: evernote-local-db
lang: zh
---

关于 Druid Tranquility 实时数据摄入的笔记。

## 基本概念

Tranquility 是单独的 HTTP server 服务，需要另行下载。

下载地址：http://druid.io/downloads.html

## 启动 Tranquility

```bash
nohup bin/tranquility server -configFile ./conf/pageviews.json > start.log &
```

## 配置文件示例

```json
{
  "dataSources": {
    "pageviews": {
      "spec": {
        "dataSchema": {
          "dataSource": "pageviews",
          "parser": {
            "type": "string",
            "parseSpec": {
              "timestampSpec": {
                "column": "time",
                "format": "auto"
              },
              "dimensionsSpec": {
                "dimensions": ["url", "user"],
                "dimensionExclusions": ["timestamp", "value"]
              },
              "format": "json"
            }
          },
          "granularitySpec": {
            "type": "uniform",
            "segmentGranularity": "hour",
            "queryGranularity": "none"
          },
          "metricsSpec": [
            {"name": "views", "type": "count"},
            {"name": "latencyMs", "type": "doubleSum", "fieldName": "latencyMs"}
          ]
        },
        "ioConfig": {
          "type": "realtime"
        },
        "tuningConfig": {
          "type": "realtime",
          "maxRowsInMemory": "100000",
          "intermediatePersistPeriod": "PT10M",
          "windowPeriod": "PT10M"
        }
      },
      "properties": {
        "task.partitions": "1",
        "task.replicants": "1"
      }
    }
  },
  "properties": {
    "zookeeper.connect": "localhost",
    "druid.discovery.curator.path": "/druid/discovery",
    "druid.selectors.indexing.serviceName": "druid/overlord",
    "http.port": "8200",
    "http.threads": "8"
  }
}
```

## 发送数据

```bash
curl -X POST 'http://192.168.2.41:8200/v1/post/pageviews' -d '{"time": 1501650962363, "url": "/foo/bar", "user": "alice", "latencyMs": 32}'
```

成功响应：

```json
{
  "result": {
    "received": 5,
    "sent": 5
  }
}
```

若 `sent` 为 0，说明数据未正常发送到 Druid，检查：

1. MiddleManager 和 Overlord 节点配置内存是否充足
2. 发送的时间戳是否在 10 分钟内
