export const site = {
  title: 'Sean Jho',
  description:
    'Technical notes on systems, infrastructure, AI tooling, and engineering practice.',
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
