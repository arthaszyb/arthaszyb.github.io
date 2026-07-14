---
title: InfluxDB 写数据语法
date: '2018-03-27'
description: InfluxDB 行协议（Line Protocol）详细语法参考。覆盖格式、空格规则、时间戳、转义规则、数据类型、CLI 和 HTTP 写入方式。
category: monitoring
tags:
  - influxdb
draft: false
source: evernote-local-db
lang: zh
---

## 行协议（Line Protocol）

InfluxDB 的标准写入格式：

```
measurement[,tag_key1=tag_value1,tag_key2=tag_value2,...] field_key=field_value[,field_key2=field_value2,...] [timestamp]
```

### 空格规则

- Measurement 和 field(s) 间**必须**用空格分隔
- Tag 和 field 间**必须**用空格分隔
- Measurement 和 tag、tag 和 tag 间用逗号分隔，**不能有空格**
- 有 timestamp 时，field 和 timestamp 间**必须**用空格分隔

**合法示例**：

```
measurement value=12
measurement value=12 1439587925
measurement,foo=bar value=12
measurement,foo=bar value=12 1439587925
measurement,foo=bar,bat=baz value=12,otherval=21 1439587925
```

**非法示例**：

```
measurement,value=12              # tag 后缺 field
measurement value=12,1439587925   # timestamp 前缺空格
measurement foo=bar value=12      # tag 前缺逗号
measurement,foo=bar,value=12      # field key 放在 tag 位置
measurement,foo=bar               # 缺 field
measurement,foo=bar 1439587925    # 缺 field
```

## Timestamp（时间戳）

- **可选**，如果不提供，使用服务器当前系统时间
- **必须**与 field 间以空格分隔
- **默认单位**：纳秒级 Unix 时间
- **建议**：使用最小精度提高压缩率

## 键值（Key-Value）分隔

Tag 或 field 的键、值间必须用 `=` 分隔。

## 转义规则

Tag/field 的键或值包含空格、逗号、等号时，需用反斜线转义。

### Measurement 中的转义

- 逗号（`,`）需转义
- 空格（` `）需转义
- 等号（`=`）**不需**转义

### Tag key/value 和 field key 中的转义

- 逗号、空格、等号都需转义
- 反斜线本身不需转义

### Field value（String 类型）

- 用双引号包围
- 只需转义双引号
- 逗号和空格**不需**转义

## 数据类型

- **Measurement、tag key/value、field key**：总是以 string 保存，最大 64 KB
- **Field value 类型**：
  - `float64`：默认数字类型，`1` 表示 float
  - `int64`：后跟 `i`，如 `1i`
  - `boolean`：`t/T/true/TRUE/f/F/false/FALSE`
  - `string`：用双引号包围

## 示例

**最简单的写入点**：

```
disk_free value=442221834240i
```

**带 timestamp**：

```
disk_free value=442221834240i 1435362189575692182
```

**带 tag**：

```
disk_free,hostname=server01,disk_type=SSD value=442221834240i
```

**带 tag 和 timestamp**：

```
disk_free,hostname=server01,disk_type=SSD value=442221834240i 1435362189575692182
```

**多个 field**：

```
disk_free free_space=442221834240i,disk_type="SSD" 1435362189575692182
```

**转义逗号和空格**：

```
total\ disk\ free,volumes=/net\,/home\ backup value=442221834240i 1435362189575692182
```

**转义等号**：

```
disk_free,a\=b=y\=z value=442221834240i
```

**Tag value 中的斜线**：

```
disk_free,path=C:\Windows value=442221834240i
```

注：斜线在字符串中不需转义，除非后面跟逗号、空格或等号。

**转义 field key**：

```
disk_free value=442221834240i,working\ directories="C:\My Documents\Stuff for examples,C:\My Documents"
```

**综合转义示例**：

```
"measurement\ with\ quotes",tag\ key\ with\ spaces=tag\,value\,with\,commas field_key\\\\="string field value, only \" need be quoted"
```

## 注意事项

- 批量写入相同 timestamp 的数据时，会合并为同一数据点
- Measurement、tag、field 名称大小写敏感
- 关键词大小写不敏感

## CLI 写入

```bash
> insert disk_free,hostname=server01 value=442221834240i 1435362189575692182
```

成功无返回；错误时显示解析器错误信息。

## HTTP 写入

POST 到 `/write` 端点（8086 端口）。

**必需参数**：

```
db=<database>
```

**可选参数**：

```
rp=<retention_policy>       # 指定保留策略
u=<username>&p=<password>   # 鉴权
precision=[n|u|ms|s|m|h]    # 时间戳精度（默认纳秒）
```

**单条写入**：

```bash
curl -X POST 'http://localhost:8086/write?db=mydb' \
  --data-binary 'disk_free,hostname=server01 value=442221834240i 1435362189575692182'
```

**非默认 Retention Policy**：

```bash
curl -X POST 'http://localhost:8086/write?db=mydb&rp=six_month_rollup' \
  --data-binary 'disk_free,hostname=server01 value=442221834240i 1435362189575692182'
```

**带鉴权**：

```bash
curl -X POST 'http://localhost:8086/write?db=mydb&u=root&p=123456' \
  --data-binary 'disk_free,hostname=server01 value=442221834240i 1435362189575692182'
```

**指定时间戳精度**：

```bash
curl -X POST 'http://localhost:8086/write?db=mydb&precision=ms' \
  --data-binary 'disk_free value=442221834240i 1435362189575'
```

精度选项：`n`（纳秒）、`u`（微秒）、`ms`（毫秒）、`s`（秒）、`m`（分）、`h`（小时）

**批量写入**：

```bash
curl -X POST 'http://localhost:8086/write?db=<database>' \
  --data-binary @<filename>
```

建议一次批量写 5000-10000 条数据。文件中每条数据占一行，用 `\n` 分隔。

**警告**：使用 `--data-binary` 编码所有行协议数据。其他方法（`-d`、`--data-urlencode`、`--data-ascii`）可能截断换行符。
