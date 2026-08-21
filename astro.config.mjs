// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	// canonical / sitemap / OGP の絶対URL生成に必要な基準URL。
	site: 'https://tc-timecard.com',
	// 内部リンクは全て末尾スラッシュ付きなので、canonical と sitemap を揃える。
	trailingSlash: 'always',
	output: 'static',
	integrations: [sitemap()],
	markdown: {
		remarkRehype: { allowDangerousHtml: true },
		rehypePlugins: [],
	},
});
