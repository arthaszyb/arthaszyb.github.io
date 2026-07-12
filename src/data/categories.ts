/**
 * category slug -> 中文展示名。
 *
 * 完整的 31 -> 12 旧分类映射表见 docs/modernization-plan.md 2.6，由
 * scripts/migrate-content.mjs 的 CATEGORY_MAP 在迁移时落地到每篇文章的
 * frontmatter；这里的 12 个 slug 与该映射表的目标值一一对应。
 */
export const categoryNames: Record<string, string> = {
  linux: 'Linux',
  shell: 'Shell',
  python: 'Python',
  database: '数据库',
  monitoring: '监控与可观测性',
  'container-virt': '容器与虚拟化',
  network: '网络',
  'web-infra': 'Web 基础设施',
  php: 'PHP',
  bigdata: '大数据',
  ai: 'AI 与机器学习',
  misc: '杂记',
};

export function categoryDisplayName(slug: string): string {
  return categoryNames[slug] ?? slug;
}
