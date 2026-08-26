/**
 * お知らせのカテゴリ定義。
 *
 * 以前はタイトルの正規表現から「修正 / 新機能 / 更新」を推測していたが、
 * 36件中34件が「更新」に偏り、索引として機能していなかった。
 * フロントマターの newsCategory を正とし、未設定のものだけ推測にフォールバックする。
 */
export const NEWS_CATEGORIES = ['release', 'feature', 'guide'] as const;

export type NewsCategoryId = (typeof NEWS_CATEGORIES)[number];

export type NewsCategoryMeta = {
  id: NewsCategoryId;
  /** 一覧のタグに出す短いラベル */
  label: string;
  /** タグの色クラス */
  cls: 't-update' | 't-feature' | 't-fix';
  /** 索引ページの見出し */
  heading: string;
  /** 索引ページの <title> */
  title: string;
  /** 索引ページの meta description */
  description: string;
  /** 索引ページのリード文 */
  lead: string;
};

export const NEWS_CATEGORY_META: Record<NewsCategoryId, NewsCategoryMeta> = {
  release: {
    id: 'release',
    label: 'リリース',
    cls: 't-update',
    heading: 'リリース情報',
    title: 'リリース情報 - 【公式】ペンギンタイムカード',
    description:
      'ペンギンタイムカードのバージョンアップ・リリース情報の一覧です。各バージョンで追加された機能や変更点をご確認いただけます。',
    lead: 'バージョンアップの履歴です。各リリースで何が変わったかをまとめています。',
  },
  feature: {
    id: 'feature',
    label: '新機能',
    cls: 't-feature',
    heading: '新機能・改善',
    title: '新機能・改善のお知らせ - 【公式】ペンギンタイムカード',
    description:
      'ペンギンタイムカードに追加された新機能と、改善・不具合修正のお知らせ一覧です。深夜勤務、複数回休憩、24時間営業などの対応状況をご確認いただけます。',
    lead: '新しく使えるようになった機能と、改善・修正のお知らせです。',
  },
  guide: {
    id: 'guide',
    label: '使い方',
    cls: 't-fix',
    heading: '使い方・お役立ち',
    title: '使い方・お役立ち情報 - 【公式】ペンギンタイムカード',
    description:
      'ペンギンタイムカードの使い方や勤怠管理の考え方をまとめた記事の一覧です。打刻・時間の修正・残業や休日勤務の計算方法などを解説しています。',
    lead: '打刻や集計の具体的な手順、勤怠管理の考え方をまとめた記事です。',
  },
};

export const isNewsCategoryId = (value: unknown): value is NewsCategoryId =>
  typeof value === 'string' && (NEWS_CATEGORIES as readonly string[]).includes(value);

/** newsCategory 未設定の記事のためのフォールバック（旧ロジック相当） */
export const guessNewsCategory = (title: string): NewsCategoryId => {
  if (/バージョン|リリース/.test(title)) return 'release';
  if (/対応しました|できるようになりました|不具合|修正|わかりやすく/.test(title)) return 'feature';
  return 'guide';
};

export const resolveNewsCategory = (
  frontmatterCategory: unknown,
  title: string
): NewsCategoryMeta =>
  NEWS_CATEGORY_META[
    isNewsCategoryId(frontmatterCategory) ? frontmatterCategory : guessNewsCategory(title)
  ];

export const newsCategoryHref = (id: NewsCategoryId) => `/news/category/${id}/`;
