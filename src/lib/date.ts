/**
 * 日付の表示と機械可読化のための共通ヘルパー。
 *
 * 以前は formatDate が news.astro と news/[...slug].astro に同じ実装で
 * 重複していた。表示形式を変えるときに片方だけ直る事故を避けるため、
 * ここに一本化している。
 */

/** 表示用（2024.03.01）。解釈できない文字列はそのまま返す。 */
export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

/**
 * <time datetime> と構造化データ用のISO文字列。
 * 解釈できない場合は undefined を返すので、属性自体を出さない判断ができる。
 */
export const toIsoDate = (dateStr: string | null | undefined): string | undefined => {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};
