import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_URL = 'https://tc-timecard.com/wp-json/wp/v2/pages?parent=2887&per_page=100';
const OUT_DIR = path.resolve('src/content/manual');
const WP_UPLOAD_BASE = /https?:\/\/tc-timecard\.com\/wp-content\/uploads\//i;

const wpSlugToLocalFile = {
  'auto-overnight': 'auto-next-day',
  'face-recognition-overview': 'face-auth-overview',
  'face-recognition': 'face-auth',
  'add-user': 'owner-account',
  'add-staff': 'staff-account',
  'display-input-only-account': 'limited-account',
  'permission-edit-time': 'lock-edit-time',
  'skip-work-detail': 'skip-detail-after-stamp',
  'password-protection': 'admin-password',
  'holiday-setting': 'holiday-settings',
  'morning-overtime': 'early-overtime',
  'closind-date': 'closing-day',
  'subscribe': 'billing',
  'unsubscribe': 'delete-account',
  'cancel-subscription': 'cancel-subscription',
  'basic-how-to-use': 'basic-usage',
  'multiple-breaks': 'multi-break',
  'shifts': 'shift-management',
  'overnight24': 'open-24h',
  'overnight1': 'midnight-operation',
  'slack': 'slack-integration',
  'category-pattern-setting': 'category-patterns',
  'memo': 'memo-feature',
};

const decodeEntities = (text) =>
  text
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&#8230;', '…')
    .replaceAll('&hellip;', '…')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

const localizeUploadUrl = (url) =>
  String(url || '').replace(WP_UPLOAD_BASE, '/assets/manual/');

const toYouTubeEmbedUrl = (url) => {
  const normalized = String(url || '').trim();
  if (!normalized) return '';

  try {
    const u = new URL(normalized);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) {
        return `https://www.youtube.com${u.pathname}`;
      }
      const id = u.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
  } catch {
    return '';
  }

  return '';
};

const getAttr = (tag, attr) => {
  const re = new RegExp(`${attr}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i');
  const m = String(tag || '').match(re);
  return m ? m[2] : '';
};

const htmlToMarkdown = (html) => {
  let out = decodeEntities(html || '');

  const iframeTokens = [];
  out = out.replace(/<iframe[^>]*src=["'][^"']+["'][^>]*><\/iframe>/gi, (full) => {
    const src = getAttr(full, 'src');
    const embed = toYouTubeEmbedUrl(src);
    if (!embed) {
      return '';
    }
    const token = `__YOUTUBE_IFRAME_${iframeTokens.length}__`;
    iframeTokens.push(
      `<iframe width="560" height="315" src="${embed}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>`
    );
    return `\n\n${token}\n\n`;
  });

  out = out.replace(/<img[^>]*>/gi, (full) => {
    const srcRaw = getAttr(full, 'src');
    const alt = decodeEntities(getAttr(full, 'alt') || 'manual-image').replace(/\n/g, ' ').trim();
    if (!srcRaw) {
      return '';
    }
    const src = localizeUploadUrl(srcRaw.split('?')[0]);
    return `\n![${alt}](${src})\n`;
  });

  out = out.replace(/<figure[^>]*>/gi, '\n').replace(/<\/figure>/gi, '\n');

  out = out.replace(/<\s*br\s*\/?\s*>/gi, '\n');
  out = out.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n## ${decodeEntities(t).replace(/<[^>]*>/g, '').trim()}\n`);
  out = out.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n### ${decodeEntities(t).replace(/<[^>]*>/g, '').trim()}\n`);
  out = out.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n#### ${decodeEntities(t).replace(/<[^>]*>/g, '').trim()}\n`);

  out = out.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => {
    const txt = decodeEntities(t).replace(/<[^>]*>/g, '').trim();
    return txt ? `- ${txt}\n` : '';
  });

  out = out.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => {
    const txt = decodeEntities(t).replace(/<[^>]*>/g, '').trim();
    return txt ? `\n${txt}\n` : '';
  });

  out = out
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '');

  out = out
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim();

  out = out.replace(/__YOUTUBE_IFRAME_(\d+)__/g, (_, idx) => iframeTokens[Number(idx)] || '');

  return out;
};

const splitFrontmatter = (raw) => {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n*/);
  if (!match) {
    return { frontmatter: '', body: raw.trim() };
  }
  return {
    frontmatter: `---\n${match[1]}\n---\n\n`,
    body: raw.slice(match[0].length).trim(),
  };
};

const getFallbackFrontmatter = (page, localSlug) => {
  const title = decodeEntities((page?.title?.rendered || '').replace(/<[^>]*>/g, ' ').trim()).replace(/"/g, '\\"');
  const desc = decodeEntities((page?.excerpt?.rendered || '').replace(/<[^>]*>/g, ' ').trim()).replace(/"/g, '\\"');
  return [
    '---',
    `title: "${title}"`,
    `description: "${desc || 'マニュアル説明'}"`,
    'category: "overview"',
    `itemCode: "WP.${String(page?.id || '').padStart(4, '0')}"`,
    `keywords: ["${localSlug}"]`,
    'isNew: false',
    'popular: false',
    'order: 999',
    '---',
    '',
  ].join('\n');
};

const main = async () => {
  const response = await fetch(API_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Failed to fetch WP pages: ${response.status}`);
  }

  const pages = await response.json();
  if (!Array.isArray(pages)) {
    throw new Error('Invalid WP response');
  }

  const existingFiles = new Set((await readdir(OUT_DIR)).filter((name) => name.endsWith('.md')));

  let updated = 0;
  let created = 0;

  for (const page of pages) {
    const localSlug = wpSlugToLocalFile[page.slug] ?? page.slug;
    const fileName = `${localSlug}.md`;
    const filePath = path.join(OUT_DIR, fileName);
    const markdownBody = htmlToMarkdown(page?.content?.rendered || '');
    if (!markdownBody) {
      continue;
    }

    if (existingFiles.has(fileName)) {
      const current = await readFile(filePath, 'utf8');
      const { frontmatter } = splitFrontmatter(current);
      const next = `${frontmatter || getFallbackFrontmatter(page, localSlug)}${markdownBody}\n`;
      await writeFile(filePath, next, 'utf8');
      updated += 1;
      console.log(`updated: ${fileName}`);
    } else {
      const next = `${getFallbackFrontmatter(page, localSlug)}${markdownBody}\n`;
      await writeFile(filePath, next, 'utf8');
      created += 1;
      console.log(`created: ${fileName}`);
    }
  }

  console.log(`done: updated=${updated}, created=${created}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
