import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

test.describe("news backend artifacts", () => {
  test("migration defines dedupe, admin profiles, and public published-only access", () => {
    const sql = read("supabase/migrations/202605160001_news_system.sql");
    const policyFixSql = read("supabase/migrations/202605160002_fix_news_admin_article_policies.sql");
    const hardeningSql = read("supabase/migrations/202605170001_harden_news_security_constraints.sql");

    expect(sql).toContain("create table if not exists public.admin_profiles");
    expect(sql).toContain("content_hash text not null unique");
    expect(sql).toContain("status text not null default 'draft'");
    expect(policyFixSql).toContain("using (status = 'published')");
    expect(policyFixSql).toContain("using (public.is_news_admin())");
    expect(sql).toContain("enabled = true or public.is_news_admin()");
    expect(hardeningSql).toContain("news_articles_static_slug_safe");
    expect(hardeningSql).toContain("source_url ~* '^https?://'");
  });

  test("edge functions require POST, JWT, and the shared scheduler secret", () => {
    const sharedUtils = read("supabase/functions/_shared/news-utils.ts");
    const config = read("supabase/config.toml");
    const syncFunction = read("supabase/functions/sync-news/index.ts");
    const draftFunction = read("supabase/functions/draft-news/index.ts");
    const exportFunction = read("supabase/functions/export-static-news/index.ts");

    expect(sharedUtils).toContain("NEWS_FUNCTION_SECRET is required");
    expect(sharedUtils).toContain("throw httpError(\"Unauthorized function call.\", 401)");
    expect(sharedUtils).toContain("Access-Control-Allow-Methods\": \"POST, OPTIONS\"");
    expect(sharedUtils).toContain('.filter((origin) => origin !== "*")');
    expect(config).not.toContain("verify_jwt = false");
    for (const functionSource of [syncFunction, draftFunction, exportFunction]) {
      expect(functionSource).toContain("requirePost(req)");
      expect(functionSource).toContain("preflightResponse(req)");
      expect(functionSource).toContain("errorStatus(error)");
    }
  });

  test("draft function uses structured outputs and does not expose server keys to frontend", () => {
    const draftFunction = read("supabase/functions/draft-news/index.ts");
    const browserConfigExample = read("assets/news-config.example.js");
    const browserConfigDefault = read("assets/news-config.js");
    const browserNews = read("assets/news.js");
    const publicNewsPage = read("vi/news.html");
    const publicArticlePage = read("vi/news/article.html");

    expect(draftFunction).toContain("OPENAI_API_KEY");
    expect(draftFunction).toContain("json_schema");
    expect(draftFunction).toContain("additionalProperties: false");
    expect(browserNews).toContain("@supabase/supabase-js@2.105.3");
    expect(browserConfigExample).not.toContain("OPENAI_API_KEY");
    expect(browserConfigExample).not.toContain("SERVICE_ROLE");
    expect(browserConfigDefault).toContain('supabaseUrl: ""');
    expect(browserConfigDefault).toContain('supabaseAnonKey: ""');
    expect(browserConfigDefault).not.toContain("OPENAI_API_KEY");
    expect(browserConfigDefault).not.toContain("SERVICE_ROLE");
    expect(publicNewsPage).toContain('src="../assets/news-config.js"');
    expect(publicArticlePage).toContain('src="../../assets/news-config.js"');
  });

  test("sync function reads enabled sources and upserts raw items by hash", () => {
    const syncFunction = read("supabase/functions/sync-news/index.ts");

    expect(syncFunction).toContain(".eq(\"enabled\", true)");
    expect(syncFunction).toContain("parseRss");
    expect(syncFunction).toContain("parseBoundedInteger");
    expect(syncFunction).toContain("safeHttpUrl(source.feed_url)");
    expect(syncFunction).toContain("onConflict: \"content_hash\"");
  });

  test("v2 workflows and examples avoid hard-coded secrets", () => {
    const newsWorkflow = read(".github/workflows/news-pipeline.yml");
    const siteWorkflow = read(".github/workflows/site-tests.yml");
    const exampleConfig = read("assets/news-config.example.js");
    const envExample = read("supabase/.env.example");

    expect(newsWorkflow).toContain("secrets.SUPABASE_URL");
    expect(newsWorkflow).toContain("secrets.SUPABASE_ANON_KEY");
    expect(newsWorkflow).toContain("secrets.NEWS_FUNCTION_SECRET");
    expect(newsWorkflow).toContain("Authorization: Bearer");
    expect(newsWorkflow).toContain("skipped");
    expect(siteWorkflow).toContain("npm ci");
    expect(siteWorkflow).toContain("npx playwright install --with-deps chromium");
    expect(exampleConfig).toContain("YOUR_SUPABASE_ANON_KEY");
    expect(envExample).toContain("YOUR_OPENAI_API_KEY");
    expect(envExample).toContain("NEWS_ALLOWED_ORIGINS");
  });

  test("daily workflow creates reviewable drafts without automatic publishing", () => {
    const newsWorkflow = read(".github/workflows/news-pipeline.yml");
    const draftFunction = read("supabase/functions/draft-news/index.ts");
    const checkScript = read("scripts/check-news-pipeline.ps1");

    expect(newsWorkflow).toContain('cron: "15 17 * * *"');
    expect(newsWorkflow).toContain("draft-news?limit=10");
    expect(newsWorkflow).not.toContain("publish=1");
    expect(newsWorkflow).not.toContain("replace=1");
    expect(newsWorkflow).not.toContain("functions/v1/export-static-news");
    expect(checkScript).toContain('"draft-news?limit=10"');
    expect(checkScript).not.toContain("publish=1");
    expect(draftFunction).not.toContain("autoPublish");
    expect(draftFunction).not.toContain('params.get("publish")');
    expect(draftFunction).not.toContain('params.get("replace")');
    expect(draftFunction).toContain('status: "draft"');
    expect(draftFunction).toContain("published_at: null");
    expect(draftFunction).toContain("reviewed_at: null");
    expect(draftFunction).toContain('.from("news_articles")');
    expect(draftFunction).toContain('.from("news_raw_items")');
  });

  test("static pages include defense-in-depth browser security policy", () => {
    const headers = read("_headers");
    const homePage = read("vi/index.html");
    const exportFunction = read("supabase/functions/export-static-news/index.ts");

    expect(headers).toContain("Content-Security-Policy");
    expect(headers).toContain("X-Content-Type-Options: nosniff");
    expect(headers).toContain("frame-ancestors 'none'");
    expect(homePage).toContain('http-equiv="Content-Security-Policy"');
    expect(exportFunction).toContain('http-equiv="Content-Security-Policy"');
  });
});
