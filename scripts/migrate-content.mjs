#!/usr/bin/env node
/**
 * Phase 2 内容清洗迁移脚本。
 *
 * 输入：_posts/*.md（Jekyll + Evernote 导入的历史文章，只读）
 *       assets/evernote/**（129 个无扩展名图片资产，只读）
 * 输出：src/content/blog/*.md（Astro content collection）
 *       public/images/legacy/*（ASCII 化文件名的图片副本）
 *       docs/migration-report.json（每次运行覆盖，记录判定/动作/警告）
 *
 * 幂等设计：
 *   - 图片输出文件名 = "legacy-<md5(相对路径)前10位>.<真实扩展名>"，只由源文件的
 *     相对路径决定，与运行时刻无关，因此重复运行产出的文件名和内容都不变。
 *   - 正文输出文件名 = "<date>-<ascii slug>.md"，slug 由标题（含派生标题）确定性
 *     生成，重复运行得到同一批文件名。
 *   - 每次全量运行开始前，会先删除 src/content/blog 下所有带
 *     `source: evernote-local-db` 标记的旧产物（即上一次脚本产出的文件），
 *     再重新生成，避免脚本逻辑迭代后遗留孤儿文件；不触碰不带该标记的手写文章。
 *
 * 用法：
 *   node scripts/migrate-content.mjs --sample[=20]   # 抽样模式，仅处理前 N 篇（四类均衡采样）
 *   node scripts/migrate-content.mjs                 # 全量模式，处理 _posts 下全部文章
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { fileTypeFromBuffer } from 'file-type';
import { pinyin } from 'pinyin-pro';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const POSTS_DIR = path.join(ROOT, '_posts');
const ASSETS_DIR = path.join(ROOT, 'assets', 'evernote');
const OUT_DIR = path.join(ROOT, 'src', 'content', 'blog');
const IMAGES_OUT_DIR = path.join(ROOT, 'public', 'images', 'legacy');
const REPORT_PATH = path.join(ROOT, 'docs', 'migration-report.json');

const argv = process.argv.slice(2);
const sampleFlag = argv.find((a) => a === '--sample' || a.startsWith('--sample='));
const SAMPLE_MODE = Boolean(sampleFlag);
const SAMPLE_SIZE = sampleFlag && sampleFlag.includes('=') ? parseInt(sampleFlag.split('=')[1], 10) : 20;

// ---------------------------------------------------------------------------
// 2.6 category 映射表（写死，31 -> 12），逐条照抄自 docs/modernization-plan.md
// ---------------------------------------------------------------------------
const CATEGORY_MAP = {
  RedHat: 'linux',
  yum: 'linux',
  shell: 'shell',
  python: 'python',
  'MySQL [2]': 'database',
  Redis: 'database',
  监控告警: 'monitoring',
  docker: 'container-virt',
  kubernetes: 'container-virt',
  VM: 'container-virt',
  网络: 'network',
  科学上网: 'network',
  CDN: 'network',
  'Nginx [2]': 'web-infra',
  Apache: 'web-infra',
  'HA&LB': 'web-infra',
  web: 'web-infra',
  js: 'web-infra',
  'PHP [2]': 'php',
  PHP: 'php',
  BigData: 'bigdata',
  AI: 'ai',
  机器学习: 'ai',
  理论模型: 'ai',
  LLM: 'ai',
  Agent: 'ai',
  MCP: 'ai',
  技术笔记: 'ai',
  Debug: 'ai',
  极客: 'ai',
  Windows: 'misc',
  win: 'misc',
  vnc: 'misc',
  其他: 'misc',
  未分类: 'misc',
};

const CATEGORY_DISPLAY = {
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

// ~40 词关键词 -> tag 词典，best-effort 初填 2-5 个 tag
const TAG_DICT = [
  ['nginx', /nginx/i],
  ['apache', /apache|httpd/i],
  ['mysql', /mysql/i],
  ['redis', /redis/i],
  ['memcached', /memcached/i],
  ['iptables', /iptables|firewalld|netfilter/i],
  ['systemd', /systemd|systemctl/i],
  ['selinux', /selinux/i],
  ['zabbix', /zabbix/i],
  ['nagios', /nagios/i],
  ['lvs', /\blvs\b/i],
  ['keepalived', /keepalived/i],
  ['haproxy', /haproxy/i],
  ['tcpdump', /tcpdump/i],
  ['kvm', /\bkvm\b/i],
  ['docker', /docker/i],
  ['kubernetes', /kubernetes|k8s|kubectl/i],
  ['vmware', /vmware|esxi/i],
  ['dns', /\bdns\b|bind9?/i],
  ['dhcp', /dhcp/i],
  ['ssh', /\bssh\b/i],
  ['ftp', /\bftp\b|vsftpd/i],
  ['samba', /samba/i],
  ['nfs', /\bnfs\b/i],
  ['rsync', /rsync/i],
  ['crontab', /crontab|定时任务/i],
  ['shell-scripting', /shell脚本|bash脚本|\bawk\b|\bsed\b/i],
  ['python', /python/i],
  ['php', /\bphp\b/i],
  ['mysql-replication', /主从复制|主备延迟|binlog/i],
  ['raid', /\braid\b|mdadm/i],
  ['lvm', /\blvm\b/i],
  ['drbd', /drbd/i],
  ['ldap', /ldap/i],
  ['vpn', /\bvpn\b/i],
  ['cdn', /\bcdn\b/i],
  ['ssl-tls', /\bssl\b|\btls\b|https|证书/i],
  ['git', /\bgit\b/i],
  ['mongodb', /mongodb/i],
  ['hadoop', /hadoop|\bhive\b|hdfs|大数据/i],
  ['elasticsearch', /elasticsearch|\belk\b/i],
  ['ai-agent', /大模型|\bllm\b|\bagent\b|\bmcp\b/i],
  ['vim', /\bvim\b/i],
  ['iscsi', /iscsi/i],
  ['存储', /\bsan\b|存储|磁盘阵列/i],
  ['tomcat', /tomcat/i],
  ['java', /\bjava\b/i],
  ['监控告警', /监控|告警|prometheus|grafana/i],
  ['备份恢复', /备份|数据恢复/i],
  ['负载均衡', /负载均衡|load ?balanc/i],
  ['高可用', /高可用|failover|心跳/i],
  ['集群', /集群|\bcluster\b/i],
  ['网络排查', /抓包|路由表|网卡|网络故障/i],
];

const JUNK_TAGS = new Set(['pages', '']);
const JUNK_TAG_PATTERN = /^新分区\s*\d*$/;

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function md5(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/ /g, ' ');
}

// ---------------------------------------------------------------------------
// 图片资产处理（2.5）
// ---------------------------------------------------------------------------

/** 遍历 assets/evernote/**，用 file-type 检测真实格式，复制到 public/images/legacy/ */
async function buildImageAssetMap(report) {
  const map = new Map(); // posix relative path (from assets/evernote) -> new site path
  const basenameIndex = new Map(); // "<parentDirName>/<basename>" (lowercase) -> [relPath,...]
  const folderIndex = new Map(); // normalized "<...files>" folder name (lowercase) -> [relPath,...]
  const walked = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        walked.push(full);
      }
    }
  }
  walk(ASSETS_DIR);

  ensureDir(IMAGES_OUT_DIR);

  for (const full of walked) {
    const relPath = path.relative(ASSETS_DIR, full).split(path.sep).join('/');
    const buf = fs.readFileSync(full);
    let ext = 'bin';
    try {
      const type = await fileTypeFromBuffer(buf);
      if (type?.ext) ext = type.ext;
      else report.imageAssetWarnings.push({ file: relPath, warning: 'undetected-file-type-defaulted-to-bin' });
    } catch (e) {
      report.imageAssetWarnings.push({ file: relPath, warning: `file-type-detect-failed: ${e.message}` });
    }
    const hash = md5(relPath).slice(0, 10);
    const outName = `legacy-${hash}.${ext}`;
    const outPath = path.join(IMAGES_OUT_DIR, outName);
    // idempotent copy: only write if missing or content differs
    let needsWrite = true;
    if (fs.existsSync(outPath)) {
      const existing = fs.readFileSync(outPath);
      needsWrite = !existing.equals(buf);
    }
    if (needsWrite) fs.writeFileSync(outPath, buf);

    const sitePath = `/images/legacy/${outName}`;
    map.set(relPath, sitePath);
    map.set(relPath.toLowerCase(), sitePath);

    const parentAndBase = relPath.split('/').slice(-2).join('/');
    const key = parentAndBase.toLowerCase();
    if (!basenameIndex.has(key)) basenameIndex.set(key, []);
    basenameIndex.get(key).push(relPath);

    const baseOnly = path.basename(relPath).toLowerCase();
    if (!basenameIndex.has(baseOnly)) basenameIndex.set(baseOnly, []);
    basenameIndex.get(baseOnly).push(relPath);

    // relPath looks like "<Category>/<NoteTitle> files/Evernote (n)"; index
    // by the "<NoteTitle> files" segment alone (independent of category) so
    // a post's relative "<NoteTitle> files/Evernote (n)" reference can find
    // its own note's asset folder without a category match.
    const segments = relPath.split('/');
    if (segments.length >= 3) {
      const folderKey = segments[segments.length - 2].toLowerCase();
      if (!folderIndex.has(folderKey)) folderIndex.set(folderKey, []);
      folderIndex.get(folderKey).push(relPath);
    }
  }

  return { map, basenameIndex, folderIndex, totalAssets: walked.length };
}

/**
 * 解析一个图片引用（来自 <img src="..."> 或 markdown ![](...)），返回：
 * { kind: 'local' | 'external' | 'missing', newSrc, originalSrc }
 */
function resolveImageSrc(rawSrc, assetIndex, postCategoryHint) {
  let src = decodeEntities(rawSrc.trim());
  // strip query/fragment
  src = src.split('#')[0].split('?')[0];

  if (/^https?:\/\//i.test(src)) {
    return { kind: 'external', newSrc: src, originalSrc: rawSrc };
  }

  let decodedPath = src;
  try {
    decodedPath = decodeURIComponent(src);
  } catch {
    // ignore malformed percent-encoding, use as-is
  }

  // absolute /assets/evernote/... style
  if (decodedPath.startsWith('/assets/evernote/') || decodedPath.startsWith('assets/evernote/')) {
    const rel = decodedPath.replace(/^\/?assets\/evernote\//, '');
    const hit = assetIndex.map.get(rel) || assetIndex.map.get(rel.toLowerCase());
    if (hit) return { kind: 'local', newSrc: hit, originalSrc: rawSrc };
  }

  // relative "<NoteTitle> files/Evernote (n)" style. Try, in order of
  // confidence:
  //   1. exact "<parentDir>/<basename>" match (unambiguous: this note's own
  //      asset folder, found regardless of which category dir it lives under)
  //   2. same note's asset folder (by folder name alone), then pick by
  //      basename within it
  //   3. bare basename search across *all* assets, but only if the basename
  //      is unambiguous (a single global match) -- bare "Evernote" (no serial
  //      suffix) recurs across many unrelated notes' folders, so guessing
  //      candidates[0] there would silently attach a random note's image.
  const baseOnly = path.basename(decodedPath).toLowerCase();
  const pathSegments = decodedPath.split('/');
  const folderSeg = pathSegments.length >= 2 ? pathSegments[pathSegments.length - 2].toLowerCase() : null;
  const parentAndBase = pathSegments.slice(-2).join('/').toLowerCase();

  let candidates = assetIndex.basenameIndex.get(parentAndBase) || [];

  if (!candidates.length && folderSeg) {
    const sameFolder = assetIndex.folderIndex.get(folderSeg) || [];
    if (sameFolder.length) {
      const byBasename = sameFolder.filter((c) => path.basename(c).toLowerCase() === baseOnly);
      candidates = byBasename.length ? byBasename : sameFolder;
    }
  }

  if (!candidates.length) {
    const globalByBasename = assetIndex.basenameIndex.get(baseOnly) || [];
    if (globalByBasename.length === 1) candidates = globalByBasename;
  }

  if (candidates.length > 1 && postCategoryHint) {
    const preferred = candidates.filter((c) => c.toLowerCase().startsWith(postCategoryHint.toLowerCase()));
    if (preferred.length) candidates = preferred;
  }
  if (candidates.length) {
    const hit = assetIndex.map.get(candidates[0]);
    if (hit) return { kind: 'local', newSrc: hit, originalSrc: rawSrc };
  }

  return { kind: 'missing', newSrc: null, originalSrc: rawSrc };
}

/** 把正文中所有 markdown 图片引用（turndown 产物 + 原生 markdown 图片）重写为新路径 */
function rewriteImages(markdown, assetIndex, postCategoryHint, warnings) {
  // matches ![alt](url) and ![alt](<url with spaces>)
  const imgRe = /!\[([^\]]*)\]\((<[^>]*>|[^)]*)\)/g;
  return markdown.replace(imgRe, (full, alt, urlRaw) => {
    let url = urlRaw;
    if (url.startsWith('<') && url.endsWith('>')) url = url.slice(1, -1);
    // turndown escapes ( ) inside angle-bracket URLs with backslashes
    url = url.replace(/\\([()])/g, '$1');

    const resolved = resolveImageSrc(url, assetIndex, postCategoryHint);
    if (resolved.kind === 'local') {
      return `![${alt}](${resolved.newSrc})`;
    }
    if (resolved.kind === 'external') {
      warnings.push({ type: 'external-image', detail: resolved.originalSrc });
      return `![${alt}](${resolved.newSrc})`;
    }
    warnings.push({ type: 'image-missing', detail: resolved.originalSrc });
    return `<!-- image lost in migration: ${resolved.originalSrc} -->`;
  });
}

// ---------------------------------------------------------------------------
// 2.2 分类判定
// ---------------------------------------------------------------------------

function classify(body) {
  if (/<!DOCTYPE html>|<html[\s>]/i.test(body)) return 'A';
  if (/<[a-zA-Z][a-zA-Z0-9]*[\s>]/.test(body)) return 'B';
  const firstLine = (body.replace(/^\s+/, '').split('\n')[0] || '').trim();
  if (/^#{1,6}\s+\S/.test(firstLine)) return 'D';
  return 'C';
}

// ---------------------------------------------------------------------------
// A/B 类：HTML -> Markdown（turndown）
// ---------------------------------------------------------------------------

function makeTurndownService() {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
  });
  td.use(gfm);
  // Evernote dump 里的样式/脚本/图标/元信息标签，整体连内容一起丢弃
  td.remove(['script', 'style', 'svg', 'icons', 'meta', 'head', 'title', 'note-attributes', 'link']);
  return td;
}

/** 从整份 HTML dump 中提取 <en-note>...</en-note>（或退化到 <body>）内容 */
function extractHtmlFragment(rawBody) {
  const startIdx = rawBody.indexOf('<en-note');
  if (startIdx !== -1) {
    const endTag = '</en-note>';
    const endIdx = rawBody.lastIndexOf(endTag);
    if (endIdx > startIdx) return rawBody.slice(startIdx, endIdx + endTag.length);
    return rawBody.slice(startIdx);
  }
  const bodyIdx = rawBody.search(/<body[\s>]/i);
  if (bodyIdx !== -1) {
    const endIdx = rawBody.lastIndexOf('</body>');
    if (endIdx > bodyIdx) return rawBody.slice(bodyIdx, endIdx + '</body>'.length);
    return rawBody.slice(bodyIdx);
  }
  return rawBody;
}

function htmlToMarkdown(td, htmlFragment) {
  return td.turndown(htmlFragment);
}

/**
 * Evernote 会在正文最前面（type A 是紧跟 h1 笔记标题之后，type C 纯文本导出
 * 则直接是正文头几行）重复一遍标题文字、星期几+日期、时间几行"元信息回声"，
 * 和 front matter 里的 title/date 完全重复，属于导出噪音，予以剔除。
 */
function stripEvernoteTitleEcho(markdown, titleText) {
  const lines = markdown.split('\n');
  const normalize = (s) => s.replace(/[*_`#\s]/g, '').toLowerCase();
  const normalizedTitle = normalize(titleText || '');

  // If the doc opens with a markdown heading (type A after turndown), keep
  // it and start scanning for the echo block right after it; otherwise
  // (type C plain text, no heading at all) scan from the very first line.
  let i = /^[ \t]{0,3}#{1,6}\s+/.test(lines[0] || '') ? 1 : 0;
  let removed = 0;
  while (i < lines.length && removed < 4) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (trimmed === '') {
      i++;
      continue;
    }
    const isTitleEcho = normalizedTitle && normalize(trimmed) === normalizedTitle;
    const isWeekdayDate = /^[A-Z][a-z]+day,\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}$/.test(trimmed);
    const isTimeOnly = /^\d{1,2}:\d{2}\s?[AP]M$/i.test(trimmed);
    if (isTitleEcho || isWeekdayDate || isTimeOnly) {
      lines.splice(i, 1);
      removed++;
      continue;
    }
    break;
  }
  return lines.join('\n');
}

/** h1 内容整体被 <b> 包裹时 turndown 会产出 "# **文字**"，去掉多余加粗 */
function unwrapBoldHeading(markdown) {
  return markdown.replace(/^[ \t]{0,3}(#{1,6})\s+\*\*(.+?)\*\*\s*$/gm, '$1 $2');
}

/** 正文开头如果是与最终 title 等价的一级标题，去掉它（PostLayout 已经渲染过一次页面标题） */
function dropLeadingDuplicateHeading(markdown, title) {
  const lines = markdown.split('\n');
  const first = lines[0] || '';
  const m = first.match(/^[ \t]{0,3}#{1,2}\s+(.+)$/);
  if (!m) return markdown;
  const normalize = (s) => s.replace(/[*_`#\s]/g, '').toLowerCase();
  if (normalize(m[1]) !== normalize(title)) return markdown;
  let rest = lines.slice(1);
  while (rest.length && rest[0].trim() === '') rest = rest.slice(1);
  return rest.join('\n');
}

// ---------------------------------------------------------------------------
// C 类：纯文本逐行空行帖处理
// ---------------------------------------------------------------------------

const CODE_LINE_PATTERNS = [
  /^[#$>]\s?\S/,
  /^\[[\w.@-]+[^\]]*\][#$]\s?/,
  /^(yum|apt(-get)?|awk|sed|grep|mysql>|systemctl|service|iptables|rpm|tar|chmod|chown|mount|umount|df|du|ps|kill|ssh|scp|curl|wget|docker|kubectl|git|ifconfig|ip|route|crontab|vim|vi|cat|echo|ls|cd|mkdir|rm|cp|mv|find|netstat|tcpdump|useradd|passwd|firewall-cmd|systemctl|sysctl|lsof|top|free|fdisk|mdadm|lvcreate|vgcreate|pvcreate)\b/i,
  // A line that itself *starts* with a long-option flag ("--prefix=/usr" or,
  // very common in this corpus because of smart-punctuation autocorrect
  // during the original Evernote capture, the en-dash "–prefix=/usr") is
  // unambiguously a command/options-list line even in isolation.
  /^(--|—|–)[a-zA-Z][\w-]*/,
];

function looksLikeCodeLine(line) {
  const t = line.trim();
  if (!t) return false;
  if (CODE_LINE_PATTERNS.some((re) => re.test(t))) return true;
  const optionMatches = t.match(/(^|\s)(--|—|–)[a-zA-Z][\w-]*/g);
  if (optionMatches && optionMatches.length >= 2) return true;
  return false;
}

/** 把连续 >=2 行的命令行识别出来，包成 fenced code block；块内空行剔除 */
function fenceCodeRuns(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (looksLikeCodeLine(lines[i])) {
      // greedily extend the run, allowing blank lines inside as long as we
      // don't hit two consecutive non-code, non-blank lines
      let j = i;
      let codeCount = 0;
      const runLines = [];
      let trailingNonCodeBlankRun = 0;
      while (j < lines.length) {
        const t = lines[j].trim();
        if (t === '') {
          runLines.push(null); // marker, dropped later
          j++;
          continue;
        }
        if (looksLikeCodeLine(lines[j])) {
          runLines.push(lines[j].trim());
          codeCount++;
          j++;
          continue;
        }
        break;
      }
      if (codeCount >= 2) {
        const codeOnly = runLines.filter((l) => l !== null);
        out.push('```bash');
        out.push(...codeOnly);
        out.push('```');
        i = j;
        continue;
      }
    }
    out.push(lines[i]);
    i++;
  }
  return out;
}

/** 折叠"内容行+单空行"为单换行（对空行为单换行），仅在该模式为主导时生效 */
function collapseSingletonBlankLines(text) {
  const lines = text.split('\n');
  // count singleton-blank occurrences vs total blank lines
  let singleton = 0;
  let totalBlank = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      totalBlank++;
      const prevOk = i > 0 && lines[i - 1].trim() !== '';
      const nextOk = i < lines.length - 1 && lines[i + 1].trim() !== '';
      const prevBlank = i > 0 && lines[i - 1].trim() === '';
      const nextBlank = i < lines.length - 1 && lines[i + 1].trim() === '';
      if (prevOk && nextOk && !prevBlank && !nextBlank) singleton++;
    }
  }
  if (totalBlank === 0 || singleton / totalBlank < 0.4) return text;

  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      const prevOk = i > 0 && lines[i - 1].trim() !== '';
      const nextOk = i < lines.length - 1 && lines[i + 1].trim() !== '';
      const isFenceBoundary = out.length > 0 && out[out.length - 1].trim().startsWith('```');
      if (prevOk && nextOk && !isFenceBoundary) {
        continue; // drop singleton blank -> join as consecutive lines
      }
    }
    out.push(line);
  }
  return out.join('\n');
}

function transformPlainText(body) {
  let text = decodeEntities(body);
  text = text.replace(/\r\n/g, '\n');
  let lines = text.split('\n').map((l) => l.replace(/\s+$/, ''));
  lines = fenceCodeRuns(lines);
  let joined = lines.join('\n');
  joined = collapseSingletonBlankLines(joined);
  return joined;
}

// ---------------------------------------------------------------------------
// 通用后处理（所有类型）
// ---------------------------------------------------------------------------

function collapseExcessBlankLines(text) {
  return text.replace(/\n{3,}/g, '\n\n');
}

/**
 * turndown-plugin-gfm 的表格规则遇到"非简单表格"（单元格里有嵌套 div/span/
 * 多行内容）时会放弃转换，把整个 <table>...</table> 原样保留为 HTML（这是
 * 插件的设计行为，避免有损转换）。这类残留 HTML 里往往带一堆 Evernote 的
 * style=/class=/data-*=/draggable= 属性，予以剥离，只保留裸标签结构——
 * 裸 HTML 表格本身是合法的 markdown（remark 会原样透传），可以正常渲染。
 * 同时清掉转换后残留的完全空标签（如 <div></div>、<span></span>）。
 */
function stripResidualHtmlNoise(text) {
  let out = text.replace(
    /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[a-zA-Z_:][\w:-]*(?:=(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>/g,
    (full, tag, attrs, selfClose) => {
      // Only treat this as real leaked HTML (worth stripping) when it has at
      // least one genuine key="value" attribute. Bare bracket text copied
      // verbatim from a note -- e.g. a literal "<server name>" placeholder,
      // or "<target iqn...>" example config -- has no "=" and is left alone
      // so we don't mangle real note content that merely looks tag-shaped.
      if (!attrs.includes('=')) return full;
      return `<${tag}${selfClose ? ' /' : ''}>`;
    },
  );
  // drop now-attribute-less empty wrapper tags left behind by the strip above
  let prev;
  do {
    prev = out;
    out = out.replace(/<(div|span|p|tbody|thead)>\s*<\/\1>/gi, '');
  } while (out !== prev);
  return out;
}

function stripEmptyHardBreakLines(text) {
  // turndown 把 <div class="para"><br></div> 之类转成只含两个空格的行
  return text
    .split('\n')
    .map((l) => (l.trim() === '' ? '' : l))
    .join('\n');
}

// Evernote/OneNote 客户端在导出的笔记末尾（有时候是全文唯一内容，笔记本身
// 是空的）自动追加的签名行，常见于 239/398 篇里，无论 A(HTML dump) 还是
// C(纯文本导出) 都会出现，属于纯噪音，整行删除。
const BOILERPLATE_LINE_PATTERNS = [/^已使用\s*Microsoft\s*OneNote\s*\d*\s*创建[。.]?$/];

function stripBoilerplateLines(text) {
  return text
    .split('\n')
    .filter((l) => !BOILERPLATE_LINE_PATTERNS.some((re) => re.test(l.trim())))
    .join('\n');
}

/**
 * 按 fenced code block 分段，只对非代码段处理：折叠行内多余空格（2+ -> 1，
 * 常见于 &nbsp; 缩进残留），并去掉非列表行开头的多余空格（turndown 对
 * Evernote 段落缩进的残留常常导致 heading/title-echo 等锚定行首的正则匹配
 * 失效）。列表行（以 -/*+/数字. 开头）保留原有缩进，避免破坏嵌套列表结构。
 */
function collapseSpacesOutsideCode(text) {
  const segments = text.split(/(```[\s\S]*?```)/g);
  return segments
    .map((seg, idx) => {
      if (idx % 2 === 1) return seg; // inside fenced block, leave untouched
      return seg
        .split('\n')
        .map((line) => {
          const leading = line.match(/^[ \t]*/)[0];
          const rest = line.slice(leading.length);
          const isListLine = /^([-*+]|\d+[.)])\s/.test(rest);
          const base = isListLine ? line : rest;
          return base.replace(/ {2,}/g, ' ');
        })
        .join('\n');
    })
    .join('');
}

/**
 * @param {string} markdown
 * @param {{ light?: boolean }} [opts] type D ("已干净") 内容是手写/已经规范的
 *   markdown，只需要 nbsp 解码和过量空行折叠；跳过行首/多空格折叠等激进变换，
 *   避免破坏作者本来就写好的换行、缩进和 "两个空格换行" 硬换行标记。
 */
function commonCleanup(markdown, opts = {}) {
  let text = decodeEntities(markdown);
  text = stripBoilerplateLines(text);
  if (opts.light) {
    text = collapseExcessBlankLines(text);
    text = text.replace(/^\n+/, '').replace(/\n+$/, '\n');
    return text;
  }
  text = stripEmptyHardBreakLines(text);
  text = stripResidualHtmlNoise(text);
  text = collapseSpacesOutsideCode(text);
  text = collapseExcessBlankLines(text);
  text = text
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n');
  text = text.replace(/^\n+/, '').replace(/\n+$/, '\n');
  return text;
}

// ---------------------------------------------------------------------------
// 2.3 front matter 归一
// ---------------------------------------------------------------------------

function isPlaceholderTitle(title) {
  if (!title) return true;
  const t = String(title).trim();
  if (!t) return true;
  if (/^untitled(\s+note)?$/i.test(t)) return true;
  if (/^无标题/.test(t)) return true;
  return false;
}

function deriveTitleFromHeading(markdown) {
  const m = markdown.match(/^[ \t]{0,3}#{1,6}\s+(.+)$/m);
  if (!m) return null;
  const t = m[1].replace(/[*_`]/g, '').trim();
  return t || null;
}

function deriveTitleFromFirstSentence(markdown) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^[ \t]{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_`>#-]/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return null;
  const sentenceMatch = plain.match(/^(.+?[。！？.!?])/);
  let sentence = sentenceMatch ? sentenceMatch[1] : plain;
  sentence = sentence.replace(/[。！？.!?,，、\s]+$/, '').trim();
  if (!sentence) return null;
  return sentence.slice(0, 30);
}

function deriveTitle(existingTitle, markdown, categorySlug, dateIso, warnings) {
  if (!isPlaceholderTitle(existingTitle)) return { title: String(existingTitle).trim(), fallback: false };

  const fromHeading = deriveTitleFromHeading(markdown);
  if (fromHeading && !isPlaceholderTitle(fromHeading)) {
    warnings.push({ type: 'title-fallback', detail: `from-heading: ${fromHeading}` });
    return { title: fromHeading, fallback: true };
  }
  const fromSentence = deriveTitleFromFirstSentence(markdown);
  if (fromSentence && !isPlaceholderTitle(fromSentence)) {
    warnings.push({ type: 'title-fallback', detail: `from-first-sentence: ${fromSentence}` });
    return { title: fromSentence, fallback: true };
  }
  const display = CATEGORY_DISPLAY[categorySlug] || '杂记';
  const fallbackTitle = `${display}笔记 ${dateIso.slice(0, 10)}`;
  warnings.push({ type: 'title-fallback', detail: `category-date-fallback: ${fallbackTitle}` });
  return { title: fallbackTitle, fallback: true };
}

function buildDescription(markdown) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/^[ \t]{0,3}#{1,6}\s+.*$/gm, ' ')
    .replace(/^[ \t]*(-{3,}|_{3,}|\*{3,})[ \t]*$/gm, ' ') // horizontal rules
    .replace(/^[ \t]*[-*+][ \t]+/gm, '') // bullet list markers
    .replace(/^[ \t]*\d+[.)][ \t]+/gm, '') // numbered list markers (also
    // avoids treating "1." "2." TOC numbering as ASCII sentence enders below)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return undefined;

  // Chinese full-width punctuation (。！？) is an unambiguous sentence end
  // regardless of what follows. ASCII . ! ? are ambiguous in this corpus --
  // they show up constantly inside version numbers, IPs, and file paths
  // (e.g. "iqn.2013-10.com", "targets.conf") -- so only treat them as a
  // sentence end when followed by whitespace or end-of-string.
  const sentences = plain.split(/(?<=[。！？])|(?<=[!?.])(?=\s|$)/).filter((s) => s.trim());
  let desc = '';
  for (const s of sentences) {
    const next = desc ? `${desc}${desc.endsWith(' ') ? '' : ' '}${s}`.trim() : s;
    if (next.length > 160) {
      if (desc.length >= 80) break;
      if (!desc) {
        let cut = s.slice(0, 160);
        const boundary = Math.max(cut.lastIndexOf('，'), cut.lastIndexOf(', '), cut.lastIndexOf(' '));
        if (boundary >= 80) cut = cut.slice(0, boundary);
        desc = cut.trim();
      }
      break;
    }
    desc = next;
  }
  if (!desc) desc = plain.slice(0, 160);
  return desc.trim() || undefined;
}

function parseDateToIso(rawDate) {
  const d = rawDate instanceof Date ? rawDate : new Date(rawDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function mapCategories(rawCategories) {
  const list = Array.isArray(rawCategories) ? rawCategories : rawCategories ? [rawCategories] : [];
  const mapped = list.map((c) => ({ raw: c, slug: CATEGORY_MAP[c] || 'misc' }));
  let primary = mapped.find((m) => m.slug !== 'misc');
  if (!primary) primary = mapped[0];
  const primarySlug = primary ? primary.slug : 'misc';
  const extraSlugs = [...new Set(mapped.map((m) => m.slug).filter((s) => s !== primarySlug))];
  return { category: primarySlug, extraCategoryTags: extraSlugs };
}

function cleanExistingTags(rawTags) {
  const list = Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : [];
  return list
    .map((t) => String(t).trim())
    .filter((t) => t && !JUNK_TAGS.has(t.toLowerCase()) && !JUNK_TAG_PATTERN.test(t));
}

function deriveTagsFromContent(markdown, title) {
  const haystack = `${title}\n${markdown}`;
  const hits = [];
  for (const [tag, re] of TAG_DICT) {
    if (re.test(haystack)) hits.push(tag);
    if (hits.length >= 5) break;
  }
  return hits;
}

function buildTags(existingTags, extraCategoryTags, markdown, title) {
  let tags = cleanExistingTags(existingTags);
  if (tags.length < 2) {
    const derived = deriveTagsFromContent(markdown, title);
    tags = [...new Set([...tags, ...derived])];
  }
  tags = [...new Set([...tags, ...extraCategoryTags])];
  return tags.slice(0, 8).map((t) => t.toLowerCase());
}

// ---------------------------------------------------------------------------
// 2.4 slug 生成
// ---------------------------------------------------------------------------

function coreWordsFromTitle(title, maxWords = 6) {
  // Extract alternating runs of ASCII alnum vs CJK directly with regex
  // alternation, so a mixed token like "linux下IPTABLES配置详解" (no space
  // between the English word and the Chinese that follows it -- very common
  // in this corpus) splits into ["linux","下","iptables","配置","详解"]
  // instead of being sliced blindly across the ascii/CJK boundary.
  const matches = title.match(/[a-zA-Z0-9]+|[一-鿿]+/g) || [];
  const words = [];
  for (const t of matches) {
    if (/^[a-zA-Z0-9]+$/.test(t)) {
      words.push(t.toLowerCase());
    } else {
      for (let i = 0; i < t.length; i += 2) words.push(t.slice(i, i + 2));
    }
    if (words.length >= maxWords) break;
  }
  return words.slice(0, maxWords);
}

function slugify(title) {
  const words = coreWordsFromTitle(title);
  const parts = words.map((w) => {
    if (/^[a-z0-9]+$/.test(w)) return w;
    const py = pinyin(w, { toneType: 'none', type: 'array' });
    return py.join('');
  });
  let slug = parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (slug.length > 60) {
    slug = slug.slice(0, 60).replace(/-[^-]*$/, '');
    slug = slug || parts.join('-').slice(0, 60);
  }
  if (!slug) slug = 'post';
  return slug;
}

function buildOutputFilename(dateIso, title, usedSlugs) {
  const datePrefix = dateIso.slice(0, 10);
  const baseSlug = slugify(title);
  let candidate = baseSlug;
  let n = 2;
  // The published route is /posts/<slug>/ with the date prefix stripped
  // (src/lib/posts.ts: slugFromId), so the *bare slug* must be unique across
  // the whole corpus, not just unique-per-date -- two different-dated posts
  // with the same title (this corpus really does have such duplicates, e.g.
  // a note re-saved years apart) would otherwise collide on the same route.
  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${n}`;
    n++;
  }
  usedSlugs.add(candidate);
  return `${datePrefix}-${candidate}.md`;
}

// ---------------------------------------------------------------------------
// 主处理管线：单篇文章
// ---------------------------------------------------------------------------

function detectPostCategoryHint(rawCategories) {
  const list = Array.isArray(rawCategories) ? rawCategories : rawCategories ? [rawCategories] : [];
  const first = list[0];
  if (!first) return null;
  // asset dirs are named e.g. "RedHat", "PHP-[2]", "Winodws-(...)"; try a loose match
  const dirs = fs.readdirSync(ASSETS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  const normalized = String(first).replace(/[\s[\]]/g, '').toLowerCase();
  const hit = dirs.find((d) => d.replace(/[\s[\]-]/g, '').toLowerCase().includes(normalized) || normalized.includes(d.replace(/[\s[\]-]/g, '').toLowerCase()));
  return hit || null;
}

const td = makeTurndownService();

async function processPost(filename, assetIndex, usedSlugs, report) {
  const srcPath = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(srcPath, 'utf8');
  const warnings = [];
  let type = 'unknown';

  try {
    const parsed = matter(raw);
    const fm = parsed.data || {};
    const body = parsed.content || '';
    type = classify(body);

    let markdown;
    if (type === 'A') {
      const fragment = extractHtmlFragment(body);
      markdown = htmlToMarkdown(td, fragment);
    } else if (type === 'B') {
      markdown = htmlToMarkdown(td, body);
    } else if (type === 'C') {
      markdown = transformPlainText(body);
    } else {
      markdown = decodeEntities(body);
    }

    // Normalize whitespace (strip stray leading indentation left behind by
    // turndown, collapse runs of spaces) *before* any regex that anchors to
    // line start -- otherwise headings like "     # **title**" both fail our
    // own heading-fix regexes AND render as an indented code block instead
    // of a heading once published.
    // Type D ("已干净") content is hand-authored/already-correct markdown --
    // only light cleanup (nbsp decode, excess blank-line collapse) applies,
    // so we don't strip the author's intentional hard-break trailing spaces
    // or list-continuation indentation.
    const light = type === 'D';
    markdown = commonCleanup(markdown, { light });

    if (type === 'A' || type === 'B') {
      markdown = unwrapBoldHeading(markdown);
    }

    const dateIso = parseDateToIso(fm.date) || new Date().toISOString();
    const { category, extraCategoryTags } = mapCategories(fm.categories);

    if (type === 'A' || type === 'B' || type === 'C') {
      // title echo strip needs a title guess; use existing fm.title if present (usually already good)
      const guess = !isPlaceholderTitle(fm.title) ? fm.title : deriveTitleFromHeading(markdown);
      markdown = stripEvernoteTitleEcho(markdown, guess);
      markdown = commonCleanup(markdown, { light });
    }

    const postCategoryHint = detectPostCategoryHint(fm.categories);
    markdown = rewriteImages(markdown, assetIndex, postCategoryHint, warnings);
    markdown = commonCleanup(markdown, { light });

    const { title, fallback: titleFallback } = deriveTitle(fm.title, markdown, category, dateIso, warnings);

    if (type === 'A' || type === 'B') {
      // PostLayout.astro (Phase 1) already renders `<h1>{title}</h1>` above
      // the article body. Type A/B bodies came from turndown converting the
      // note's own <h1 class="noteTitle">, which is 1:1 redundant with that
      // page title -- drop it here so the article doesn't show the same
      // heading twice back to back. (Type C never synthesizes a heading;
      // type D is hand-authored content we intentionally leave untouched.)
      markdown = dropLeadingDuplicateHeading(markdown, title);
    }

    if (!markdown.trim()) {
      warnings.push({ type: 'empty-body', detail: 'source note has no recoverable body content after stripping boilerplate' });
    }

    const description = buildDescription(markdown);
    const tags = buildTags(fm.tags, extraCategoryTags, markdown, title);

    const outFrontMatter = {
      title,
      date: dateIso.slice(0, 10),
      ...(description ? { description } : {}),
      category,
      tags,
      draft: false,
      source: 'evernote-local-db',
      lang: 'zh',
    };

    const outFilename = buildOutputFilename(dateIso, title, usedSlugs);
    const outContent = matter.stringify(markdown.trim() + '\n', outFrontMatter, { language: 'yaml' });

    ensureDir(OUT_DIR);
    fs.writeFileSync(path.join(OUT_DIR, outFilename), outContent, 'utf8');

    report.entries.push({
      source: filename,
      output: outFilename,
      type,
      titleFallback,
      warnings,
      status: 'ok',
    });
    report.counts.byType[type] = (report.counts.byType[type] || 0) + 1;
    if (titleFallback) report.counts.titleFallback++;
    for (const w of warnings) {
      if (w.type === 'image-missing') report.counts.imageMissing++;
      if (w.type === 'external-image') report.counts.externalImage++;
      if (w.type === 'empty-body') report.counts.emptyBody++;
    }
  } catch (err) {
    report.entries.push({
      source: filename,
      output: null,
      type,
      titleFallback: false,
      warnings: [{ type: 'failed', detail: err.stack || err.message }],
      status: 'failed',
    });
    report.counts.failed++;
    console.error(`[FAILED] ${filename}: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// 抽样选择：四类各至少 4 篇，含至少 2 篇 Untitled、2 篇带图片的
// ---------------------------------------------------------------------------

function pickSample(allFiles, size) {
  const byType = { A: [], B: [], C: [], D: [] };
  const untitledFiles = [];
  const withImages = [];

  for (const f of allFiles) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8');
    const parsed = matter(raw);
    const t = classify(parsed.content || '');
    byType[t]?.push(f);
    if (/untitled/i.test(f)) untitledFiles.push(f);
    if (/<img[\s>]/i.test(parsed.content || '')) withImages.push(f);
  }

  const picked = new Set();
  const addN = (arr, n) => {
    for (const f of arr) {
      if (picked.size >= size) break;
      if (!picked.has(f)) {
        picked.add(f);
        n--;
      }
      if (n <= 0) break;
    }
  };

  addN(byType.A, 4);
  addN(byType.B, 4);
  addN(byType.C, 4);
  addN(byType.D, Math.min(3, byType.D.length));
  addN(untitledFiles, 2);
  addN(withImages, 2);

  // fill remaining slots round-robin from all types to hit target size
  const remainingPool = allFiles.filter((f) => !picked.has(f));
  for (const f of remainingPool) {
    if (picked.size >= size) break;
    picked.add(f);
  }

  return [...picked].slice(0, size);
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const allFiles = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).sort();

  const report = {
    generatedAt: new Date().toISOString(),
    mode: SAMPLE_MODE ? `sample(${SAMPLE_SIZE})` : 'full',
    counts: { byType: {}, titleFallback: 0, imageMissing: 0, externalImage: 0, emptyBody: 0, failed: 0 },
    imageAssetWarnings: [],
    entries: [],
  };

  console.log(`Building image asset map from ${ASSETS_DIR} ...`);
  const assetIndex = await buildImageAssetMap(report);
  console.log(`  -> ${assetIndex.totalAssets} assets indexed, copied into ${IMAGES_OUT_DIR}`);

  let targetFiles = allFiles;
  if (SAMPLE_MODE) {
    targetFiles = pickSample(allFiles, SAMPLE_SIZE);
    console.log(`Sample mode: processing ${targetFiles.length} files.`);
  } else {
    console.log(`Full mode: processing ${targetFiles.length} files.`);
    // clean previous script-managed outputs to keep reruns idempotent even if
    // the slugging/classification logic changes between script versions.
    ensureDir(OUT_DIR);
    for (const f of fs.readdirSync(OUT_DIR)) {
      if (!f.endsWith('.md')) continue;
      const full = path.join(OUT_DIR, f);
      try {
        const parsed = matter(fs.readFileSync(full, 'utf8'));
        if (parsed.data && parsed.data.source === 'evernote-local-db') {
          fs.unlinkSync(full);
        }
      } catch {
        // not parseable front matter, leave alone
      }
    }
  }

  const usedSlugs = new Set();
  for (const filename of targetFiles) {
    await processPost(filename, assetIndex, usedSlugs, report);
  }

  ensureDir(path.dirname(REPORT_PATH));
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n=== Migration summary ===');
  console.log('By type:', report.counts.byType);
  console.log('title-fallback:', report.counts.titleFallback);
  console.log('image-missing:', report.counts.imageMissing);
  console.log('external-image:', report.counts.externalImage);
  console.log('empty-body:', report.counts.emptyBody);
  console.log('failed:', report.counts.failed);
  console.log(`Report written to ${path.relative(ROOT, REPORT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
