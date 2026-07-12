# 迁移备忘录

> 按 Phase 追加记录：脚本/实现遇到的边界案例、对方案的偏差处理、留给站长的待办事项。
> Phase 2/3/4 执行者请继续在本文件追加，不要覆盖已有条目。

---

## Phase 1 — Astro 站点骨架

### 待站长处理

1. **giscus 评论尚未开启。** `src/data/site.ts` 中 `giscus.enabled = false`，文章页完全不渲染评论组件（无脚本、无占位）。开通步骤：
   1. 仓库 Settings → General 启用 Discussions
   2. 安装 [giscus app](https://github.com/apps/giscus)
   3. 到 https://giscus.app 生成配置，把 `repoId`/`categoryId` 填入 `src/data/site.ts` 的 `giscus` 对象
   4. 把 `enabled` 改成 `true`

### 技术偏差记录

1. **Astro 版本**：安装时 npm 上 `astro` 最新版是 7.0.7，按方案「Astro 5.x」的既定决策固定安装 `5.18.2`（5.x 系列最新版），未升级到 7。`@astrojs/rss`/`@astrojs/sitemap`/`pagefind` 均安装了各自当前最新兼容版本。

2. **阅读时长实现方式与方案文档描述不同**：方案 1.5 节提到「Astro 官方 recipe：`remarkReadingTime`」，通过 remark 插件把结果写入 `data.astro.frontmatter`。实测这个 recipe 是为旧版 content collections（`type: 'content'`）设计的——旧版会在 schema 校验前把整个集合渲染一遍，remark 插件的注入能在校验前生效。但本方案用的是 Content Layer 的 `glob()` loader（1.1 节要求安装 `astro/loaders` 的 `glob`），它在 sync 阶段只读取原始 frontmatter 就直接做 schema 校验，markdown 渲染（remark 插件运行的时机）被推迟到逐页调用 `render(entry)` 时才发生——校验完成后才渲染，注入的字段永远读不到。
   实际实现改为：`src/lib/blog-loader.ts` 包一层自定义 loader，在底层 `glob()` loader 完成 `load()` 之后，直接对每个 entry 的 `body`（原始 Markdown 正文）跑 `reading-time`，把结果通过 `context.store.set()` 写回 `data.minutesRead`。
   踩坑记录：`DataStore.set()` 在传入的 `digest` 与已存条目相同时会静默跳过更新（返回 `false`），必须在覆盖写入时不传 `digest` 字段，否则「注入」永远不生效（当时表现为所有文章「1 分钟阅读」，即 schema 里的 `.optional()` 兜底值）。
   影响：Phase 2 的迁移脚本产出 frontmatter 时**不需要**自己写 `minutesRead` 字段，它是构建期从正文动态算出来的，脚本可以忽略这一项。

3. **样例文章的 category 分配为凑齐「相关文章」演示做了取舍**：任务要求的 3 篇迁移样例分类固定为 `ai`/`python`/`misc`（一对一），2 篇手写样例最初分别用 `linux`、`web-infra`。这样 5 篇文章分布在 4 个不同 category 里，每个 category 只有 1 篇，"相关文章"（同 category 取交集）逻辑永远返回空列表，验收清单里「样例长文的...相关文章...都渲染」这一项测不出来。
   处理：把手写长文样例（`2026-07-01-sample-linux-troubleshooting-checklist.md`，内容是 systemd/NFS 故障排查）的 `category` 从 `linux` 改成 `web-infra`，与另一篇手写样例（Nginx 速查表）归到同一 category，使相关文章功能有真实数据可验证。这两篇文章都标注了「迁移测试样例，Phase 2 完成后删除」，Phase 2 全量迁移后这个人为的 category 归并会随文件一起消失，不影响正式内容的分类。`src/data/categories.ts` 里仍保留了 `linux` 的展示名映射（暂时未被任何文章使用），留给 Phase 2 使用。

4. **迁移 `_posts/2025-05-26-llm-notes1.md` 时清理了一个孤立的 fenced code block 标记**：原文件最后一行是单独一个 ```` ``` ````，全文没有与之配对的开头 ```` ``` ````（原文本身没有使用围栏代码块），推测是原作者手误。复制到 `src/content/blog/2025-05-26-llm-notes-aigc-agi-mcp.md` 时去掉了这一行。Phase 2 脚本处理其余「已干净」类文章时，可以留意类似的孤立围栏标记。

5. **OpenGraph `og:image` 暂缺**：旧 `_includes/head.html` 的 `og:image`/`twitter:image` 指向 `site.header-img`（`img/post-bg-desk.jpg`，Hux 主题背景图，风格与新的黑白灰设计不符）。新 `BaseLayout.astro` 迁移了 OpenGraph/Twitter card/JSON-LD/canonical/description 等其余 SEO 能力，但没有设置 `og:image`/`twitter:image`（Twitter card 类型相应用 `summary` 而非 `summary_large_image`）。等有合适的站点级分享图或逐篇封面图方案时再补上，不阻塞 Phase 1 验收（方案 1.4 节只列了 OpenGraph/Twitter card/JSON-LD/canonical，未强制要求图片）。

6. **Jekyll 与 Astro 工程共存期间的潜在冲突（留给 Phase 3 处理，非 Phase 1 阻塞项）**：`_config.yml` 的 `exclude:` 列表只排除了 `less`/`node_modules`/`Gruntfile.js`/`package.json`/`README.md`，没有覆盖新增的 `src/`、`astro.config.mjs`、`tsconfig.json`、`public/`。如果现有的 `.github/workflows/pages.yml`（`actions/jekyll-build-pages@v1`）在 Phase 3 切换部署方式之前被触发构建，Jekyll 会尝试把 `src/content/blog/*.md`（带合法 front matter）当作普通页面处理，产出到 `_site/src/content/blog/...`，属于无害但混乱的死产物，不会污染正式页面路由。Phase 1 验收只要求本地 `npm run build` 通过，不涉及线上部署，因此未处理；Phase 3 替换 workflow 时一并清理。

### Phase 1 自测结果摘要（供参考，详见任务汇报）

- `npm run build`（`astro build && pagefind --site dist`）本地全量跑通，0 error / 0 warning。
- `npx astro check`（strict TS）在纯净状态下 0 errors / 0 warnings（仅对未触碰的旧 Jekyll `Gruntfile.js`/`sw.js` 给出 2 条无害 hint，已在 `tsconfig.json` 里 exclude 掉旧资产目录）。
- 用 Playwright + Chromium 做了一次浏览器级冒烟测试（暗色系统偏好下首屏即为深色、无控制台报错；手动切换主题 + 刷新后 `localStorage` 记忆保持；文章页 TOC 在 ≥1024px 显示侧栏版、<1024px 显示 `<details>` 折叠版且两者互斥；375px 宽度下长文页面与带表格页面均无横向滚动；`/search/` 页面能加载本地 `/pagefind/pagefind-ui.js` 并对中文关键词返回结果）。

---

## Phase 2 — 内容清洗迁移

脚本：`scripts/migrate-content.mjs`。全量运行结果：398/398 篇处理成功，0 failed。

### 最终统计

| 分类 | 篇数 |
|---|---|
| A（整份 HTML dump） | 110 |
| B（HTML 片段，无 DOCTYPE） | 0（本语料库实际不存在，见下方说明） |
| C（纯文本逐行空行帖） | 285 |
| D（已干净） | 3 |

| 警告类型 | 数量 | 说明 |
|---|---|---|
| `title-fallback` | 1 | 仅 `2017-11-21-无标题页.md`；详见下方"标题派生"一节 |
| `image-missing` | 1 | `2025-05-28-机器学习常见算法分类汇总.md`（相对路径图片引用，`assets/evernote/` 下确实找不到对应目录/文件） |
| `external-image` | 1 | `2020-07-16-Untitled-Note.md` 引用 `https://pic3.zhimg.com/...`（知乎图床外链，未下载未替换，按方案标记） |
| `empty-body` | 1 | `2018-04-30-HDFS的几种访问方式...md`；原始笔记本身除标题外无正文，清理"标题回声行"后自然变空，属实事求是的迁移结果，非脚本 bug |
| `failed` | 0 | 无（含最大 1.09MB 的 `_posts/2014-07-03-Untitled-Note.md` 在内全部解析成功） |

### 与 audit-report.md 预期的偏差（按"以仓库现状为准"原则处理）

1. **"96 篇 Untitled 需要补标题"实际不成立。** `audit-report.md` 的 96 篇统计是按*文件名*包含 `Untitled-Note` 得出的，但检查这 96 篇的 front matter 后发现 `title` 字段早已在很久以前的一次提交（`d68d34e "Rebuild site around imported notes"`，早于本次现代化项目）中被回填成从正文 `<h1 class="noteTitle">` 提取的真实标题（文件名保留 Evernote 原始 "Untitled Note" 命名只是历史遗留，不代表内容本身缺标题）。全量扫描确认 398 篇中字面值为空、或匹配 `Untitled`/`无标题` 占位模式的 `title` 只有 1 篇（`2017-11-21-无标题页.md`，这篇连正文本身都只有日期时间戳，是真·空笔记）。脚本仍然实现了完整的三级 fallback（正文首个 heading → 首句 ≤30 字 → `{category}笔记 {date}`），并且新增了"heading/首句本身也是占位符（如'无标题页'）就继续往下一级 fallback"的兜底，只是这个语料库里几乎用不上。
2. **B 类（HTML 片段，无 DOCTYPE）在本语料库中样本数为 0。** 判定逻辑（`<!DOCTYPE html>`/`<html` 缺失但含 `<div>`/`<span>`/`<table>` 等标签）保留在脚本里以保证方案结构完整和未来可复用性，但实测 398 篇里所有含 HTML 标签的文章都同时含 `<!DOCTYPE html>`（即全部落入 A 类），没有"纯片段无壳"的情况。抽样验收环节因此天然无法凑出 5 篇 B 类；已在下方验收记录里说明。

### 图片修复

- `assets/evernote/**` 129 个文件全部通过 `file-type` 检测出真实格式并复制到 `public/images/legacy/`，文件名格式 `legacy-<md5(相对路径)前10位>.<ext>`（确定性哈希，保证幂等）。
- 正文里出现的图片引用共约 138 处：136 处成功解析为本地图片（含绝对路径 `/assets/evernote/...` 和相对路径 `"笔记标题 files/Evernote (n)"` 两种写法）、1 处外链（知乎图床死链，标记 `external-image`，未下载）、1 处彻底找不到资产（标记 `image-missing`，正文替换为 `<!-- image lost in migration: 原路径 -->` 注释）。
- **相对路径匹配算法的一个坑**：129 个资产文件里有 9 个文件名字面就是裸 `Evernote`（无序号后缀），分布在不同笔记的图片文件夹里。第一版实现在"精确目录匹配失败"后直接退化成"全局按裸文件名搜索，取第一个命中"，这会把 A 笔记的图片错误地安在 B 笔记身上（同名不同图）。修复为三级查找：① 精确的 `<父目录>/<文件名>` 匹配；② 按"笔记标题 files"文件夹名（忽略具体在哪个大分类目录下）匹配同一篇笔记自己的资产文件夹；③ 只有当裸文件名在全部 129 个资产里**唯一**时才允许全局按裸文件名兜底；否则一律标记 `image-missing`，不猜测。

### 已知的、有意不修复的原始内容瑕疵

以下问题源自原始 Evernote 导出内容本身（部分甚至早于本次迁移项目、早于 Jekyll 博客建立时就已存在于源笔记里），迁移脚本按"保守处理"原则未尝试语义级修复，避免在自动化清洗中引入新的臆测性错误：

1. **约 30 篇文章的命令行选项用的是"–"（en-dash，微软智能标点自动替换的产物）而不是"--"（双连字符）**，例如 `–prefix=/usr/local/nginx`。脚本的代码块识别（2.2 节）已经把"行首是 `–`/`--` 加字母"这种情况也当作代码行处理，尽量把这些行仍然收进 fenced code block，但无法把 `–` 改写回 `--`（那样会篡改用户可能就是打算复制粘贴执行的原始文本）。
2. **部分文章存在“单词中间被截断换行”的现象**，例如 `/usr/sbin/nginx` 在原始纯文本导出里被拆成 `/usr/sbin` 换行 `nginx`。这是原始 Evernote 导出/复制粘贴时留下的伪影，不是本次迁移引入的，脚本未做跨行语义拼接（风险太高，容易把本不该合并的两行强行拼在一起）。受影响的文章代码块观感会有些破碎，建议人工按需修补（不阻塞发布）。
3. **少数含"跨单元格多行内容"的复杂表格**（如 `2013-11-12-corosync-pacemaker-mysql-drbd-shixian-mysql.md`）turndown-plugin-gfm 判定为"非简单表格"后按设计保留为原生 HTML `<table>`（这是该插件的既定行为，避免有损转换）。脚本额外剥掉了这些残留标签上的 `style=`/`class=`/`data-*=`/`draggable=` 等 Evernote 专有属性，只留裸标签结构；裸 HTML 表格是合法的 markdown，Astro/remark 会原样透传渲染，不是"未转换成功"。
4. **验收 grep（`DOCTYPE|en-note|<style`）技术上有 2 处命中，但都不是残留 Evernote 壳。** `2017-06-14-nginx-fanxiang-daili-fuzai-junheng-yemian.md` 和 `2018-02-06-oncall-xiaogong-juqian-duandai-majie-du.md` 的正文本身就是在讲解/复现一段包含字面 `<!DOCTYPE html>` 文本的示例内容（前者是 curl 抓取到的 nginx 405 错误页 HTML，后者是逐行讲解一段前端源码），逐字核对后确认是文章本该有的教学内容，不是未剥壳的 Evernote dump。用最强指纹 `en-note`（Evernote 导出壳专属标签，不会出现在正常技术文章里）复查是 **0 命中**，可以确认没有真正遗漏的整份 HTML dump。

### 脚本实现中修复过的几个内部 bug（记录供后续维护参考）

1. **行首残留空格导致标题/回声清理正则失效**：turndown 输出的部分标题行前面会带 1-5 个空格（源自 Evernote 富文本缩进残留），这些空格如果留在最终产物里，4 空格以上会被 CommonMark 解释成缩进代码块而不是标题，属于真实渲染 bug，不只是脚本内部正则匹配失败。已在 `commonCleanup` 里做行首/行内空格归一化，并调整处理顺序（先归一化空白，再做标题/回声相关的正则清理）。
2. **"标题回声"清理原来只对 A 类（HTML dump 转换出的、以 markdown heading 开头的正文）生效**，但同样的 Evernote 元信息回声（标题原文重复一遍 + 星期几日期 + 时间几行）在 C 类（纯文本导出，没有 heading）的正文最开头同样出现。已扩展成 A/B/C 三类通用（判断"文档是否以 heading 开头"来决定从第 0 行还是第 1 行开始扫描）。
3. **"已使用 Microsoft OneNote 20xx 创建。" 签名行**（Evernote/OneNote 客户端自动追加，239/398 篇都有）原先没有处理，会污染正文结尾，个别"正文本身几乎是空的"笔记（如上面提到的 `empty-body` 那篇）甚至会让这行变成自动生成的 description。已加入通用样板行过滤，对全部四类文章生效。
4. **文章页正文开头的一级标题与 `PostLayout.astro` 渲染的页面 `<h1>{title}</h1>` 重复**：A/B 类正文来自 turndown 转换笔记自带的 `<h1 class="noteTitle">`，和 front matter 的 `title` 内容完全一致，会导致页面上标题连续出现两次。脚本在确定最终 `title` 之后，如果正文开头的一级/二级标题与 `title` 归一化后相等，就把这一行从正文里剔除（不改动 Phase 1 的 `PostLayout.astro`）。C 类本来就不会合成标题，D 类（已迁移的 3 篇手写/AI 协作长文）保持原样不动（`llm-notes`/`python-interpreter-debug` 两篇本来就是这个双标题结构，视为既有约定，不在 Phase 2 范围内改动布局代码）。
5. **`/posts/<slug>/` 路由 slug 唯一性 bug（真实的发布期问题，不只是脚本内部问题）**：`src/lib/posts.ts` 的 `slugFromId()` 会把文件名的 `YYYY-MM-DD-` 日期前缀去掉作为路由 slug。语料库里确实存在两篇标题完全相同、日期不同的笔记（`2017-07-25` 和 `2025-05-28` 的"机器学习常见算法分类汇总"，像是同一篇笔记被复制/重新整理过）。脚本最初的 slug 去重只在"同一天内"去重，两篇不同日期但同标题的文章会生成相同的 bare slug，在真实路由上互相覆盖（`astro build` 会静默用后处理的条目覆盖前一个，同一个 URL 只能访问到其中一篇）。已改为**全局**（跨全部日期）保证 bare slug 唯一，冲突时追加 `-2`/`-3`；重新生成后确认 398 篇的 bare slug 两两不重复。

### 验收结果（a–e，全部实跑）

- **a) 幂等性**：连续跑两次全量脚本，`diff -rq` 对比 `src/content/blog/` 和 `public/images/legacy/` 均为空（无差异，`docs/migration-report.json` 仅 `generatedAt` 时间戳不同）。
- **b)** `grep -rl "DOCTYPE\|en-note\|<style" src/content/blog/`：2 处命中，均核实为文章正文本身合法引用的示例文本而非未剥壳残留（详见上方"已知的、有意不修复的原始内容瑕疵"第 4 条）；`en-note`（Evernote 导出壳的强指纹）单独复查为 0 命中。
- **c)** `npm run build` 全量（398 篇 + 站点其余页面）0 error / 0 warning，schema 校验全部通过。**注意**：本地反复迭代脚本、反复重跑 `npm run build` 时会看到大量 `[blog-loader] Duplicate id ... found` 警告——这是 `node_modules/.astro`（Astro Content Layer 的持久化 SQLite 缓存）在同一个 checkout 里多次 sync 遗留的构建缓存伪影，不是内容问题；`rm -rf .astro dist node_modules/.astro` 后重新 `npm run build` 归零。CI 每次都是全新 checkout，不会遇到这个问题；如果本地开发时看到这个警告，按上面的方法清缓存即可。
- **d)** 警告统计已汇总在上方"最终统计"表格。
- **e)** 抽查 A/C/D 各 ≥5 篇（B 类语料库中样本数为 0，见上方说明，无法抽查）dist 渲染产物：标题均正确渲染、非乱码；代码块经 Shiki 双主题高亮（`class="astro-code astro-code-themes github-light github-dark"`）；图片路径 `/images/legacy/*` 均可解析到真实文件；`class="..."` 残留全部是站点自身设计系统的类名（`post-card`/`toc-aside`/`chip` 等），未见任何 Evernote 来源的 class/style 泄漏。

### 待人工处理事项

1. `2025-05-28-机器学习常见算法分类汇总.md`（原 `image-missing`）：正文里那张图确实在 `assets/evernote/` 里找不到对应文件，需要站长自己找回原图或删掉这处引用。
2. `2020-07-16-...bios-uefi-mbr...md`（原 `external-image`）：引用的知乎图床外链 `https://pic3.zhimg.com/80/v2-0f9d14100058feff6e180da5623c3aca_720w.jpg` 未验证是否还能访问，建议站长确认后决定是下载自托管还是删除引用。
3. 约 30 篇文章（"–" 替代 "--"）和个别"单词中间断行"的文章，代码块显示效果不够干净，不阻塞发布，有余力时可以人工挑几篇质量差的重新润色。
4. `2017-11-21-无标题页.md` 和 `2018-04-30-HDFS的几种访问方式...md` 两篇本质上是空笔记（原始 Evernote 里就基本没内容），是否要从站点里下线（设 `draft: true`）由站长决定；脚本没有替用户做这个判断，原样保留发布。
