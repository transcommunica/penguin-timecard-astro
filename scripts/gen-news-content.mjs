import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_URL = 'https://tc-timecard.com/wp-json/wp/v2/posts?per_page=100';
const OUT_DIR = path.resolve('src/content/news');

const stripHtml = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const keepJapaneseLocaleText = (text) =>
  String(text || '')
    .replace(/\[:(?!ja\])[a-z-]+\][\s\S]*?(?=(\[:[a-z-]+\]|\[:\]|$))/gi, '')
    .replace(/\[:ja\]/gi, '')
    .replace(/\[:\]/g, '')
    .trim();

const decodeEntities = (text) =>
  String(text || '')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&#8230;', '…')
    .replaceAll('&hellip;', '…')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

  const normalizeLocalizedText = (text) => keepJapaneseLocaleText(decodeEntities(text));

const cleanYoastDescription = (text) =>
  String(text || '')
    .replace(/続きを読む\.\.\.\s*from.*$/i, '')
    .replace(/\[\.\.\.\]/g, '')
    .trim();

const toYamlString = (value) => JSON.stringify(String(value ?? ''));

const normalizeSlug = (slug) => String(slug || '').trim();

const jpTitleToSlug = {
  '純勤務時間の計算不具合について': 'net-worktime-calculation-bugfix',
  '深夜割増時間などの時間帯集計に対応しました': 'late-night-premium-timeband-support',
  '24時間営業に対応しました': 'support-24-hour-operation',
  'アルコールチェック記録簿': 'alcohol-check-logbook',
  '複数回休憩に対応しました': 'multiple-break-support',
  '深夜勤務に対応しました': 'late-night-shift-support',
  'ai顔認証機能（バージョン6）をリリースしました': 'ai-face-recognition-v6-release',
  'バージョン5-8-1をリリースしました': 'version-5-8-1-release',
  'バージョン5-7-0をリリースしました': 'version-5-7-0-release',
  'バージョン2-5をリリース': 'version-2-5-release',
};

const toAsciiSlug = (input) =>
  String(input || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const resolveSlug = (post) => {
  const title = normalizeLocalizedText(stripHtml(post?.title?.rendered || '')).trim();
  if (jpTitleToSlug[title]) {
    return jpTitleToSlug[title];
  }

  const raw = normalizeSlug(post?.slug);
  const decoded = (() => {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();

  const decodedAscii = toAsciiSlug(decoded);
  if (decodedAscii) {
    return decodedAscii;
  }

  const titleAscii = toAsciiSlug(title);
  if (titleAscii) {
    return titleAscii;
  }

  return `post-${String(post?.id || '').trim() || 'unknown'}`;
};

const buildFrontmatter = (post, normalizedSlug) => {
  const title = normalizeLocalizedText(stripHtml(post?.title?.rendered || 'お知らせ'));
  const excerptHtml = keepJapaneseLocaleText(String(post?.excerpt?.rendered || ''));
  const description = normalizeLocalizedText(stripHtml(excerptHtml));
  const seoTitleRaw = post?.yoast_head_json?.title || '';
  const seoDescriptionRaw = post?.yoast_head_json?.og_description || '';
  const seoTitle = normalizeLocalizedText(stripHtml(seoTitleRaw));
  const seoDescription = normalizeLocalizedText(cleanYoastDescription(seoDescriptionRaw));

  const lines = [
    '---',
    `slug: ${toYamlString(normalizedSlug)}`,
    `title: ${toYamlString(title)}`,
    `date: ${toYamlString(post?.date || '')}`,
    `excerptHtml: ${toYamlString(excerptHtml)}`,
    `description: ${toYamlString(description)}`,
  ];

  if (seoTitle) {
    lines.push(`seoTitle: ${toYamlString(seoTitle)}`);
  }
  if (seoDescription) {
    lines.push(`seoDescription: ${toYamlString(seoDescription)}`);
  }

  lines.push('---', '');
  return lines.join('\n');
};

const main = async () => {
  const response = await fetch(API_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Failed to fetch WP posts: ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('Invalid WP response for posts');
  }

  await mkdir(OUT_DIR, { recursive: true });
  const currentFiles = await readdir(OUT_DIR);
  await Promise.all(
    currentFiles
      .filter((name) => name.endsWith('.md'))
      .map((name) => unlink(path.join(OUT_DIR, name)))
  );

  let written = 0;
  for (const post of payload) {
    const slug = resolveSlug(post);
    if (!slug) continue;

    const bodyHtml = keepJapaneseLocaleText(String(post?.content?.rendered || '').trim());
    const frontmatter = buildFrontmatter(post, slug);
    const filePath = path.join(OUT_DIR, `${slug}.md`);
    const next = `${frontmatter}${bodyHtml}\n`;
    await writeFile(filePath, next, 'utf8');
    written += 1;
    console.log(`written: ${slug}.md`);
  }

  console.log(`done: written=${written}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
