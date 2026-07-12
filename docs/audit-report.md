# 站点审查报告（arthaszyb.github.io）

> 审查日期：2026-07-12
> 审查范围：框架与工程、设计与体验、内容质量、索引与标签
> 结论：框架层已过时但可控；**真正的重灾区是内容层**——398 篇文章中仅 3 篇是合格 Markdown，其余为 Evernote 原始导出 dump，必须经脚本化清洗才能在任何现代框架下正常渲染。

---

## 1. 框架与工程

### 现状

| 项目 | 现状 |
|---|---|
| 静态站生成器 | Jekyll（GitHub Pages 内置版本，无 Gemfile 锁定依赖） |
| 主题底子 | Hux Blog（约 2016 年，Bootstrap 3 + jQuery 时代产物） |
| 插件 | 仅 `jekyll-paginate`（且 `_config.yml` 用的是已废弃的 `gems:` 键） |
| 部署 | GitHub Actions（`.github/workflows/pages.yml`，`actions/jekyll-build-pages@v1` → `deploy-pages@v4`，master 触发）✅ 这是现代流程 |
| 域名 | 默认 `arthaszyb.github.io`，无 CNAME |

### 问题：大量死资产

近期站点已经用手写的 `css/site-modern.css` 换肤，`_includes/head.html` 只加载 `syntax.css` + `site-modern.css`，**以下资产均已无引用但仍留在仓库里**：

- `css/bootstrap.css`（141 KB）、`css/bootstrap.min.css`、`css/hux-blog.css`、`css/hux-blog.min.css`
- `js/jquery.js`（247 KB）、`js/bootstrap.js`（66 KB）、`js/hux-blog.js`、`js/jquery.nav.js`、`js/jquery.tagcloud.js`、`js/animatescroll.min.js`、`js/md5.min.js` 等
- `less/` 全目录（Hux LESS 源码）+ `Gruntfile.js` + `package.json` 中的整套 Grunt 工具链
- `_layouts/keynote.html`（8.5 KB 遗留布局，无页面使用）
- `.travis.yml`、`codecov.yml`（Travis CI 早已停服，纯遗留）
- `sw.js` + `pwa/`（PWA 层，对纯静态博客收益极低，且 service worker 缓存策略维护成本高）
- `lucky.html`、`tags.html` 等残页（`tags.html` 与 `works.html` 功能重叠）

### 问题：Jekyll 本身

Jekyll 处于维护模式，生态萎缩；GitHub Pages 内置构建锁死插件白名单，无法用现代 Markdown 管线、图片优化和搜索方案。继续投入定制的边际收益低。

---

## 2. 设计与体验

现有首页（`index.html`）是自定义暖色卡片风（米黄 `#f5f1e8` 底 + 墨绿点缀），信息架构 Home / Works / About 已经过一轮整理，但存在以下缺口：

1. **无深色模式**——当下技术博客的基本预期。
2. **无站内搜索**——398 篇存量文章没有任何检索入口，只能靠 Works 页逐屏滚动。
3. **文章页无 TOC**——长篇技术笔记（部分数百 KB）没有目录导航。
4. **无阅读时长、无相关文章推荐**——文章之间零串联，读完即离开。
5. **排版细节**：中文正文行高偏紧；阅读列宽未针对中文优化；代码块样式依赖 `syntax.css` 老配色。
6. **评论系统**：Gitalk 已配置但 `enable: false`，实际无评论能力（Gitalk 依赖的 GitHub OAuth flow 也已不推荐）。
7. **首页统计卡有硬伤**：`index.html:25` 的 "Writing span" 用 `posts.last`/`posts.first` 拼年份、"Latest update" 与 Featured 卡重复；主题入口硬编码 6 个分类，与实际 31 个分类脱节。

---

## 3. 内容质量（重灾区）

`_posts/` 共 **398 篇**，时间跨度 2013-08-07 → 2025-05-28（主体为 2013–2018 运维/开发笔记，中文为主）。以下统计均为本次实测：

### 3.1 整份 HTML 文档塞进 .md —— 110 篇

110 篇文章的 front matter 之后是完整的 `<!DOCTYPE html><html><head>...` Evernote 导出文档，自带整套内联 `<style>`（含 `en-note.peso`、`body.darkMode` 等规则），**会直接泄漏污染站点主题样式**。且体积巨大：

- `_posts/2013-10-10-Untitled-Note.md` — **446 KB**
- `_posts/2025-05-28-机器学习常见算法分类汇总.md` — **489 KB**（日期是 2025，内容仍是 Evernote HTML dump）

这不是「框架不支持 HTML」的问题——任何框架都会被这些内联样式污染，**必须剥壳转换**。

### 3.2 纯文本导出帖：逐行空行 + 零代码块

- 文本类导出帖（如 `_posts/2013-08-07-awk的笔记.md`）每行之间被插入空行，shell 命令和输出被渲染成一行一段的碎片段落。
- **398 篇中只有 2 篇使用 fenced code block**（均为 2025 年手写帖），0 篇使用 `{% highlight %}`。所有旧文的命令/代码要么是裸段落，要么裹在 Evernote HTML 里。
- 19 篇正文/描述含字面转义 `\n`；3 篇正文含裸 `{{` / `{%`，在 Jekyll 下有 Liquid 误解析风险。

### 3.3 图片引用系统性损坏

- **45 篇用 `<img>` 标签，仅 1 篇用 Markdown 图法**。
- 图片资产在 `assets/evernote/` 三个子目录（`PHP-[2]`、`RedHat`、`Winodws-(Evernote-import-on-2016-08-28T23-50-24)`——目录名本身带括号和拼写错误），共 **129 个无扩展名文件**（`Evernote`、`Evernote (1)` … `Evernote (104)`，实测为 GIF/PNG 等图片数据）。
- `src` 普遍含未编码空格和括号：`src="/assets/evernote/RedHat/Evernote (65)"`。
- 相对路径引用指向不存在的目录：如 `src="机器学习常见算法分类汇总 files/Evernote"`（`... files/` 目录不在仓库中）。
- 部分外链图片已死（如 `pic3.zhimg.com` 带防盗链）。

### 3.4 文件名混乱

- **96 篇文件名为 `Untitled-Note`**（靠 hash 后缀区分，如 `2013-11-06-Untitled-Note-fd12f87a.md`）。
- 大量文件名带空格、全角标点、省略号甚至结尾冒号：`2014-04-30-nux-curl是一个利用URL规则...下载工具。.md`、`2013-11-19-提取ip地址：.md`。

### 3.5 Front matter 三种不兼容风格并存

| 风格 | 数量 | 特征 |
|---|---|---|
| Evernote 导出 | ~395 | `title`/`date`(带时区时间戳)/`categories`/`tags`/`description`/`source: evernote-local-db`；无 `layout`；`description` 是截断到句中的自动摘要，含转义 `\n` |
| 旧 Hux 主题 | 1 | `layout: post`、`subtitle`、`header-img`、`catalog` 等主题私有字段 |
| 2025 手写 | 2 | 干净的最小 front matter，正文为合格 Markdown |

---

## 4. 索引与标签

### tags：实际不可用

| 值 | 篇数 |
|---|---|
| `["Pages"]`（Evernote 笔记本名，无意义） | 218 |
| `[]`（空） | 157 |
| `["新分区 1/2/3"]`（Evernote 默认分区名，垃圾值） | 20 |
| 有效标签列表 | 2 |
| 裸 `tags:`（格式错误） | 1 |

**约 375/398 篇没有任何有效标签。**

### categories：31 个值，中英混杂 + 重复分裂

- Evernote 笔记本去重后缀直接进了分类：`MySQL [2]`(38)、`Nginx [2]`(14)、`PHP [2]`(11)——且同时存在 `PHP`(2)，即 **`PHP` 与 `PHP [2]` 分裂**。
- 中英混杂：`RedHat`(94)、`shell`(37)、`python`(32)、`监控告警`(30)、`docker`(22)、`网络`(17)、`HA&LB`(14)、`科学上网`(7)、`其他`(9)、`未分类`(1)、`AI`(3) 与 `机器学习`(3) 并存等。
- 大小写/风格不一：`web` vs `Windows` vs `win`，引号单值列表 vs 裸多值列表。
- 模板层为兼容这些脏值，`works.html` 和 `_layouts/post.html` 里堆了 6 连 `replace` 过滤器来清洗锚点 ID——治标不治本。

---

## 5. 总体结论

1. **框架**：Jekyll + Hux 底子已到寿命，且 90% 的主题资产是死代码。换成 Astro（已确认）成本可控——文章本来就要全量清洗，顺势迁移是最佳时机。
2. **设计**：现有换肤是过渡态，缺深色模式/搜索/TOC 等基本能力，应随框架迁移一并重做为极简黑白灰设计系统。
3. **内容**：**这是本次现代化的核心工作量**。110 篇 HTML dump 剥壳转 Markdown、96 篇补标题、129 张图片修复、逐行空行折叠 + 代码块识别，全部需要可重跑的迁移脚本，人工只处理脚本标记的边界案例。
4. **索引**：现有 tags 全部作废重建；31 个 categories 按映射表收敛到 ~10 个规范主题。

具体执行步骤见同目录 `modernization-plan.md`。
