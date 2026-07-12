---
title: 监控远程端口
date: '2014-07-09'
description: >-
  <table<tbody<tr<td<div<br</div<div<span<spanTCP端口
  :</span</span</div<ol<li<div<input</div<div<div<span<spannc -w 1 127.0.0.1 53
  && echo true || echo
category: linux
tags:
  - 监控告警
draft: false
source: evernote-local-db
lang: zh
---
<table><tbody><tr><td><div><br></div><div><span><span>TCP端口 :</span></span></div><ol><li><div><input></div><div><div><span><span>nc -w 1 127.0.0.1 53 && echo true || echo false</span></span></div></div></li></ol><div><br></div><div><span><span>UDP端口:</span></span></div><ol><li><div><input></div><div><div><span><span>nc -w 1 -u 127.0.0.1 53 && echo true || echo false</span></span></div></div></li></ol><div><br></div></td></tr></tbody></table>
