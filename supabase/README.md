# Space-Verse News Backend

This folder contains the Supabase backend for the Space-Verse news workflow.

## Required secrets

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` optional, defaults to `gpt-5-mini`
- `NEWS_FUNCTION_SECRET` required for scheduled calls
- `NEWS_ALLOWED_ORIGINS` optional comma-separated browser origins for CORS, defaults to the GitHub Pages origin plus local preview origins
- `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BASE_BRANCH` optional for static HTML export

The browser frontend uses `assets/news-config.js` with the public Supabase URL and anon key.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to browser code. Keep it only in trusted server-side environments, Supabase Edge Function secrets, GitHub Actions secrets, or one-off local admin scripts.

## Deploy outline

1. Apply all migrations in `supabase/migrations` in filename order.
2. Ask each admin to sign in once through `vi/admin/news.html` so Supabase creates the user in `auth.users`.
3. Add admin users to `admin_profiles` from a trusted owner-only channel such as Supabase SQL Editor. Do not expose the enrollment SQL in browser code.

4. Deploy Edge Functions:
   - `sync-news`
   - `draft-news`
   - `export-static-news`
5. Schedule daily calls in Supabase or another trusted scheduler:
   - `sync-news`
   - `draft-news`
   - `export-static-news` only if static export is enabled

## Local deploy helper

From the repository root:

```powershell
npm run news:functions:deploy
```

This wraps:

```powershell
npx --yes supabase@2.98.2 functions deploy sync-news --project-ref ktahawkoxwcdjrhkpgxv
npx --yes supabase@2.98.2 functions deploy draft-news --project-ref ktahawkoxwcdjrhkpgxv
npx --yes supabase@2.98.2 functions deploy export-static-news --project-ref ktahawkoxwcdjrhkpgxv
```

The command requires Supabase CLI authentication. Run `supabase login` first, or set `SUPABASE_ACCESS_TOKEN` in your local shell. Do not commit tokens or service-role keys.

After deployment and secret setup:

```powershell
$env:SUPABASE_ANON_KEY = "your-public-anon-key"
$env:NEWS_FUNCTION_SECRET = "your-rotated-secret"
npm run news:pipeline:check
```

The functions are configured with JWT verification and also require `x-spaceverse-secret`, so scheduled callers must send both the public anon key as `Authorization: Bearer ...` and the private scheduler secret.

Static hosts that support `_headers` should serve the repository-level security headers. GitHub Pages does not apply `_headers`, so the HTML files include a CSP meta tag as a fallback.

## Admin dashboard sees zero rows

If `vi/admin/news.html` shows an authenticated admin session and `is_news_admin() = true`, but `news_articles` counts are still zero, apply:

```text
supabase/migrations/202605160002_fix_news_admin_article_policies.sql
```

This splits `news_articles` row-level security into explicit public SELECT, admin SELECT, INSERT, UPDATE, and DELETE policies.

## Content policy

The automation drafts short Vietnamese briefs. It must not copy or translate long source passages. Each published article should preserve source URL, source date, image credit, and field tags.
