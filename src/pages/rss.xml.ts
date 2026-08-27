import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

/**
 * お知らせのRSSフィード。
 *
 * これまでフィードが一切なく、新着の発見経路がサイトマップだけだった。
 * フィードはアグリゲータや監視ツールが実際に読む枠組みなので、
 * llms.txt よりも確実な導線になる。
 */
export async function GET(context: APIContext) {
  const posts = (await getCollection('news')).sort(
    (a, b) => +new Date(b.data.date) - +new Date(a.data.date)
  );

  return rss({
    title: 'お知らせ | ペンギンタイムカード',
    description:
      'ペンギンタイムカードの新機能・リリース情報・使い方の記事をお届けします。',
    site: context.site!,
    trailingSlash: true,
    customData: '<language>ja</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      // description は要約。フロントマターを整えたのでそのまま使える。
      description: post.data.description,
      pubDate: new Date(post.data.date),
      link: `/news/${post.data.slug}/`,
    })),
  });
}
