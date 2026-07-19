# 站点优化 backlog（loop 自主清理清单）

> 由 loop 逐轮处理。每完成一项勾选并 commit；每轮结束若有改动就开 PR 合并到 master。全部清空后 loop 自行停止。
> 铁律：技术内容（命令/配置/代码/数字）一字不改；只写合法 UTF-8；`npm run build` 必须零错误才提交。

## A. 残留 HTML 块 → 转 Markdown（5 篇 .md）

以下 `.md` 文章正文里残留 `<table>/<div>/<span>` 等 HTML，需转成规范 Markdown（表格转 md 表格、div/span 去壳保留文本）。**先逐篇确认 HTML 是否在 ```` ```html ```` 代码块内**——若是文章正文展示的源码（如 oncall 的 Vue 前端代码），属合法内容，保留不动。

- [x] `2018-08-23-luyou-xiugai-route.md`（3 处）
- [x] `2018-03-08-grafana-mysql-shuju-yuan.md`（1 处）
- [x] `2018-11-01-linux-huanjing-bianliang-dejia-zaishun-xu.md`（2 处）
- [x] `2013-12-31-sshfs-guazai-yuancheng-mulu.md`（1 处）
- [x] `2018-02-06-oncall-xiaogong-juqian-duandai-majie-du.md`（10 处——极可能是代码块内合法 HTML，核对后多半跳过）

> 两个 `.html` 文件（`2026-07-14-html-zhifa-shili.html`、`2026-07-15-rotmire-sv-hunter-analysis.html`）是 HTML 直发文，**跳过**。

## B. 死外链图片（1 篇）

- [x] `2020-07-16-bios-uefi-mbr-legacy-gpt-denggai.md`：正文有指向已失效图床（zhimg 防盗链）的 Markdown 图片。处理：确认图片不可达后，替换为 `<!-- image unavailable: 原URL -->` 注释（不删周围文字），或若图无关紧要直接删该图行。

## C. 标签体系收敛（114 → 目标 ~50）

现状 114 个 distinct tag，其中 65 个只出现 1 次，碎标签多、大小写/中英不一。目标：向 `docs/content-editing-guide.md` §2 的受控词表靠拢。

- [ ] 生成全量 tag 频次表，人工/脚本制定合并映射（如 `k8s`→`kubernetes`、单次出现的边缘词并入近义受控词或删除）
- [ ] 写一个一次性脚本按映射表批量改 frontmatter 的 tags（只动 tags 字段），跑完删脚本
- [ ] `npm run build` 校验，抽查 `/tags/` 页

## D. 草稿与极短文复核（26 草稿 + 4 漏网短文）

- [ ] 逐一过 26 篇 `draft: true`：确认都属空文/重复/无价值（保持草稿），如有误杀的有内容文章则恢复 `draft: false`
- [ ] 4 篇非草稿但正文 <200B（`2014-05-09-windows-xia-nginx-php`、`2014-05-29-gongxiang-neicun`、`2015-10-27-vim-niantie-kaitou-neirong-huiluan`、`2017-10-19-tc-yinqi-dewen-tipai-cha`）：短但可能是有效小贴士（如 vim `:set paste`）。逐一判断——有实用价值则补 1-2 句说明留下，纯残渣则 draft。

## E. 全站体检（每轮顺带扫，发现即修）

- [ ] 内链/图片 404（build 后 linkinator 抽扫 dist）
- [ ] `astro check` 的 duplicate-id 警告根因（是否有同 slug 文件）
- [ ] description 质量抽查（列表页门面）
- [ ] 已知非阻塞：`og:image` 缺失（社交预览无图）——如要补，做一张站点默认 OG 图放 public/ 并在 BaseLayout 引用

## 完成标准

A–D 全部勾选、E 无新发现、`npm run build` 零错误、相关 PR 合并到 master。届时 loop 停止（CronDelete）。
