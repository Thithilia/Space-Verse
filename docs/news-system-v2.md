# Space-Verse News System V2

## What V2 adds

- Public news pages can render clearly labeled demo articles only with `?demo=1`.
- Supabase migration and Edge Functions remain the production path.
- GitHub Actions runs Playwright tests on pushes and pull requests.
- A scheduled workflow syncs sources and generates up to 10 drafts daily when required secrets are present; an authorized editor must publish them.

## Browser config

`assets/news-config.js` is tracked with empty, safe defaults. For a deployment connected to Supabase, fill only:

```js
window.SpaceVerseNewsConfig = window.SpaceVerseNewsConfig || {
  supabaseUrl: "https://YOUR_PROJECT_ID.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
  demoMode: false
};
```

Use `vi/news.html?demo=1` while testing the layout without a backend. `demoMode` is retained for configuration compatibility but does not expose demo content on ordinary public URLs.

## Supabase setup

1. Apply all migrations in `supabase/migrations` in filename order.
2. Deploy the three functions in `supabase/functions`.
3. Set secrets from `supabase/.env.example`, including `NEWS_FUNCTION_SECRET`.
4. Sign in once through `vi/admin/news.html`.
5. Add that user to `admin_profiles` from a trusted owner-only channel such as Supabase SQL Editor. Keep the enrollment SQL out of browser JavaScript and public admin UI.

## Local deploy and check

The repo includes PowerShell helpers for the news functions. They do not contain secrets.

```powershell
npm run news:functions:deploy
```

This command requires Supabase CLI auth from either `supabase login` or a local `SUPABASE_ACCESS_TOKEN` environment variable.

After deployment and secret setup, check the function endpoints with:

```powershell
$env:SUPABASE_ANON_KEY = "your-public-anon-key"
$env:NEWS_FUNCTION_SECRET = "your-rotated-secret"
npm run news:pipeline:check
```

If the check returns `404`, the Edge Functions are not deployed for this Supabase project. If it returns an authorization error, `SUPABASE_ANON_KEY` or `NEWS_FUNCTION_SECRET` does not match the value set in Supabase.

## Public vs admin access

- `vi/news.html` is public and only reads the 10 newest `news_articles` rows where `status = 'published'`.
- `vi/admin/news.html` requires Supabase Auth plus an `admin_profiles` row for the signed-in user.
- If an authenticated user is not in `admin_profiles`, draft rows remain hidden by row-level security.
- If `is_news_admin()` returns `true` but the admin dashboard still sees `0` `news_articles` rows, apply `supabase/migrations/202605160002_fix_news_admin_article_policies.sql` in Supabase SQL Editor. That migration separates public published reads from admin draft reads and avoids relying on a broad `FOR ALL` policy for dashboard SELECTs.

## Security notes

- `assets/news-config.js` must contain only the public Supabase URL and anon key.
- Never place `SUPABASE_SERVICE_ROLE_KEY` in browser JavaScript, HTML, docs meant for deployment, or committed config files.
- Use the service-role key only from trusted environments such as Supabase Edge Functions, GitHub Actions secrets, or one-off local admin scripts.
- Edge Functions must require `POST`, a valid Supabase JWT, and `x-spaceverse-secret`.
- Keep `NEWS_ALLOWED_ORIGINS` scoped to production and local preview origins; do not use `*`.
- `_headers` provides CSP and browser hardening headers for static hosts that support it. GitHub Pages does not apply `_headers`, so the HTML files also include a CSP meta tag as a fallback.

## Daily automation

The workflow `.github/workflows/news-pipeline.yml` runs at 17:15 UTC, which is 00:15 in Vietnam, and calls:

- `sync-news`
- `draft-news?limit=10`

It skips safely when `SUPABASE_URL`, `SUPABASE_ANON_KEY`, or `NEWS_FUNCTION_SECRET` is not configured.

The scheduled request creates drafts and does not replace published rows. A news admin reviews source attribution, wording, image credit, and factual accuracy before publishing each item.

## Review policy

The daily pipeline never auto-publishes. Only an authorized admin may move a reviewed draft to `published`. Published briefs must keep source URL, date, field, and image credit.
