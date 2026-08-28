# Penguin Timecard Astro

このリポジトリは Astro の static 出力を Cloudflare Pages にデプロイする構成です。

## 開発コマンド

| Command | Action |
| :-- | :-- |
| `npm install` | 依存パッケージをインストール |
| `npm run dev` | ローカル開発サーバー起動 |
| `npm run build` | 静的サイトを `dist/` にビルド |
| `npm run preview` | ビルド済み静的サイトをローカル確認 |

## デプロイ方式

- Cloudflare Pages で Git 連携デプロイを利用します。
- PR 作成時: Preview Deployment
- `main` 反映時: Production Deployment

Build command と Output directory は以下を指定してください。

- Build command: `npm run build`
- Build output directory: `dist`

## お問い合わせフォーム

- フロントの送信先は `/api/contact` のままです。
- 実処理は Cloudflare Pages Functions の [functions/api/contact.ts](functions/api/contact.ts) が担当します。
- メール送信は Resend API を使います（Pages Functions 内でサーバーサイド送信）。

### Cloudflare Pages 側で必要な設定

Environment Variables:

- `RESEND_API_KEY`
	- Resend API キー
	- 例: `re_xxxxxxxxxxxxxxxxxxxxx`
- `CONTACT_FROM_EMAIL`
	- Resendで認証済みの送信元メールアドレス
	- 例: `noreply@example.com`
- `CONTACT_TO_EMAIL`
	- 管理者通知先メールアドレス
	- 複数指定する場合はカンマ区切り
	- 例: `info@example.com,ops@example.com`

### ローカル用 `.env`

`.env.example` を参考に `.env` を作成してください。

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
CONTACT_FROM_EMAIL=noreply@example.com
CONTACT_TO_EMAIL=info@example.com,ops@example.com
```

## Instagram投稿 中継API（@penguin_timecard）

- Instagram Graph APIへの投稿を代行するエンドポイントです。長期アクセストークンはこのリポジトリには一切含まれず、Cloudflare Pages側のシークレットとしてのみ保持されます（**本リポジトリはpublicのため**）。
- 実処理は Cloudflare Pages Functions の以下が担当します。
  - [functions/api/ig-create.ts](functions/api/ig-create.ts) — メディアコンテナ作成
  - [functions/api/ig-publish.ts](functions/api/ig-publish.ts) — 投稿の公開
  - [functions/api/ig-check.ts](functions/api/ig-check.ts) — 投稿状態の確認（読み取り専用）
- 呼び出しには `x-api-key` ヘッダーで `RELAY_API_KEY` の値を渡す必要があります。
- 運用手順の詳細は `.claude/skills/penguin-instagram-post/SKILL.md` を参照してください。

### Cloudflare Pages 側で必要な設定

Environment Variables（**Production と Preview の両方**に設定してください）:

- `IG_ACCESS_TOKEN`
	- Instagram/Facebookページの長期アクセストークン
	- Encrypt（シークレット）指定
- `IG_USER_ID`
	- 投稿先のInstagramビジネスアカウントID
- `RELAY_API_KEY`
	- 上記2エンドポイントを呼び出す際の合言葉（ランダムな文字列）
	- Encrypt推奨
