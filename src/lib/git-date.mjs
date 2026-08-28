/**
 * コンテンツの「実際に最後に変更した日」をビルド時にgitから取得する。
 *
 * 経緯:
 *   マニュアルのフロントマターには updated（最終更新日）があるが、28件すべて
 *   未設定で、結果として dateModified も「最終更新」表示も一切出ていなかった。
 *   sitemap にも lastmod が1件も無かった。生成AIの引用は新しいコンテンツに
 *   偏るため、鮮度シグナルが無いのは損失になる。
 *
 * 方針:
 *   原稿を触らずに実日付を得るため、そのファイルに触れた最後のコミット日時を使う。
 *   フロントマターに updated があればそちらを優先する（人間の判断が上）。
 *   「実質的な変更なしに日付を更新すると検索側の信頼を損なう」とされているため、
 *   ビルド日やダミーの日付は絶対に入れない。取れなければ undefined を返す。
 *
 * astro.config.mjs（sitemap）と .astro ページの両方から使うため .mjs にしている。
 */
import { execFileSync } from 'node:child_process';

const git = (args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/**
 * shallow clone（actions/checkout の既定）では履歴が1コミットしかないため、
 * 全ファイルが同じ日付＝ビルド当日になってしまう。それは誤った鮮度シグナルなので、
 * shallow のときは何も返さない。CI側では fetch-depth: 0 を指定している。
 */
let historyUsable = null;
const hasUsableHistory = () => {
  if (historyUsable !== null) return historyUsable;
  try {
    historyUsable = git(['rev-parse', '--is-shallow-repository']) === 'false';
    if (!historyUsable) {
      console.warn('[git-date] shallow clone のため最終更新日を取得しません');
    }
  } catch {
    // gitが無い環境（tarball展開など）でもビルドは通す
    historyUsable = false;
    console.warn('[git-date] git が使えないため最終更新日を取得しません');
  }
  return historyUsable;
};

/** 同じファイルを何度もgitに問い合わせないためのキャッシュ */
const cache = new Map();

/**
 * 指定ファイルに触れた最後のコミット日時（ISO文字列）。
 * 取得できない場合・未コミットのファイルの場合は undefined。
 *
 * @param {string} filePath リポジトリルートからの相対パス
 * @returns {string | undefined}
 */
export const gitLastModified = (filePath) => {
  if (cache.has(filePath)) return cache.get(filePath);

  let iso;
  if (hasUsableHistory()) {
    try {
      const out = git(['log', '-1', '--format=%cI', '--', filePath]);
      // 未追跡・未コミットのファイルは空文字が返る
      iso = out === '' ? undefined : new Date(out).toISOString();
    } catch {
      iso = undefined;
    }
  }

  cache.set(filePath, iso);
  return iso;
};

/**
 * 複数ファイルのうち最も新しい最終更新日。一覧ページ用。
 * @param {string[]} filePaths
 * @returns {string | undefined}
 */
export const newestLastModified = (filePaths) => {
  let newest;
  for (const p of filePaths) {
    const iso = gitLastModified(p);
    if (iso && (!newest || iso > newest)) newest = iso;
  }
  return newest;
};

/**
 * フロントマターの updated を優先し、無ければgitの最終コミット日時を使う。
 * どちらも無ければ undefined（＝dateModified を出力しない）。
 *
 * @param {string | null | undefined} frontmatterUpdated
 * @param {string} filePath
 * @returns {string | undefined}
 */
export const resolveLastModified = (frontmatterUpdated, filePath) => {
  if (frontmatterUpdated) {
    const d = new Date(frontmatterUpdated);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return gitLastModified(filePath);
};
