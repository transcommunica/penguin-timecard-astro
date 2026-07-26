---
name: penguin-post-workflow
description: Draft Penguin Timecard (ペンギンタイムカード) promo-site posts and manual pages from the Google Sheets posting plan, and open a GitHub PR against transcommunica/penguin-timecard-astro for Cloudflare Pages preview. Use when asked to write a news post, release note, feature announcement, or manual page for ペンギンタイムカード, or to process a row in the 投稿一覧 posting-plan spreadsheet. Also use when told a feature shipped in transcommunica/timecard-flutter and the site needs an announcement and/or manual update — trigger fires on explicit request or on a new/merged PR being pointed out, never on a recurring schedule.
---

# Penguin Post Workflow

Turns a one-line instruction ("この機能をお知らせにして", "このPRの内容をマニュアルにして") into a reviewable PR on the Astro promo site. This is on-demand automation, not a cron job: only run it when the user explicitly asks, or points at a specific completed change (PR, feature, spreadsheet row). Never schedule it to run weekly/daily on its own.

The stopping point is always a PR with a Cloudflare Pages preview link. **Never merge the PR or mark a spreadsheet row as `公開済み`** — that decision is the human's.

## Canonical targets

- Posting-plan spreadsheet: `https://docs.google.com/spreadsheets/d/1FOJSa6zDitNCrbKbqQdULOODr5-KOVLhNRjcYQZECHk/edit` — tab `投稿一覧`. Read it with the Google Drive MCP tool (`read_file_content` on that file ID). There is currently no reliable spreadsheet *write* tool available — do not try to overwrite the whole file via Drive's `create_file` (it would destroy the sheet). Instead, paste the final draft's title/body back to the user in chat and ask them to fill in the row (columns below) and flip `公開状態` themselves.
- Site repo: `transcommunica/penguin-timecard-astro` (Astro, default branch `main`).
  - News posts: `src/content/news/*.md`
  - Manual pages: `src/content/manual/*.md`
  - Images: `public/assets/manual/YYYY/MM/*.png`, referenced from markdown as `/assets/manual/YYYY/MM/name.png`
  - Schema is defined in `src/content.config.ts` — read it fresh each run in case it changes. As of writing:
    - `manual`: `title` (string), `description` (string), `category` (enum: `overview`|`settings`|`behavior`|`billing`), `itemCode` (string, e.g. `S.03` — keep existing codes stable, only add new codes for genuinely new pages), `keywords` (string array), `isNew` (bool), `popular` (bool), `order` (number).
    - `news`: `slug` (string), `title` (string), `date` (ISO string), `excerptHtml` (string), `description` (string), optional `seoTitle`/`seoDescription`.
  - `scripts/gen-*-content.mjs` and `scripts/sync-wp-manual-images.mjs` are one-time legacy WordPress-import tools — ignore them; add new content by hand-authoring markdown files directly.
- App repo (read-only reference): `transcommunica/timecard-flutter`. Use its merged PRs/commits to find out exactly what shipped — never invent version numbers, feature names, or behavior. If a PR description is ambiguous, read the actual diff (`pull_request_read` with `get_files`/`get_diff`) rather than guessing from the title.
- Live demo app for screenshots: `https://penguin-timecard.web.app/`. Credentials are provided by the user per-session (do not hardcode or store them in this file or in committed content) — ask for a demo login if one hasn't been shared yet.

## Spreadsheet columns (row 1 headers, tab `投稿一覧`)

1. `投稿タイトル` 2. `目的` 3. `ターゲット` 4. `投稿先` (`Astro`/`WordPress`/`Instagram`/`LINE`) 5. `投稿予定日` 6. `本文` 7. `画像の有無` (bool) 8. `画像URL` 9. `担当者` 10. `公開状態` (`下書き`/`予約済み`/`公開済み`)

Select rows where `投稿先` = `Astro` and `公開状態` needs work (usually `下書き`). If no row is ready and the user hasn't described the content directly, ask whether to draft a new row or stop.

## Workflow

1. **Source the facts.** Either from a spreadsheet row, or from a timecard-flutter PR/commit the user points at (read the real diff), or both.
2. **Pick content type.** Release/feature announcements → `src/content/news/`. Usage/how-to docs → `src/content/manual/` (new file, or a new section appended to an existing page if the change extends something already documented there — e.g. redesigned tooltips on a screen that already has a manual page). Ask the user if it's genuinely unclear.
3. **Get screenshots when a manual page needs them.** Log into `https://penguin-timecard.web.app/` with Playwright (`/opt/pw-browsers/chromium`, headless; do not run `playwright install` — it's pre-installed), navigate to the relevant screen, and capture 2–4 focused PNGs (not full-page dumps of unrelated UI). Save under `public/assets/manual/<year>/<month>/`, following the short-name convention already in use (`r1.png`, `r2.png`, …).
4. **Write the content.** Japanese by default, practical/plain tone for small-business admins. Match the frontmatter schema exactly (re-read `src/content.config.ts` if unsure). Match the HTML-in-markdown style of existing news posts for the body (e.g. `<p>` paragraphs, a `wp-block-buttons` style CTA linking to the relevant manual page) and the screenshot-plus-bullet style of existing manual pages. Soft CTA, no invented facts.
5. **Branch.** If the session has already been assigned a specific branch name for this work, use that. Otherwise create `agent/{short-description}` off `main`.
6. **Commit only the intended files** — the new/updated markdown, any new screenshots. No unrelated formatting churn, no regenerating unrelated content via the legacy scripts.
7. **Validate.** `npm install` only if `node_modules` is missing, then `npm run build` must pass before opening the PR.
8. **Open a draft PR** against `main` (owner `transcommunica`, repo `penguin-timecard-astro`). Body: what changed and why, which timecard-flutter PR/commit it's based on, files touched, build result, and the page path(s) to review (`/news/<slug>/`, `/manual/<slug>/`). Do not merge — Cloudflare Pages will auto-build a preview channel for the human to check.
9. **Report back**: PR URL, branch, changed files, build pass/fail, and the spreadsheet draft text (title + body) for the user to paste into the sheet themselves, since this workflow cannot write to the spreadsheet.

## Guardrails

- Never merge PRs, never deploy production, never mark a spreadsheet row `公開済み` — human approval is the gate, always.
- Never invent release details (version numbers, dates, features, fixes) not present in the actual source diff or the user's description.
- Never commit demo credentials, API keys, or other secrets into repo content.
- Keep changes scoped to the one post/manual page asked for — don't refactor unrelated content collection files.
