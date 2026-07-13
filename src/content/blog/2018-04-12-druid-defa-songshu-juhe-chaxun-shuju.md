---
title: Druid 的发送数据和查询数据
date: '2018-04-12'
description: "关于向 Druid 导入和查询数据的整理笔记。通过 Hadoop 数据源导入 JSON 格式数据，配置 schema 和聚合指标，用 curl 命令展示数据发送和查询流程。"
category: monitoring
tags:
  - druid
  - hadoop
draft: false
source: evernote-local-db
lang: zh
origin_url: https://blog.csdn.net/silentwolfyh/article/details/62891763
---

关于向 Druid 发送数据和查询数据的整理笔记。

## 需求和参考

使用 Linux 向 Druid 发送数据和查询数据。

参考资源：
- 数据格式文档：http://druid.io/docs/0.9.2/ingestion/data-formats.html
- 默认配置：`/home/druid/druid-0.9.2/quickstart/wikiticker-index.json`

## 数据准备

1. 修改官网数据中的日期为当前日期（仅修改 YYYY-MM-DD）
2. 将 `basicdata.json` 上传到 HDFS：`/user/druid/basicdata.json`
3. 修改配置中的 dimensions 列名，使其与数据源对应

## 数据示例

```json
{"timestamp":"2017-03-17T01:02:33Z","page":"Gypsy Danger","language":"en","user":"nuclear","unpatrolled":"true","newPage":"true","robot":"false","anonymous":"false","namespace":"article","continent":"North America","country":"United States","region":"Bay Area","city":"San Francisco","added":57,"deleted":200,"delta":-143}
{"timestamp":"2017-03-17T03:32:45Z","page":"Striker Eureka","language":"en","user":"speed","unpatrolled":"false","newPage":"true","robot":"true","anonymous":"false","namespace":"wikipedia","continent":"Australia","country":"Australia","region":"Cantebury","city":"Syndey","added":459,"deleted":129,"delta":330}
{"timestamp":"2017-03-17T07:11:21Z","page":"Cherno Alpha","language":"ru","user":"masterYi","unpatrolled":"false","newPage":"true","robot":"true","anonymous":"false","namespace":"article","continent":"Asia","country":"Russia","region":"Oblast","city":"Moscow","added":123,"deleted":12,"delta":111}
{"timestamp":"2017-03-17T11:58:39Z","page":"Crimson Typhoon","language":"zh","user":"triplets","unpatrolled":"true","newPage":"false","robot":"true","anonymous":"false","namespace":"wikipedia","continent":"Asia","country":"China","region":"Shanxi","city":"Taiyuan","added":905,"deleted":5,"delta":900}
{"timestamp":"2017-03-17T12:41:27Z","page":"Coyote Tango","language":"ja","user":"cancer","unpatrolled":"true","newPage":"false","robot":"true","anonymous":"false","namespace":"wikipedia","continent":"Asia","country":"Japan","region":"Kanto","city":"Tokyo","added":1,"deleted":10,"delta":-9}
```

## 配置示例

### data_schema.json

```json
{
  "type": "index_hadoop",
  "spec": {
    "ioConfig": {
      "type": "hadoop",
      "inputSpec": {
        "type": "static",
        "paths": "/user/druid/basicdata.json"
      }
    },
    "dataSchema": {
      "dataSource": "silentwolf",
      "granularitySpec": {
        "type": "arbitrary",
        "segmentGranularity": "day",
        "queryGranularity": "none",
        "intervals": ["2017-03-17/2017-03-18"]
      },
      "parser": {
        "type": "hadoopyString",
        "parseSpec": {
          "format": "json",
          "dimensionsSpec": {
            "dimensions": ["page", "language", "user", "unpatrolled", "newPage", "robot", "anonymous", "namespace", "continent", "country", "region", "city"]
          },
          "timestampSpec": {
            "format": "auto",
            "column": "timestamp"
          }
        }
      },
      "metricsSpec": [
        {"name": "count", "type": "count"},
        {"name": "added", "type": "longSum", "fieldName": "added"},
        {"name": "deleted", "type": "longSum", "fieldName": "deleted"},
        {"name": "delta", "type": "longSum", "fieldName": "delta"}
      ]
    },
    "tuningConfig": {
      "type": "hadoop",
      "jobProperties": {}
    }
  }
}
```

### queryall.json

```json
{
  "queryType": "timeseries",
  "dataSource": "silentwolf",
  "intervals": ["2017-03-17/2017-03-18"],
  "granularity": "day",
  "aggregations": [
    {"type": "count", "name": "count"},
    {"name": "deleted", "type": "longSum", "fieldName": "deleted"},
    {"name": "delta", "type": "longSum", "fieldName": "delta"}
  ]
}
```

## 发送和查询命令

发送数据：

```bash
curl -X POST -H 'Content-Type: application/json' -d @data_schema.json tagtic-master:18090/druid/indexer/v1/task
```

查询数据：

```bash
curl -X POST 'tagtic-slave01:18082/druid/v2/?pretty' -H 'Content-Type:application/json' -d @queryall.json
```

## 注意事项

1. 找到 Druid 集群中 broker 的 server 和端口。示例：`ps -ef | grep broker` 查找 broker 进程

   ```bash
   [root@tagtic-slave01 yuhui]# ps -ef | grep broker
   druid 52680 52675 1 2 月 20 ? 06:31:04 java -server -Xms16g -Xmx16g -XX:MaxDirectMemorySize=4096m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -Djava.io.tmpdir=var/tmp -Djava.util.logging.manager=org.apache.logging.log4j.jul.LogManager -cp conf/druid/_common:conf/druid/broker:lib/* io.druid.cli.Main server broker
   root 89216 67823 0 17:03 pts/0 00:00:00 grep --color=auto broker
   ```

2. 测试数据要放在 HDFS 上
3. dimensions 中的列名不要与 metricsSpec 中的 name 重名
