import { imageSize } from 'image-size';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';

/**
 * Markdown 本文の <img> に width / height / loading / decoding を補う rehype プラグイン。
 *
 * Markdown 記法（![alt](src)）では属性を書けないため、本文の画像は寸法を持たず、
 * 読み込みのたびにレイアウトシフト（CLS）が発生していた。
 * public/ 配下の実ファイルからビルド時に寸法を読み取って埋める。
 *
 * すでに width/height を持つ画像（WordPress から引き継いだ <img> など）はそのまま。
 */
const PUBLIC_DIR = path.resolve('public');

/** 同じ画像を何度も stat しないためのキャッシュ */
const sizeCache = new Map();

const getSize = (src) => {
  if (sizeCache.has(src)) return sizeCache.get(src);

  let size = null;
  // 対象はサイト内の絶対パスのみ（外部URL・data: は対象外）
  if (src.startsWith('/') && !src.startsWith('//')) {
    const filePath = path.join(PUBLIC_DIR, decodeURIComponent(src.split('?')[0]));
    // public/ の外に出るパスは読まない
    if (filePath.startsWith(PUBLIC_DIR + path.sep)) {
      try {
        const { width, height } = imageSize(readFileSync(filePath));
        if (width && height) size = { width, height };
      } catch {
        size = null;
      }
    }
  }

  sizeCache.set(src, size);
  return size;
};

export default function rehypeLocalImageAttrs() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;

      const props = node.properties ?? (node.properties = {});
      const src = typeof props.src === 'string' ? props.src : '';
      if (!src) return;

      if (props.width == null && props.height == null) {
        const size = getSize(src);
        if (size) {
          props.width = size.width;
          props.height = size.height;
        }
      }

      if (props.loading == null) props.loading = 'lazy';
      if (props.decoding == null) props.decoding = 'async';
    });
  };
}
