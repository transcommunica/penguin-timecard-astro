import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { NEWS_CATEGORIES, NEWS_CATEGORY_META, resolveNewsCategory } from '../lib/news-category';

/**
 * llms.txt（llmstxt.org 準拠）。
 *
 * 期待値について:
 *   Google は llms.txt をサポートしないと明言しており、OpenAI・Anthropic を
 *   含むどのベンダーも本番の検索/クロール経路で読むと表明していない。
 *   実際に効くのは「人がAIエージェントにこのサイトを読ませるときの目次」
 *   としての用途。低コストな保険として置いており、検索・引用の改善は
 *   見込んでいない。本命は robots.txt の方針・鮮度シグナル・可視テキスト。
 *
 * 記事を追加したときに自動で追従するよう、コンテンツコレクションから生成する。
 */

/** マニュアルのカテゴリ表示順とラベル（manual.astro の並びに合わせる） */
const MANUAL_CATEGORY_LABELS: Array<{ key: string; label: string }> = [
  { key: 'core', label: '重要な基本設定' },
  { key: 'overview', label: '概要' },
  { key: 'settings', label: '設定' },
  { key: 'behavior', label: '動作関連' },
  { key: 'billing', label: 'お支払い・解約' },
];

/** 主要ページ。サイト内の固定ページのうち、AIに読ませたいものを列挙する。 */
const KEY_PAGES: Array<{ path: string; title: string; note: string }> = [
  { path: '/', title: 'トップページ', note: 'ペンギンタイムカードの概要と主な機能。' },
  { path: '/timecard-app/', title: 'タイムカードアプリとは', note: '紙のタイムカードやExcelからの置き換えについて。' },
  { path: '/for-small-business/', title: '小さなお店・会社向け', note: '少人数の店舗・事務所での使い方。' },
  { path: '/shift-work/', title: 'シフト制・夜勤の勤怠管理', note: '深夜勤務や日付をまたぐ勤務の扱い。' },
  { path: '/rate-plan/', title: '料金プラン', note: '5つのプランの月額と人数の上限、支払い方法。' },
  { path: '/download/', title: 'ダウンロード', note: '対応する端末とアプリの入手先。' },
  { path: '/faq/', title: 'よくある質問', note: '使い方・料金・対応端末についての質問と回答。' },
  { path: '/manual/', title: 'マニュアル', note: '操作手順の索引。' },
  { path: '/comparison/', title: 'オレンジ版とブルー版の比較', note: '2つの版の違い。' },
  { path: '/contact-us/', title: 'お問い合わせ', note: '問い合わせフォーム。' },
];

const abs = (site: URL, path: string) => new URL(path, site).href;

/** 1行の説明として使えるよう、改行と余分な空白を落とす */
const oneLine = (s: string) => String(s || '').replace(/\s+/g, ' ').trim();

export async function GET(context: APIContext) {
  const site = context.site!;
  const lines: string[] = [];

  lines.push('# ペンギンタイムカード（Penguin Timecard）');
  lines.push('');
  lines.push(
    '> 小さなお店・会社のための勤怠管理アプリ。ICカードや専用の打刻機を用意せず、' +
      '手持ちのiPad・スマートフォン・パソコン・ブラウザで出退勤の打刻から集計まで行える。' +
      '提供は株式会社トランスコミュニカ。月額1,210円（税込）から、1ヶ月の無料お試しあり。'
  );
  lines.push('');
  lines.push(
    'このサイトは日本語で、日本国内の小規模事業者に向けた公式サイトです。' +
      'AI顔認証、深夜割増、複数回休憩、シフト管理、丸め処理（端数処理）などに対応しています。'
  );
  lines.push('');

  // --- 主要ページ
  lines.push('## 主要ページ');
  lines.push('');
  for (const p of KEY_PAGES) {
    lines.push(`- [${p.title}](${abs(site, p.path)}): ${p.note}`);
  }
  lines.push('');

  // --- マニュアル
  const manual = (await getCollection('manual')).sort(
    (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999)
  );
  lines.push('## マニュアル（操作手順）');
  lines.push('');
  for (const cat of MANUAL_CATEGORY_LABELS) {
    const items = manual.filter((m) => m.data.category === cat.key);
    if (items.length === 0) continue;
    lines.push(`### ${cat.label}`);
    lines.push('');
    for (const m of items) {
      const slug = m.id.replace(/\.md$/, '');
      lines.push(`- [${m.data.title}](${abs(site, `/manual/${slug}/`)}): ${oneLine(m.data.description)}`);
    }
    lines.push('');
  }

  // --- お知らせ
  const news = (await getCollection('news')).sort(
    (a, b) => +new Date(b.data.date) - +new Date(a.data.date)
  );
  lines.push('## お知らせ（新機能・リリース・使い方）');
  lines.push('');
  for (const id of NEWS_CATEGORIES) {
    const meta = NEWS_CATEGORY_META[id];
    const items = news.filter(
      (n) => resolveNewsCategory(n.data.newsCategory, n.data.title).id === id
    );
    if (items.length === 0) continue;
    lines.push(`### ${meta.heading}`);
    lines.push('');
    for (const n of items) {
      const date = String(n.data.date).slice(0, 10);
      lines.push(
        `- [${n.data.title}](${abs(site, `/news/${n.data.slug}/`)}) (${date}): ${oneLine(n.data.description)}`
      );
    }
    lines.push('');
  }

  // --- その他
  lines.push('## Optional');
  lines.push('');
  lines.push(`- [お知らせのRSSフィード](${abs(site, '/rss.xml')}): 新着の取得用。`);
  lines.push(`- [サイトマップ](${abs(site, '/sitemap-index.xml')}): 全ページのURL一覧。`);
  lines.push(`- [利用規約](${abs(site, '/terms-of-service/')})`);
  lines.push(`- [プライバシーポリシー](${abs(site, '/privacypolicy/')})`);
  lines.push(`- [特定商取引法に基づく表記](${abs(site, '/commercial-law/')})`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
