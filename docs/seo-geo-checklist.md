# SEO / GEO 检查与待办

体检时间：2026-07-29。触发问题：新发布的《如何给公司做 AI 赋能》在 Google 上搜不到。

## 结论先说

**站点整体没有被 Google 收录**——不是单篇文章的问题。用 `site:arthaszyb.github.io`
搜索返回 0 条本站结果，说明 Google 索引里基本没有这个域名的页面。

页面本身的技术 SEO 是**合格**的：canonical、robots、sitemap、JSON-LD、RSS、
`llms.txt` 都在，`public/robots.txt` 明确放行了各家 AI 爬虫，401 篇文章里 400 篇
有独立的中文 description。也就是说，问题不在"页面写得不够好"，在于
**Google 从来没有被告知这个站的存在，而且这个站没有任何理由被它自己发现**：

1. **从未在 Google Search Console 验证过、也从未提交过 sitemap。**
   这是最主要的原因。新站不主动提交，等 Google 自然发现要几周到几个月。
2. **几乎没有外链。** `arthaszyb.github.io` 是 GitHub Pages 子域，权重继承不了
   `github.io` 主域。没有外链就没有爬虫入口，Google 连爬都不会来爬。
3. **2026 年的 Jekyll → Astro 迁移把旧 URL 全部作废，且刻意没做逐条 301 重定向**
   （见 `docs/modernization-plan.md` 第 15 行的决策）。旧 URL 上原本积累的收录
   在迁移后全部失效，新 URL 等于从零开始。这个决策已经无法回滚（旧 URL 含中文
   路径，映射关系没有留存），只能靠重新提交把新 URL 喂进去。

新文章"上周发的搜不到"是上面三条的直接结果。补充一句：即使一切正常，新页面从
提交到出现在搜索结果里，通常也要几天到两周，不会当天就有。

## 站长必须手动做的事（代码改不了，按顺序做）

这几步不做，下面所有代码层面的优化都不会产生任何效果。

1. **Google Search Console 验证并提交 sitemap**（最重要）
   - 打开 https://search.google.com/search-console ，添加资源 → 选「网址前缀」
     → 填 `https://arthaszyb.github.io`
   - 验证方式选「HTML 标记」，复制它给的 `content="..."` 里的那串值
   - 填进 Pages CMS 的「主题与统计 → 搜索引擎站点验证 → Google Search Console」
     （对应 `src/data/theme.json` 的 `verification.google`），保存后等自动部署完成
   - 回 Search Console 点「验证」
   - 验证通过后：「站点地图」→ 提交 `sitemap-index.xml`
   - 「网址检查」→ 输入新文章的完整 URL → 「请求编入索引」（新文章发布后都可以做一次，
     每天有配额限制，只对重点文章用）
2. **Bing 网站管理员工具**：https://www.bing.com/webmasters 同样验证 + 提交 sitemap。
   Bing 的索引还会被 ChatGPT 搜索等 AI 产品使用，对 GEO 有直接影响。
3. **百度搜索资源平台**（如果在意中文流量）：https://ziyuan.baidu.com 。
   注意百度对 GitHub Pages 收录一向很差，期望值放低。
4. **搞几条外链。** 这是长期唯一真正有效的手段：在知乎/掘金/V2EX 的个人简介或
   相关回答里放站点链接，GitHub 个人主页 profile README 里放，给文章在相关社区
   发一次摘要 + 原文链接。三五条真实外链就足以让爬虫稳定光顾。

## 本轮已经改掉的代码问题

| 问题 | 影响 | 处理 |
| --- | --- | --- |
| sitemap 里 502 条 URL 全是裸 `<loc>`，没有 `<lastmod>` | 爬虫无法区分上周的新文和 2013 年的老文，新内容拿不到优先抓取 | 新增 `src/lib/sitemap-lastmod.mjs`，给每条 URL 打上日期：文章用自己的日期，列表页用最新文章日期 |
| 《给公司做 AI 赋能》系列第 2、3 篇都没写 `description` | meta description / og / JSON-LD / RSS 全部回退到站点默认的**英文**句子，中文查询匹配不上，搜索结果摘要也没有可读性 | 两篇都补上中文 description，并加 `AI赋能` 标签 |
| 站点默认 description 是英文，但 `<html lang="zh-CN">`、正文全中文 | 首页和任何缺 description 的页面都在用英文描述参与中文检索 | `src/data/site.ts` 改为中文 |
| 首页 `<title>` 只有 `Sean Jho` | 一个人名，没有任何主题词，中文查询无从匹配 | 新增 `site.tagline`，首页标题变成 `Sean Jho - 技术笔记 · Linux、基础设施、数据库与 AI 工程实践` |
| 没有任何站点验证标签的位置 | 站长要验证 GSC 只能改代码 | `theme.json` 新增 `verification.{google,bing,baidu}`，Pages CMS 里可直接填 |
| JSON-LD 偏薄 | 结构化数据是 AI 引擎（GEO）提取事实的主要入口 | 补 `url`、`articleSection`、`isPartOf`、`mainEntityOfPage` 改为 `WebPage` 对象；`WebSite` 补 `alternateName`、`author` |

## 内容层面的遗留问题（需要站长自己判断）

- **正文里「AI 赋能」基本只出现在标题和「系列第 N 篇」那一行**，第 3 篇通篇讲的是
  任务拆解、spec-first、波次执行，第 2 篇讲的是指标与门禁。用「如何给公司做 AI 赋能」
  去搜，即使被收录了，相关性也偏弱。建议每篇开头加一段真正回答
  "给公司做 AI 赋能是怎么回事"的引言，并在正文里自然多用几次这个词。
- **系列缺第 1 篇。** 站上现有第 2 篇（`how-ai-4-comany-index-guarantee`）和
  第 3 篇（`how-ai-4-biz-work-from-small`），但没有第 1 篇，对读者和爬虫都是断链。
  另外**三篇之间没有互相内链**——系列内链对收录帮助很大，建议每篇开头或结尾加上
  «上一篇 / 下一篇 / 系列目录» 的链接。
- **系列的 `date` 顺序是乱的**：第 2 篇是 `2026-07-15`，第 3 篇却是 `2026-07-10`。
  列表页、RSS、sitemap 的 `lastmod` 全按 `date` 排序，所以第 3 篇会显示得比第 2 篇更早、
  排在它后面。两篇的 `date` 也都早于文件名日期（07-23 / 07-29）和实际提交时间。
  按真实发布顺序把 `date` 理顺，收录和阅读体验都会更好。**未擅自改动。**
- **第 3 篇的标题里有个多余空格**：`如何给公司做AI赋能-- 任务拆解与协作:…`（`--` 后面
  多一个空格），与第 2 篇的写法不一致。小问题，顺手改掉即可。
- 曾经的 URL `/posts/how-ai-4-comany-org-target/` 因为 slug 改名已经不存在了。
  因为站点本来就没被收录，这次没有造成损失；但**以后文章上线后就不要再改 `slug`**，
  改一次等于把已收录的 URL 变成 404。
- 站点没有 OG 图片（`twitter:card` 是 `summary`，无图）。不影响排名，但影响社交平台和
  部分 AI 产品的展示效果。

## GEO（面向 AI 引擎）现状

这块反而是做得好的，基本不用动：

- `public/robots.txt` 显式放行 GPTBot、OAI-SearchBot、ClaudeBot、PerplexityBot、
  Google-Extended、CCBot 等，没有误拦。
- `/llms.txt` 有站点导览和分类索引，`/llms-full.txt` 有全量文章索引。
- 每篇文章都是**服务端渲染的静态 HTML**，没有客户端 JS 才能看到的正文——
  这是 AI 爬虫能否读到内容的关键，很多 SPA 博客栽在这里。
- 每篇有 JSON-LD `BlogPosting`（本轮又补厚了一层）。

唯一的制约还是那个：**AI 引擎的召回大量依赖 Google/Bing 的索引**。索引里没有这个站，
GEO 做得再好也无从被引用。所以上面第 1、2 步依然是前提。
