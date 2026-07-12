# 博客现代化执行方案（Astro 迁移 + 内容清洗）

> 本文档是可直接执行的操作手册。执行者按 Phase 1 → 4 顺序推进，每个 Phase 结束时必须满足对应验收标准再进入下一阶段。
> 所有技术决策已定稿，**不要重新发起方案讨论**；遇到文档未覆盖的边界案例，按「保守处理 + 记录到 `docs/migration-notes.md`」原则自行决定。
> 前置阅读：同目录 `audit-report.md`（现状与问题数据）。

## 已确认的产品决策

| 决策项 | 结论 |
|---|---|
| 框架 | **Astro 5.x**（静态输出，零默认 JS） |
| 视觉 | 极简黑白灰 + 单点缀色，深色模式（系统偏好 + 手动切换） |
| 功能 | Pagefind 全文搜索、文章 TOC、阅读时长、相关文章、giscus 评论 |
| 内容 | 398 篇全量清洗为规范 Markdown，标签体系重建 |
| URL | 文章统一 `/posts/<slug>/`，**不做旧 URL 逐条 redirect**（旧 URL 含中文路径且 SEO 存量小，由新 sitemap 让搜索引擎重新收录） |
| 部署 | GitHub Actions 构建 Astro → GitHub Pages，master 触发 |

---

## Phase 1 — Astro 站点骨架

### 1.1 初始化

在仓库根目录新建 Astro 工程（与旧 Jekyll 文件暂时共存，Phase 3 再清理）：

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-git
npm install @astrojs/rss @astrojs/sitemap pagefind
npm install -D reading-time
```

`astro.config.mjs` 要点：

```js
export default defineConfig({
  site: 'https://arthaszyb.github.io',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
```

### 1.2 Content Collection schema

`src/content.config.ts`：

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    category: z.string(),          // 单一规范主题，见 Phase 2 映射表
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    source: z.string().optional(), // 保留 "evernote-local-db" 溯源标记
    lang: z.enum(['zh', 'en']).default('zh'),
  }),
});
export const collections = { blog };
```

### 1.3 页面与路由

| 路由 | 内容 |
|---|---|
| `/` | 首页：站点简介一段 + 最新 1 篇精选卡 + 近期 8 篇列表 + 主题入口（从 collection 动态取 category 计数，**不硬编码**） |
| `/posts/` 与 `/posts/2/` … | 全文章分页列表（`paginate()`，每页 20） |
| `/posts/<slug>/` | 文章页（见 1.5） |
| `/topics/` | 主题总览（category 卡片 + 计数） |
| `/topics/<category>/` | 单主题文章列表 |
| `/tags/<tag>/` | 单标签文章列表（tags 页不做总览，入口在文章页 chip） |
| `/archive/` | 按年分组的全量归档（年份倒序，标题 + 日期一行一条） |
| `/about/` | 迁移现有 `about.html` 文案 |
| `/search/` | Pagefind UI 页 |
| `/404` | 404 页 |
| `/rss.xml` | `@astrojs/rss` 生成 |

`draft: true` 的文章在所有列表、RSS、sitemap 中排除。

### 1.4 设计系统（极简黑白灰）

单个全局样式文件 `src/styles/global.css`，CSS custom properties 双主题：

```css
:root {
  --bg: #ffffff; --fg: #1a1a1a; --fg-muted: #6b6b6b;
  --border: #e5e5e5; --surface: #f7f7f7; --accent: #2563eb;
  --content-width: 72ch;
}
:root[data-theme='dark'] {
  --bg: #111113; --fg: #e8e8e8; --fg-muted: #9a9a9a;
  --border: #2a2a2c; --surface: #1b1b1d; --accent: #60a5fa;
}
```

要求：

- **防闪烁**：`<head>` 内联脚本先于渲染读取 `localStorage.theme`，缺省跟随 `prefers-color-scheme`，写入 `document.documentElement.dataset.theme`。导航栏放切换按钮（sun/moon inline SVG）。
- **中文排版**：正文 `line-height: 1.8`；`font-family` 以系统栈为主（`-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`），不引入 webfont；正文列宽 `max-width: var(--content-width)`。
- 代码块：Shiki 双主题（配合 `data-theme` 切换），横向溢出 `overflow-x: auto`。
- 页面级 JS 仅三处：主题切换、Pagefind UI、giscus。**不引入任何前端框架**。
- 布局组件：`BaseLayout.astro`（head/meta/nav/footer）、`PostLayout.astro`。head 迁移现有 `_includes/head.html` 的 SEO 能力（OpenGraph、Twitter card、JSON-LD、canonical）。

### 1.5 文章页功能

- **TOC**：`render()` 返回的 `headings` 生成侧边目录（≥1024px 固定右侧，窄屏折叠成 `<details>` 置顶）；h2/h3 两级。
- **阅读时长**：remark 插件把 `reading-time` 结果注入 frontmatter（Astro 官方 recipe：`remarkReadingTime`），中文按字符数计（`reading-time` 对 CJK 的默认处理可接受）。
- **相关文章**：构建期计算——同 category 中 tags 交集数排序，取前 4，不足则用同 category 最新文章补足。
- **giscus**：文末挂载，`data-theme` 跟随站点主题切换（监听切换事件后 postMessage 更新 iframe）。giscus 需要仓库开启 Discussions 并安装 giscus app——执行时若发现未开通，先把组件写好并用配置开关默认关闭，在 `migration-notes.md` 里提醒站长开通后填入 `repoId`/`categoryId`。
- 文章元信息行：日期 · 阅读时长 · category 链接；文末 tags chip。

### 1.6 搜索

Pagefind 走构建后索引：`package.json` 中 `"build": "astro build && pagefind --site dist"`。`/search/` 页加载 `/pagefind/pagefind-ui.js`（构建产物，非外部 CDN），UI 样式覆盖为站点变量。中文分词 Pagefind 自带支持，验收时用中文关键词实测。

### Phase 1 验收标准

- [ ] `npm run build` 零错误零警告（先用 3 篇干净文章 + 2 篇手工样例充当内容）
- [ ] 深色/浅色双向切换无闪烁，刷新后记忆保持
- [ ] TOC、阅读时长、相关文章、tags chip 在样例文章上全部工作
- [ ] Lighthouse（移动端模拟）Performance / A11y / SEO ≥ 90

---

## Phase 2 — 内容清洗迁移管线（核心工作量）

### 2.1 原则

- 写**可重跑的幂等脚本** `scripts/migrate-content.mjs`（Node，依赖 `turndown` + `turndown-plugin-gfm`、`gray-matter`、`file-type`），输入 `_posts/`，输出 `src/content/blog/`。**绝不手工逐篇改**，人工只处理脚本报告的边界案例。
- 脚本每次运行输出报告 `docs/migration-report.json`：每篇的分类判定、转换动作、警告（无标题可派生、图片缺失、死外链等）。
- 原始 `_posts/` 在验收前不删除。

### 2.2 分类判定与转换

按正文特征把 398 篇分四类处理：

| 类型 | 判定 | 处理 |
|---|---|---|
| A. 整份 HTML dump（110 篇） | 正文含 `<!DOCTYPE html>` 或 `<html` | 用正则/DOM 提取 `<en-note>`（或 `<body>`）内容，丢弃 `<head>`、全部 `<style>`/`<script>`、Evernote meta；再过 turndown（GFM 插件开表格/删除线）转 Markdown |
| B. HTML 片段 | 无 DOCTYPE 但 HTML 标签密度高（`<div`/`<span`/`<table` 等） | 直接过 turndown |
| C. 纯文本逐行空行帖（多数） | 无 HTML 标签、连续「内容行+空行」模式占比高 | 折叠成对空行为单换行；代码识别：连续 ≥2 行以 `#`/`$`/`>` 提示符开头、或匹配常见命令模式（`yum|awk|sed|grep|mysql>|systemctl` 等开头）、或含大量 `--option` 的行块，包成 ```` ```bash ```` fenced block |
| D. 已干净（3 篇） | 含 fenced block 或人工白名单 | 只做 front matter 归一 |

统一后处理（所有类型）：

- 清理字面 `\n` 转义、多余 `&nbsp;`、连续 3+ 空行压成 1 个
- 正文裸 `{{`/`{%` 无需转义（Astro 不解析 Liquid），但要在报告中列出以便抽查
- turndown 产物中残留的 `style=`/`class=` 属性、空 `<div>`/`<span>` 全部剥掉

### 2.3 Front matter 归一

- `title`：**96 篇 Untitled** 按优先级派生：正文第一个 heading → 正文第一句（≤30 字符，去标点）→ 兜底 `{规范category}笔记 {YYYY-MM-DD}`。派生结果全部进 `migration-report.json` 供人工过目。
- `date`：保留原时间戳（转 ISO 格式）。
- `description`：重新生成——取清洗后正文首个完整句子（截 80–160 字符，不得截断在句中），去掉 `\n` 转义。
- `source: evernote-local-db` 保留。
- 旧 Hux 字段（`layout`/`subtitle`/`header-img`/`catalog`）全部删除。

### 2.4 slug 与文件名

- 输出文件名 = slug：`YYYY-MM-DD-<ascii-slug>.md`，slug 规则：英文/数字保留小写化，中文标题取 2–4 个核心词转拼音（用 `pinyin-pro`）或意译英文关键词，长度 ≤ 60 字符，只含 `[a-z0-9-]`。
- slug 冲突时追加 `-2`、`-3`。
- 路由 slug（front matter 不写 slug，用文件名去日期前缀，在 `getStaticPaths` 中处理，或直接把 slug 写入 frontmatter——二选一后全站一致）。

### 2.5 图片修复

1. 遍历 `assets/evernote/**` 全部 129 个无扩展名文件，用 `file-type` 检测真实格式，复制到 `public/images/legacy/<hash或序号>.<ext>`（文件名 ASCII 化）。建立「旧路径 → 新路径」映射表。
2. 重写正文引用：
   - 绝对路径 `/assets/evernote/...`（含空格/括号/HTML entity 变体）→ 查映射表替换为 `![](/images/legacy/xxx.png)`
   - 相对路径 `... files/Evernote (n)` → 按文件名在三个资产目录中就近匹配（同 category 目录优先）；匹配不到的在报告中标记 `image-missing`，正文替换为 `<!-- image lost in migration: 原路径 -->` 注释
   - 死外链（zhimg 等）：不下载不替换，报告标记 `external-image`，人工决定
3. 所有 `<img>` 一律转 Markdown 图法。

### 2.6 标签体系重建

**category 映射表（写死，31 → 12）：**

| 旧值 | 新值 |
|---|---|
| `RedHat`、`yum` | `linux` |
| `shell` | `shell` |
| `python` | `python` |
| `MySQL [2]`、`Redis` | `database` |
| `监控告警` | `monitoring` |
| `docker`、`kubernetes`、`VM` | `container-virt` |
| `网络`、`科学上网`、`CDN` | `network` |
| `Nginx [2]`、`Apache`、`HA&LB`、`web`、`js` | `web-infra` |
| `PHP [2]`、`PHP` | `php` |
| `BigData` | `bigdata` |
| `AI`、`机器学习`、`理论模型`、`LLM`、`Agent`、`MCP`、`技术笔记`、`Debug`、`极客` | `ai` |
| `Windows`、`win`、`vnc`、`其他`、`未分类` | `misc` |

多值 categories 取映射后第一个非 `misc` 值为 `category`，其余降级进 `tags`。

- 展示名映射（category slug → 中文显示名）放在 `src/data/categories.ts`：`linux → Linux`、`monitoring → 监控与可观测性`、`container-virt → 容器与虚拟化`、`web-infra → Web 基础设施`、`ai → AI 与机器学习`、`misc → 杂记` 等。
- **tags 重建**：废弃 `Pages`/`新分区 N`/空值。脚本按正文关键词匹配初填（维护一个 ~40 词的关键词→tag 词典：`nginx`、`mysql`、`iptables`、`systemd`、`zabbix`、`lvs`、`keepalived`、`tcpdump`、`kvm` 等），每篇 2–5 个，best-effort，允许留空。

### Phase 2 验收标准

- [ ] 脚本幂等：连续跑两次输出无 diff
- [ ] 398 篇全部产出到 `src/content/blog/`，`npm run build` 全量通过 schema 校验
- [ ] `migration-report.json` 中 `image-missing`/`title-fallback` 等警告项逐条过目，边界案例处理记录在 `docs/migration-notes.md`
- [ ] 抽查渲染：A/B/C/D 四类各 ≥5 篇，确认无 Evernote 样式泄漏、无 `<style>` 残留、代码块和图片正常、标题非乱码
- [ ] `grep -r "DOCTYPE\|en-note\|<style" src/content/blog/` 零命中

---

## Phase 3 — 部署切换与仓库清理

### 3.1 部署

替换 `.github/workflows/pages.yml`：

```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [master] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

（`withastro/action` 内部执行 install + `npm run build`，会一并跑 Pagefind 索引。）

### 3.2 清理清单（迁移验收后删除）

- Jekyll：`_layouts/`、`_includes/`、`_config.yml`、`index.html`、`works.html`、`tags.html`、`about.html`、`lucky.html`、`404.html`、`offline.html`、`feed.xml`、`feed.xsl`、`sitemap.xml`（改由集成生成）、`robots.txt`（Astro 里放 `public/robots.txt` 重建）
- 主题遗产：`css/`、`js/`、`less/`、`fonts/`、`Gruntfile.js`、旧 `package.json` 的 Grunt 依赖（初始化 Astro 时已重写）
- CI 遗产：`.travis.yml`、`codecov.yml`
- PWA：`sw.js`、`pwa/`
- 内容源：`_posts/` → 验收通过后删除（git 历史里永远可找回）；`assets/evernote/` → 图片已复制到 `public/images/legacy/` 后删除
- `img/` 中仅保留仍被 about 页/favicon 引用的文件，其余删除

### Phase 3 验收标准

- [ ] Actions 构建部署成功，线上站点为 Astro 版本
- [ ] 仓库根目录只剩 Astro 工程结构 + `docs/` + `README.md`（README 重写为新架构说明）
- [ ] `robots.txt`、`rss.xml`、`sitemap-index.xml` 线上可访问

---

## Phase 4 — QA 验收

- [ ] 全量构建零错误；构建产物中 `grep -rl "en-note" dist/` 零命中
- [ ] 跑一次内链/图片检查（如 `npx linkinator dist --recurse --silent`），修复全部内部 404
- [ ] Pagefind 中文搜索实测（如搜「防火墙」「mysql 主从」能命中旧文）
- [ ] 深色模式：手动切换 + 系统偏好两条路径、代码块和 giscus 同步换肤
- [ ] 移动端 375px 宽度下无横向滚动；TOC 折叠正常
- [ ] Lighthouse 移动端四项 ≥ 90
- [ ] RSS 用阅读器实测可订阅、条目 description 无 HTML 残渣
- [ ] `docs/migration-notes.md` 汇总：标题派生清单、丢失图片清单、死外链清单、待站长决定事项（giscus 开通等）

---

## 执行注意事项

1. **分支纪律**：所有工作在 `claude/blog-modernization-audit-eqy1ox` 上进行，按 Phase 分 commit（`phase1: astro scaffold`、`phase2: content migration` …），不直接推 master。上线切换（merge 到 master）由站长确认后执行。
2. **不要求一次成型**：Phase 2 脚本先在 20 篇抽样上跑通四类转换，人工确认质量后再全量执行。
3. **中间产物**：`migration-report.json` 提交进仓库（在 `docs/`），便于站长审查；临时脚本调试文件不要提交。
4. 遇到本方案与实际仓库状态冲突（例如文件已被移动），以仓库现状为准，在 `migration-notes.md` 记录偏差。
