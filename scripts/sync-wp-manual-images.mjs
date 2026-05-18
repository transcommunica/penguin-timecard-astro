import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_URL = 'https://tc-timecard.com/wp-json/wp/v2/pages?parent=2887&per_page=100';
const UPLOAD_BASE = 'https://tc-timecard.com/wp-content/uploads/';
const OUTPUT_BASE = path.resolve('public/assets/manual');

const extractUrls = (html) => {
  const matched = html.match(/https?:\/\/[^"'\s)]+/g) || [];
  return matched.filter((url) => url.startsWith(UPLOAD_BASE));
};

const normalizeRelativePath = (url) => {
  const relative = url.slice(UPLOAD_BASE.length).split('?')[0];
  return relative;
};

const download = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download: ${url} (${res.status})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer;
};

const main = async () => {
  const res = await fetch(API_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed to fetch pages: ${res.status}`);
  }

  const pages = await res.json();
  if (!Array.isArray(pages)) {
    throw new Error('API response is not an array');
  }

  const urlSet = new Set();
  for (const page of pages) {
    const content = typeof page?.content?.rendered === 'string' ? page.content.rendered : '';
    const excerpt = typeof page?.excerpt?.rendered === 'string' ? page.excerpt.rendered : '';

    for (const url of extractUrls(content)) {
      urlSet.add(url);
    }
    for (const url of extractUrls(excerpt)) {
      urlSet.add(url);
    }
  }

  const urls = [...urlSet];
  let okCount = 0;
  let ngCount = 0;

  for (const url of urls) {
    const relativePath = normalizeRelativePath(url);
    const destPath = path.join(OUTPUT_BASE, relativePath);

    try {
      await mkdir(path.dirname(destPath), { recursive: true });
      const data = await download(url);
      await writeFile(destPath, data);
      okCount += 1;
      console.log(`saved: ${relativePath}`);
    } catch (error) {
      ngCount += 1;
      console.warn(`failed: ${relativePath}`);
      console.warn(String(error));
    }
  }

  console.log(`done: success=${okCount}, failed=${ngCount}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
