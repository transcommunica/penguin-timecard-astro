// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	markdown: {
		remarkRehype: { allowDangerousHtml: true },
		rehypePlugins: [],
	},
});
