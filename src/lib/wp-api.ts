/**
 * 旧WordPressサイト（WP REST API）への参照。
 *
 * 経緯:
 *   もともと各ページが `https://tc-timecard.com/wp-json/...` を直接叩いていたが、
 *   tc-timecard.com は現在このAstroサイトを指しており、WordPress は別ドメインへ移設された。
 *   そのため全ての取得が 404 になり、`try/catch` で握りつぶされて静かに空になっていた。
 *
 * 現在:
 *   お知らせ・マニュアルの本文はすべて `src/content/` のMarkdownが正であり、
 *   ページの生成（getStaticPaths）もローカルコレクションのみを見ている。
 *   したがって既定では WP を参照しない。
 *
 * 再び参照したい場合:
 *   Cloudflare Pages の環境変数 `WP_API_BASE` に旧サイトのオリジンを設定する。
 *   例: WP_API_BASE=https://old.tc-timecard.com
 */
const rawBase = import.meta.env.WP_API_BASE ?? process.env.WP_API_BASE ?? '';

/** 末尾スラッシュを落としたオリジン。未設定なら空文字。 */
export const WP_API_BASE = String(rawBase).trim().replace(/\/+$/, '');

/** WP参照が有効かどうか。 */
export const isWpEnabled = () => WP_API_BASE !== '';

/** WP REST API のURLを組み立てる。無効時は null。 */
export const wpEndpoint = (path: string): string | null =>
  isWpEnabled() ? `${WP_API_BASE}/wp-json/wp/v2/${path.replace(/^\/+/, '')}` : null;

/**
 * WP REST API から取得する。無効時・失敗時は fallback をそのまま返す。
 * 失敗を握りつぶすのは従来どおりだが、無効と失敗を区別してログに出す。
 */
export const fetchWp = async <T>(path: string, fallback: T): Promise<T> => {
  const url = wpEndpoint(path);
  if (!url) return fallback;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      console.warn(`[wp-api] ${res.status} ${url} — フォールバックを使用します`);
      return fallback;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`[wp-api] 取得に失敗しました: ${url}`, error);
    return fallback;
  }
};
