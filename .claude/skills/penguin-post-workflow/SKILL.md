---
name: penguin-post-workflow
description: Create Penguin Timecard (ペンギンタイムカード) website posts and manual pages from a Google Sheets posting plan and/or from a described change in the timecard-flutter app, and open a GitHub PR for Cloudflare Pages preview. Use when the user asks to draft or process ペンギンタイムカード news posts, release notes, feature announcements, or manual/usage pages for the penguin-timecard-astro site — including "この機能追加についてお知らせとマニュアルを作って" style requests. Triggered on demand or when told a PR/feature landed in timecard-flutter — NOT on a fixed schedule.
---

# Penguin Post Workflow

## Overview

This workflow turns a planned post (from the Google Sheets posting plan and/or a direct instruction describing a shipped feature) into content in the Astro site `transcommunica/penguin-timecard-astro`, validated with a build, pushed, and opened as a PR so a human can review the Cloudflare Pages preview.

**Never merge the PR or deploy to production.** The correct stopping point is always an open (draft) PR with a passing local build. Merging is Joji's call.

This is an on-demand workflow, not a recurring schedule — run it when asked, or when told a specific PR/feature has landed and needs a post/manual.

## Canonical sources

- Posting-plan spreadsheet: `https://docs.google.com/spreadsheets/d/1FOJSa6zDitNCrbKbqQdULOODr5-KOVLhNRjcYQZECHk/edit` — tab `投稿一覧`.
  Columns (row 1): `投稿タイトル`, `目的`, `ターゲット`, `投稿先`, `投稿予定日`, `本文`, `画像の有無`, `画像URL`, `担当者`, `公開状態`.
  `投稿先` values: `Astro` / `WordPress` / `Instagram` / `LINE`. `公開状態` values: `下書き` / `予約済み` / `公開済み`.
- Site repo: `transcommunica/penguin-timecard-astro` — news in `src/content/news/*.md`, manual pages in `src/content/manual/*.md`, schema in `src/content.config.ts`.
- App repo (source of truth for what actually changed): `transcommunica/timecard-flutter`.

**Known limitation:** only Google Drive *read* tools (`read_file_content`, `search_files`, `download_file_content`) have been available so far — there is no connected tool to write cells back to the spreadsheet. Until a write-capable Sheets tool is connected, do not claim the row was updated; instead tell Joji what row/values to add or update by hand. Re-check with ToolSearch (query like "sheets update values") at the start of a run in case that changes.

## Workflow

### 1. Figure out what this post is about

Two entry points, handle whichever applies:

- **Sheet-driven**: read the `投稿一覧` tab (`mcp__Google-Drive__read_file_content` on the spreadsheet fileId, or `search_files` to relocate it if the ID changed). Find rows with `投稿先 = Astro` and `公開状態 = 下書き`. If none are ready, say so and ask whether to draft a new row (which you'll ask Joji to add, per the write limitation above) or stop.
- **Instruction-driven** ("この機能について投稿とマニュアルを作って", "PRが来たので反映して"): Joji names a feature/change directly. Go straight to step 2 to find the ground truth in `timecard-flutter`, and treat the instruction as the row content (there may be no spreadsheet row for it — that's fine, mention in the PR body that the sheet doesn't have this entry yet).

### 2. Ground the content in the actual change (when it's a feature/manual topic)

Do not invent version numbers, dates, or feature details. Both repos are typically already cloned locally in this environment (check `~` for `timecard-flutter` and `penguin-timecard-astro` before cloning fresh). In `timecard-flutter`:

- `git log --oneline --all --since="<window>" | grep -iE "<keyword>"` or `git log --all --grep="<keyword>" -i` to find the relevant commits/merge.
- For a squashed feature, `git log --oneline --all -- '*<path-fragment>*'` finds the feature branch name; `mcp__github__pull_request_read` (method `get`) on the matching PR number gets the description and any attached screenshot URL.
- `git diff <base-sha> <head-sha> -- lib/l10n/app_ja.arb` is a fast way to see exactly what new user-facing strings/labels were introduced — very useful for accurately describing new UI without reading the whole diff.
- `mcp__github__pull_request_read` with `get_files` on a large PR can exceed the tool's output size; prefer local `git show --stat <merge-sha>` and targeted `grep`/`git diff` on specific files instead of pulling the full remote diff.
- Screenshots: PR-attached images under `github.com/user-attachments/...` generally 403 to a plain `curl` (need an authenticated browser session) — don't spend much time on this. If a real screenshot can't be obtained, say so explicitly in the PR description rather than shipping a placeholder image, and describe the UI in words instead.

### 3. Draft the content

- Tone: practical, clear, appropriate for small-business owners/managers using Penguin Timecard. Japanese by default.
- Choose the target:
  - Release/feature announcements → `src/content/news/*.md`.
  - Usage/how-to documentation → `src/content/manual/*.md`. If the topic already has a manual page (check existing files/itemCodes first), prefer **updating** it with a dated subsection over creating a near-duplicate page.
- Match the existing schema exactly (see `src/content.config.ts`):
  - News frontmatter: `slug`, `title`, `date` (ISO 8601, e.g. `2026-07-26T10:00:00+09:00`), `excerptHtml`, `description`, optional `seoTitle`/`seoDescription`. Body is plain HTML (`<p>`, `<h3>`, `<ul>`) — look at a recently-added, hand-authored post (not an old WordPress import) for the current house style.
  - Manual frontmatter: `title`, `description`, `category` (`overview`/`settings`/`behavior`/`billing`), `itemCode` (sequential per category prefix, e.g. next unused `S.xx`), `keywords`, `isNew`, `popular`, `order`. Body is Markdown.
- Link between them where natural (news post links to the relevant `/manual/<slug>/` page).

### 4. Branch, build, commit

- Check the current git branch first (`git status`/`git branch`). If this session was started with a specific designated branch for this repo (common when launched from a scheduled/assigned task), commit there — do not create or push to a different branch without explicit permission. Otherwise create `agent/{short-description}` from `main`.
- `npm install` only if `node_modules` is missing.
- `npm run build` and confirm it completes without errors, and that the expected new page paths appear in the build output.
- `git status` after the build — `npm install` can rewrite `package-lock.json` with unrelated churn (e.g. lockfile-version-driven diffs). Stage only the content files you intended to change; `git checkout -- package-lock.json` if it picked up incidental noise.
- Commit with a message describing *why* (what shipped, not just "add post").

### 5. Push and open a PR

- `git push -u origin <branch>`.
- Check for a PR template (`.github/PULL_REQUEST_TEMPLATE.md` etc.) before writing the body; none currently exists in this repo.
- Open a **draft** PR against `main` (`mcp__github__create_pull_request`, `draft: true`) unless Joji asked otherwise. In the body, include: what changed, what it's based on (link the source PR/commit in timecard-flutter if applicable), any limitations (no screenshot, spreadsheet not updated, etc.), and the page path(s) to check in the Cloudflare Pages preview.
- Do not merge. Do not mark the spreadsheet row `公開済み` even if you could write to it — that status is Joji's call after reviewing the preview.

### 6. Report back

Summarize: PR URL, files changed, build result, page paths to review, and anything you couldn't do (screenshot, spreadsheet write) so Joji knows what's still manual.

## Known Good Test

- PR: `https://github.com/transcommunica/penguin-timecard-astro/pull/9` (test-only automation check)
- PR: `https://github.com/transcommunica/penguin-timecard-astro/pull/10` (first real run: staff-category/カテゴリー編集画面 redesign — news post + manual update, sourced from `timecard-flutter` PR #1174)

Use these as shape references, not as content to duplicate.
