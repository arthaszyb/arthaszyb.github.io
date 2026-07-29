export const site = {
  title: 'Sean Jho',
  /** 首页 <title> 用 `${title} - ${tagline}`，避免站点首页只有一个没有主题信号的人名。 */
  tagline: '技术笔记 · Linux、基础设施、数据库与 AI 工程实践',
  /* 站点默认描述。正文是中文、<html lang="zh-CN">，描述也必须是中文——
     语言不一致会让中文搜索词匹配不到本站。单篇文章请在 frontmatter 里写
     自己的 description，不要退回到这一条。 */
  description:
    'Sean Jho 的个人技术笔记：Linux 运维、基础设施与网络排查、数据库调优、容器与监控，以及 AI/LLM 工程与 agent 协作实践。自 2013 年持续更新。',
  url: 'https://arthaszyb.github.io',
  author: 'Sean Jho',
  email: 'arthaszyb@gmail.com',
  github: 'https://github.com/arthaszyb',
  lang: 'zh-CN',
};

/**
 * giscus 评论配置。
 *
 * 站长尚未在仓库开启 GitHub Discussions / 安装 giscus app，
 * 因此默认关闭（enabled: false）——关闭时文章页完全不渲染 giscus
 * 组件（不加载脚本、不占位）。
 *
 * 开通后：
 *   1. 在仓库 Settings → General 启用 Discussions
 *   2. 安装 https://github.com/apps/giscus
 *   3. 到 https://giscus.app 生成 repoId / categoryId，填入下方
 *   4. 把 enabled 改成 true
 *
 * 详见 docs/migration-notes.md。
 */
export const giscus = {
  enabled: false,
  repo: 'arthaszyb/arthaszyb.github.io',
  repoId: '',
  category: 'Announcements',
  categoryId: '',
  mapping: 'pathname' as const,
  strict: '0' as const,
  reactionsEnabled: '1' as const,
  emitMetadata: '0' as const,
  inputPosition: 'bottom' as const,
  lang: 'zh-CN',
};
