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
