# Space-Verse

Space-Verse is a multilingual, community-led map of space science and technology for Vietnamese learners. It brings together field overviews, learning resources, academic-profile guidance, and links to primary sources.

> **Status: beta.** The site is suitable for orientation and exploration. Scientific pages are still being reviewed, and opportunities or news must be verified against the linked official source before use.

## Run locally

Requirements: Node.js 20+ and Python 3.

```sh
npm ci
npm run serve
```

Open `http://127.0.0.1:8000/vi/index.html`. Run the browser checks in another terminal:

```sh
npx playwright install chromium
npm test
```

## News configuration

`assets/news-config.js` is tracked with empty, browser-safe defaults so the live site never requests a missing asset. With empty values, the public news page shows a beta/configuration state instead of silently presenting sample articles as live news. A deployment that connects Supabase may replace only the public project URL and anonymous key. Never put service-role or OpenAI keys in a browser file.

The explicit demonstration view remains available locally at `vi/news.html?demo=1` for layout testing.

## Repository map

- `vi/`, `en/`, `fr/`: public locale pages
- `assets/`: shared styles, scripts, and browser assets
- `image/`: image sources and responsive derivatives
- `tests/`: Playwright smoke, responsive, accessibility, and content-quality checks
- `supabase/`: migrations and Edge Functions for the optional news backend

## Contributions and editorial checks

Use the current repository at <https://github.com/Thithilia/New-Space-Verse> for issues and changes. A public scientific page should identify its scope, use a specific title and description, contain one clear H1, link to primary or authoritative references, and state when it was last reviewed.

## License

No project license has been selected yet. Until the owner explicitly chooses licenses for source code and editorial content, normal copyright restrictions apply. Do not assume that repository access grants permission to redistribute its contents.
