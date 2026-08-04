---
name: penguin-instagram-post
description: Design and publish an Instagram post for @penguin_time_web (Penguin Timecard / ペンギンタイムカード), via the Cloudflare Pages relay in transcommunica/penguin-timecard-astro. Use when asked to post something to Instagram for ペンギンタイムカード, to announce a shipped timecard-flutter feature there, or to run this as a recurring posting routine. Never publish without a fresh, explicit human approval in the current session — approval from a previous session or a different post does not carry over.
---

# Penguin Instagram Post

Turns a topic/announcement into an approved, published Instagram post for `@penguin_time_web`, using a Cloudflare Pages Functions relay so the Meta access token never has to enter this session or chat.

## Why a relay instead of calling Meta directly

- Instagram Graph API's `/media` endpoint only accepts a public `image_url` it fetches — no raw file upload. The image must be hosted somewhere reachable over HTTPS before you can post it.
- This session's own outbound network access is restricted by an organization egress policy. It may not include `graph.facebook.com` or `*.pages.dev` by default. If a call to either 403s at the proxy layer, that is a policy allowlist issue, not a bug — tell the user to check/extend their environment's network policy (see `/root/.ccr/README.md`'s "403/407 from the proxy" section) rather than trying to route around it.
- Even when network access works, the long-lived Meta Page access token should never be pasted into this chat. A small relay already exists in this repo as Cloudflare Pages Functions, holding that token as a Cloudflare-only secret.

## Architecture

- **IG account**: `@penguin_time_web`, IG User ID `17841433864437754`
- **Facebook Page**: 「ペンギンタイムカード&システム」, Page ID `106399561098023`
- **Meta app**: 「ペンギンタイムカード」(developers.facebook.com)
- **Relay** (this repo, `functions/api/`): deployed automatically by the existing `deploy-pages.yml` workflow (Cloudflare Pages Functions, no separate Worker needed).
  - Production base URL (stable, always use this for the API calls): `https://penguin-timecard-astro.pages.dev`
  - `POST /api/ig-create` — body `{ "image_url": "...", "caption": "..." }` → `{ "creation_id": "..." }`
  - `POST /api/ig-publish` — body `{ "creation_id": "..." }` → `{ "success": true, "media_id": "..." }`
  - `GET /api/ig-check?media_id=...` (omit the query param to list the account's recent media instead) → raw Graph API fields (`permalink`, `timestamp`, `caption`, ...) — use this to actually confirm a post exists; a 200 from `/api/ig-publish` alone was not enough evidence the first time this was done.
  - All three require header `x-api-key: <RELAY_API_KEY>`.
- **Secrets** live only in the Cloudflare Pages project's environment variables (`Production` **and** `Preview`, both must be kept in sync): `IG_ACCESS_TOKEN` (long-lived Page access token), `IG_USER_ID`, `RELAY_API_KEY`. **This repository is public** — never write any of these three values into a file that gets committed, including this skill file.

## Getting `RELAY_API_KEY`

Ask the user for it at the start of any session that needs to post (they keep it outside the repo, e.g. a password manager). If they've lost it, they can view/reset it in the Cloudflare dashboard under the Pages project → Settings → Environment variables, for both Production and Preview.

If `IG_ACCESS_TOKEN` itself has expired (Graph API calls start failing with an auth error), tell the user it needs refreshing — walk them through Graph API Explorer by hand (see "Token refresh" below) rather than trying to automate the OAuth flow yourself.

## Step-by-step: publishing a new post

1. **Gather the message.** Get the topic from the user, or from a shipped `timecard-flutter` PR/commit if asked to publicize a feature — read the actual diff, never invent version numbers or behavior (same rule as the `penguin-post-workflow` skill).
2. **Design the image(s).** 1080×1080 canvas.
   - Brand palette: cream `#FFF8EE` / `#FBEFDB`, ink `#2A2520` / `#6B5E52`, orange `#F39A2D` / `#E27D17` / tint `#FFE3BF`, accents sky `#7BC8E8` and leaf `#6FBF73`.
   - Font: `NotoSansJP-{Bold,Medium,Regular}.otf` from the sibling `timecard-flutter` repo's `assets/fonts/` (read from there if that checkout is available in this session; otherwise ask the user for the files or fall back to a system CJK font).
   - Mascot art: prefer real assets over hand-drawing a penguin from scratch.
     - Small pose set already in `timecard-flutter/assets/images/`: `penguin.png` (idle), `penguin-new.png`, `penguin-left1/2.png`, `penguin-right1/2.png` (walking/running), `penguin-paws.png` (footprint icon).
     - Higher-resolution, more expressive poses (waving, celebrating, a "professor with pointer" explainer pose, reading) have existed in a Cloudflare R2 bucket / Google Drive folder the user shared in a prior session — ask the user for the current link if today's post calls for one of those instead of the small set.
   - Compose with Python + Pillow (`pip install Pillow` if missing): soft brand-colored circles for background texture, a rounded pill badge for the headline, the mascot bottom-anchored and centered, brand-colored caption text below. Render at final size and look at it (Read the PNG, or send it with SendUserFile) before treating it as done — don't ship a layout you haven't actually viewed.
   - If the Read tool rejects viewing a freshly generated image (this has happened as a transient issue before), retry once; if it persists, re-encode with Pillow (`Image.open(...).convert('RGBA').save(...)`) and retry, or fall back to sending it to the user via `SendUserFile` for their own visual check.
3. **Draft the caption.** Japanese, warm/plain tone for small-business admins (clinics, salons, restaurants, small offices — the actual target audience). Check `GET /api/ig-check` (no query param) for real recent captions/hashtags to match existing style and hashtag set rather than inventing a new one each time.
4. **Show the user the image + full caption text and get explicit approval before doing anything else.** Mandatory every single time. Approval of a similar post previously, or of the general plan, is not approval to publish this one.
5. **Host the image.**
   - Restart this skill's working branch from the current `main` if the last PR from it was already merged (a merged PR is finished, never stack new commits on old merged history — `git fetch origin main && git checkout -B <branch> origin/main`).
   - Add the final PNG under `public/assets/instagram/<slug>.png`, commit, push.
   - Open a **draft PR** against `main` (never merge it yourself — see Guardrails).
   - Wait for the `deploy-preview` GitHub Actions job on that PR to finish (poll via the GitHub MCP tools, or a Monitor loop curling the GitHub API with `$GITHUB_TOKEN`) before assuming the URL is live.
   - **Pitfall seen before**: if you ever re-run a workflow run to pick up a later change (e.g. after the user updates a Cloudflare env var), make sure you re-run the run for the *current* commit — re-running an older cached `run_id` redeploys stale code and silently overwrites a newer deployment. Cross-check `head_sha` first.
   - Resulting image URL: `https://pr-<N>.penguin-timecard-astro.pages.dev/assets/instagram/<slug>.png`. This is fine as `image_url` even though it's only a preview — Meta fetches it once, at container-creation time, and keeps its own copy after that.
6. **Create the container**: `POST https://penguin-timecard-astro.pages.dev/api/ig-create` (always the production relay URL, regardless of where the image itself lives) with `x-api-key` and the JSON body above. Report the returned `creation_id`.
7. **Pause for a second, explicit confirmation before publishing** — restate exactly what's about to go live (the image, the full caption) and ask outright. This is a distinct checkpoint from step 4's content approval.
8. **Publish**: `POST .../api/ig-publish` with `{"creation_id": "..."}`. Report the returned `media_id`.
9. **Verify**: `GET .../api/ig-check?media_id=<id>` and hand the user the real `permalink` from the response. Don't stop at a 200 from step 8 — confirm the post actually exists with real data.
10. **Leave the draft PR open.** The human merges it whenever they like, or not at all — the published Instagram post doesn't depend on the PR staying open or ever being merged.

## Guardrails

- Never publish (step 8) without a same-session, explicit go-ahead at step 7 — separate from the content approval at step 4.
- Never merge a PR or push to `main` directly. `main` is branch-protected and the human merges deliberately.
- Never write `RELAY_API_KEY`, `IG_ACCESS_TOKEN`, or the Meta App Secret into any file that gets committed — this repo is public.
- Never invent captions or feature claims not confirmed by the user or a real `timecard-flutter` diff.
- If outbound calls to `*.pages.dev` or `graph.facebook.com` 403 at the proxy, report it as a network-policy allowlist gap — don't try to work around it.

## Token refresh (if `IG_ACCESS_TOKEN` starts failing)

The current token was obtained by hand, in the user's own browser, via:

1. Graph API Explorer → generate a **User** access token with scopes `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, making sure the page-selection consent step actually grants access to page ID `106399561098023` (easy to accidentally skip).
2. `GET 106399561098023?fields=access_token` with that user token → a short-lived **Page** access token.
3. Exchange it for a long-lived one: `GET https://graph.facebook.com/v26.0/oauth/access_token?grant_type=fb_exchange_token&client_id=<APP_ID>&client_secret=<APP_SECRET>&fb_exchange_token=<PAGE_TOKEN>`, run by the user directly in their browser — never ask them to paste the Meta App Secret into chat.
4. The resulting `access_token` is the new `IG_ACCESS_TOKEN` — the user updates it in Cloudflare Pages env vars (Production and Preview).

Once the org's Meta Business verification clears, prefer switching to a Business Manager **System User** token instead (can be set to never expire, isn't tied to a personal login) — check whether system-user creation is still blocked ("この操作は一時的にブロックされています") before suggesting it again.
