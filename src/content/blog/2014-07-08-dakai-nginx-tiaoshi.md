---
title: 打开nginx调试
date: '2014-07-08'
description: nginx 调试模式的启用方法。通过编译选项和配置文件设置启用调试日志，并通过日志级别和二级选项灵活控制调试信息的详尽程度。
category: web-infra
tags:
  - nginx
draft: false
source: evernote-local-db
lang: zh
origin_url: http://lenky.info/archives/2011/09/67
---

## 第一步：编译时启用调试

使用 `--with-debug` 选项重新编译 nginx：

```bash
sudo ./configure --with-debug
sudo make
sudo make install
```

**注意**：`--with-debug` 选项必须在编译时指定，后续的讨论都基于此选项启用。

## 第二步：配置文件中设置日志级别

在 `nginx.conf` 的 `http {}` 块中配置 error_log：

```nginx
error_log logs/error.log debug;
```

debug 级别会记录所有信息。在源代码文件 `ngx_log.c` 的函数 `ngx_set_error_log_levels()` 末尾代码可以看到，如果设置为 debug 级别，程序会自动扩展为 `NGX_LOG_DEBUG_ALL` 以记录所有打印信息。

## 第三步：使用二级日志选项精细化控制

如果 debug 级别输出过多信息不利于定位问题，可以使用二级选项限制输出范围：

```nginx
error_log logs/error.log notice;
error_log logs/error.log debug_http;
```

此例仅记录与 HTTP 相关的调试信息。

## 日志级别规则

日志级别分为两个层次：

**第一级别**（互斥）：取其一即可
- stderr、emerg、alert、crit、error、warn、notice、info、debug

**第二级别**（多选，仅在第一级别为 debug 时有效）：
- debug_core、debug_alloc、debug_mutex、debug_event、debug_http、debug_mail

示例：

```nginx
# 正确：第一级为 debug，可指定多个第二级选项
error_log logs/error.log debug_http;
error_log logs/error.log debug_core;

# 错误：非 debug 级别下指定第二级选项会导致启动失败
error_log logs/error.log notice;
error_log logs/error.log debug_http;  # 这会报错
```

如果同时指定多条第一级别的配置，nginx 启动会报错提示日志级别重复。

**注意**：stderr 无法被配置为第一级别，一些早期版本中 emerg 可能是级别最低的。
