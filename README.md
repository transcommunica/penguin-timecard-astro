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
