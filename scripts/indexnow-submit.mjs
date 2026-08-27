/**
 * IndexNow へ URL を一括送信する。
 *
 * なぜ必要か:
 *   ChatGPT Search と Microsoft Copilot は Bing の索引から引用元を選ぶ。
 *   Bing に索引されていないページは、内容がどれだけ良くても引用されえない。
 *   IndexNow で送信すると、Bingbot の巡回を待たずに数時間で取り込まれる。
 *
 * 使い方:
 *   INDEXNOW_KEY=<キー> node scripts/indexnow-submit.mjs
 *
 *   キーは https://tc-timecard.com/<キー>.txt で公開されている必要がある。
 *   （IndexNow はこのファイルでサイトの所有を確認する）
 *   キーが未設定なら何もせず正常終了する。デプロイを失敗させない。
 */
import { readFileSync } from 'node:fs';

const HOST = 'tc-timecard.com';
const SITEMAP = 'dist/sitemap-0.xml';
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

const key = (process.env.INDEXNOW_KEY || '').trim();
if (!key) {
  console.log('[indexnow] INDEXNOW_KEY が未設定のため送信をスキップします');
  process.exit(0);
}

let xml;
try {
  xml = readFileSync(SITEMAP, 'utf8');
} catch (err) {
  console.error(`[indexnow] ${SITEMAP} を読めませんでした:`, err.message);
  process.exit(1);
}

const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urlList.length === 0) {
  console.error('[indexnow] サイトマップからURLを取得できませんでした');
  process.exit(1);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList,
  }),
});

// 200/202 が成功。IndexNow は本文を返さないことが多い。
if (res.ok) {
  console.log(`[indexnow] ${urlList.length} 件のURLを送信しました (HTTP ${res.status})`);
} else {
  const body = await res.text().catch(() => '');
  // 送信の失敗でデプロイを失敗させたくないので、警告して正常終了する。
  console.warn(`[indexnow] 送信に失敗しました (HTTP ${res.status}) ${body}`.trim());
}
