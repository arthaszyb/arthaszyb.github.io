# 站点管理台指南

本站是 Astro 静态站（GitHub Pages + Actions 自动构建），没有传统后台服务器。
「管理台」由三部分组成，全部免费、零服务器：

| 能力 | 方案 | 入口 |
| --- | --- | --- |
| 写文章（Markdown / HTML 直发）、传图、改主题 | [Pages CMS](https://pagescms.org) | <https://app.pagescms.org> |
| 顶部横幅 / 主题色 / 统计开关 | `src/data/theme.json`（CMS 内可视化编辑） | CMS「主题与统计」 |
| 浏览数据分析 | [GoatCounter](https://www.goatcounter.com) | `https://<站点代码>.goatcounter.com` |

发布流程：管理台点「保存」= 提交一个 commit 到 master → GitHub Actions
自动构建部署（约 1–2 分钟生效）。

## 一、启用 Pages CMS（一次性，约 2 分钟）

1. 打开 <https://app.pagescms.org>，用 GitHub 账号登录；
2. 授权访问 `arthaszyb/arthaszyb.github.io` 仓库（安装 Pages CMS GitHub App）；
3. 选择本仓库 master 分支，CMS 会自动读取根目录的 `.pages.yml` 配置。

之后左侧会出现四个板块：

- **文章（Markdown）** — 富文本编辑器写作，保存为 `src/content/blog/*.md`；
- **文章（HTML 直发）** — 代码编辑器粘贴 HTML，保存为 `src/content/blog/*.html`；
- **主题与统计** — 编辑 `src/data/theme.json`（顶部横幅图、配色、统计代码）；
- **媒体** — 图片上传到 `public/images/`，文章内以 `/images/...` 引用。

## 二、HTML 直发文章

HTML 文件**不会被转换为 Markdown**，正文构建时原样渲染。规则：

- 文件放在 `src/content/blog/`，命名 `YYYY-MM-DD-slug.html`；
- 顶部写一段与 Markdown 相同的 YAML frontmatter（title / date / category
  必填，schema 见 `src/content.config.ts`）；
- frontmatter 之后是 HTML 正文，按内容形态自动选择两种渲染模式：
  - **HTML 片段**（无 `<html>`/`<head>`）→ 嵌入站点版式（带导航、目录、
    相关文章），h2 / h3 自动生成目录锚点；可包含内联样式和 `<script>`；
  - **完整 HTML 文档**（含 `<html>`/`<head>`）→ 文章页**整页原样输出**，
    自带的样式、表格、表单、图表脚本全部保留，不套站点版式（自包含的
    报告 / 仪表盘类页面适用）；构建时只追加 GoatCounter 统计脚本和
    Pagefind 搜索索引标记；
  - 想强制指定模式，在 frontmatter 写 `standalone: true / false` 覆盖自动判断；
- 两种模式下列表、标签、RSS、站内搜索都与 Markdown 文章一致。

示例见 `src/content/blog/2026-07-14-html-zhifa-shili.html`（草稿状态，
把 `draft` 改为 `false` 即可上线预览效果）。

实现位于 `src/lib/html-loader.ts`（挂载在 `src/lib/blog-loader.ts`）。
注意：本地 `npm run dev` 时新增 / 修改 `.html` 文章需要重启 dev server
才会生效（内容层 loader 只在启动时同步）；线上走 Actions 全量构建，无此问题。

## 三、顶部横幅与主题定制

编辑 CMS 的「主题与统计」（即 `src/data/theme.json`）：

| 字段 | 作用 |
| --- | --- |
| `banner.image` | 顶部横幅图（上传后自动填入路径）。是页面最顶端一条贯穿全宽、固定高度（约 90–200px，随视口宽度自适应）的色带，随页面正常滚动，**不是全屏背景**，不会遮挡或影响下方任何内容。留空则不显示。建议横向构图的图片，竖直方向内容会被居中裁切 |
| `accent.light` / `accent.dark` | 链接与强调色，如 `#46705c` |
| `analytics.goatcounter` | GoatCounter 站点代码，留空不加载统计脚本 |

所有字段留空 = 保持 `src/styles/global.css` 的默认「暖纸面」设计；
横幅样式在 `.site-banner`（`src/styles/global.css`），注入逻辑见
`src/layouts/BaseLayout.astro`。更大范围的排版调整（字体、宽度、列表
样式等）直接改 `src/styles/global.css` 顶部的 CSS 变量。

## 四、浏览数据分析（GoatCounter）

1. 到 <https://www.goatcounter.com> 注册（免费），取一个站点代码，
   例如 `arthaszyb`；
2. 在 CMS「主题与统计」→「GoatCounter 站点代码」填入该代码并保存；
3. 部署后访问 `https://<站点代码>.goatcounter.com` 查看报表：
   PV / UV、来源、热门文章、地区、设备等。

GoatCounter 无 Cookie、不追踪个人信息，脚本约 3.5 KB，对加载速度几乎无影响。
若之后想换 Google Analytics / Cloudflare Web Analytics，把对应脚本加进
`src/layouts/BaseLayout.astro` 即可。

## 五、搜索引擎收录（SEO / GEO）

文章要能被 Google 搜到，光把站建好不够——**必须主动去各站长平台验证站点并提交
sitemap**，否则新站可能几个月都不会被收录。

1. 到 <https://search.google.com/search-console> 添加资源 →「网址前缀」→
   填 `https://arthaszyb.github.io`；
2. 验证方式选「HTML 标记」，复制它给的 `content="..."` 里那串值；
3. 在 CMS「主题与统计」→「搜索引擎站点验证」→「Google Search Console」填入并保存；
4. 等部署完成（1–2 分钟）后，回 Search Console 点「验证」；
5. 验证通过后到「站点地图」提交 `sitemap-index.xml`；
6. 发了重点文章想快点收录，用「网址检查」输入完整 URL →「请求编入索引」。

Bing（<https://www.bing.com/webmasters>）和百度（<https://ziyuan.baidu.com>）流程相同，
对应 CMS 里的另外两个格子。Bing 的索引会被部分 AI 搜索产品使用，值得一并做。

**两个容易踩的坑：**

- **资源类型必须选「网址前缀」，不能选「网域」。** 「网域」资源只支持 DNS TXT 记录验证，
  而 `github.io` 是 GitHub 的域名，你没有它的 DNS 控制权，那条路永远走不通。
- **验证文件要放进 `public/`，不是仓库根目录。** 如果用「HTML 文件」验证方式，下载到的
  `googlexxxx.html` 必须放在 `public/` 下——Astro 只把 `public/` 的内容复制到站点根目录，
  放在仓库根目录的文件构建时会被直接忽略，线上访问就是 404。同理适用于任何需要放在
  站点根目录的文件（`BingSiteAuth.xml` 等）。

完整体检结论和待办见 [docs/seo-geo-checklist.md](./seo-geo-checklist.md)。

## 常见问题

- **发的文章 Google 搜不到？** 先确认第五节的验证 + sitemap 提交做了没有。
  没做的话搜不到是必然的；做了之后新文章通常还要几天到两周才会出现。
- **保存后多久生效？** Actions 构建约 1–2 分钟，可在仓库 Actions 页看进度。
- **CMS 里看不到某篇文章？** 检查文件是否在 `src/content/blog/` 且扩展名为
  `.md` / `.html`。
- **想在发布前预览？** 把 `draft` 设为 `true` 保存（线上不可见），本地
  `npm run dev` 预览；确认后改回 `false`。
- **改了 `.pages.yml` 配置报错？** Pages CMS 的 Settings 页有配置校验器，
  会指出具体哪一行不合法。
