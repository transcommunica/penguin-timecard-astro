// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeLocalImageAttrs from './src/plugins/rehype-local-image-attrs.mjs';
import { sitemapLastmod } from './src/lib/sitemap-lastmod.mjs';

// https://astro.build/config
export default defineConfig({
	// canonical / sitemap / OGP の絶対URL生成に必要な基準URL。
	site: 'https://tc-timecard.com',
	// 内部リンクは全て末尾スラッシュ付きなので、canonical と sitemap を揃える。
	trailingSlash: 'always',
	output: 'static',
	integrations: [
		sitemap({
			// 404 は noindex なのでサイトマップに載せない。
			filter: (page) => !page.includes('/404'),
			// 鮮度シグナル。以前は全85URLに lastmod が無かった。
			// 日付は git 履歴から取るので、実際に変更した日だけが入る。
			serialize: (item) => {
				const lastmod = sitemapLastmod(item.url);
				return lastmod ? { ...item, lastmod } : item;
			},
		}),
	],
	markdown: {
		remarkRehype: { allowDangerousHtml: true },
		// Markdown本文の画像に width/height/loading を補い、レイアウトシフトを防ぐ。
		rehypePlugins: [rehypeLocalImageAttrs],
	},
});
