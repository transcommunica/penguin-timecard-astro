/**
 * sitemap の lastmod を決めるためのURL→ソースファイル対応。
 *
 * @astrojs/sitemap はオプション未指定だったため、85件すべて <loc> だけで
 * lastmod が無かった。ここでURLごとに「その内容の出どころ」を特定し、
 * git の最終コミット日時を lastmod として与える。
 */
import { readdirSync } from 'node:fs';
import { gitLastModified, newestLastModified } from './git-date.mjs';

const listMd = (dir) => {
  try {
    return readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => `${dir}/${f}`);
  } catch {
    return [];
  }
};

const NEWS_DIR = 'src/content/news';
const MANUAL_DIR = 'src/content/manual';

let newsFiles = null;
let manualFiles = null;
const getNewsFiles = () => (newsFiles ??= listMd(NEWS_DIR));
const getManualFiles = () => (manualFiles ??= listMd(MANUAL_DIR));

/**
 * 絶対URLから lastmod（ISO文字列）を求める。特定できなければ undefined。
 * @param {string} url
 * @returns {string | undefined}
 */
export const sitemapLastmod = (url) => {
  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return undefined;
  }

  // トップは記事一覧を載せているので、ページ本体とお知らせの新しい方
  if (pathname === '/') {
    return newestLastModified(['src/pages/index.astro', ...getNewsFiles()]);
  }

  // マニュアル詳細
  const manual = pathname.match(/^\/manual\/([^/]+)\/$/);
  if (manual) return gitLastModified(`${MANUAL_DIR}/${manual[1]}.md`);

  // マニュアル索引
  if (pathname === '/manual/') {
    return newestLastModified(['src/pages/manual.astro', ...getManualFiles()]);
  }

  // お知らせのカテゴリ索引・ページネーションは、お知らせ全体の新しさで代表する
  if (pathname === '/news/' || /^\/news\/category\/[^/]+\/$/.test(pathname) || /^\/news\/\d+\/$/.test(pathname)) {
    return newestLastModified(getNewsFiles());
  }

  // お知らせ詳細
  const news = pathname.match(/^\/news\/([^/]+)\/$/);
  if (news) return gitLastModified(`${NEWS_DIR}/${news[1]}.md`);

  // それ以外の固定ページは対応する .astro ファイル
  const page = pathname.match(/^\/([^/]+)\/$/);
  if (page) return gitLastModified(`src/pages/${page[1]}.astro`);

  return undefined;
};
