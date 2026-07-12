/**
 * category slug -> 中文展示名。
 *
 * 完整的 31 -> 12 旧分类映射表在 Phase 2（内容清洗）执行时落地，
 * 这里先收录 Phase 1 样例文章用到的几个 slug，Phase 2 脚本会补全
 * 其余条目（linux/shell/database/monitoring/container-virt/network/
 * web-infra/php/bigdata/misc 等，见 docs/modernization-plan.md 2.6）。
 */
export const categoryNames: Record<string, string> = {
  ai: 'AI 与机器学习',
  python: 'Python',
  misc: '杂记',
  linux: 'Linux',
  'web-infra': 'Web 基础设施',
};

export function categoryDisplayName(slug: string): string {
  return categoryNames[slug] ?? slug;
}
