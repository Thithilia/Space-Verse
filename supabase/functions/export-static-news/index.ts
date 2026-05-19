import {
  errorStatus,
  jsonResponse,
  preflightResponse,
  requireFunctionSecret,
  requirePost,
  safeHttpUrl,
  serviceClient,
  slugify,
  toBase64
} from "../_shared/news-utils.ts";

function escapeHtml(value: string | null | undefined) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderParagraphs(value: string) {
  return String(value || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("\n");
}

function externalLink(url: string | null | undefined, label: string) {
  const safeUrl = safeHttpUrl(url);
  return safeUrl
    ? `<a href="${escapeHtml(safeUrl)}" rel="noopener noreferrer" referrerpolicy="no-referrer" target="_blank">${escapeHtml(label)}</a>`
    : escapeHtml(label);
}

function articleHtml(article: any, staticSlug: string) {
  const imageUrl = safeHttpUrl(article.image_url);
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co">
  <title>${escapeHtml(article.title_vi)} | Space-Verse</title>
  <link rel="stylesheet" href="../../assets/style.css">
</head>
<body class="news-page" data-locale="vi" data-page="news/${escapeHtml(staticSlug)}.html" data-root="../../">
  <div id="site-header"></div>
  <main class="site-main">
    <div class="container after-header">
      <nav class="field-breadcrumb" aria-label="Breadcrumb">
        <a href="../../vi/index.html">Trang chủ</a>
        <span>/</span>
        <a href="../../vi/news.html">Tin tức</a>
      </nav>
    </div>
    <article class="news-article">
      <header class="news-article__header">
        <div class="news-meta">
          <span class="news-tag">${escapeHtml(article.field)}</span>
          <span>${escapeHtml(article.source_name)}</span>
        </div>
        <h1>${escapeHtml(article.title_vi)}</h1>
        <p class="news-article__summary">${escapeHtml(article.summary_vi)}</p>
      </header>
      ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(article.title_vi)}" referrerpolicy="no-referrer">` : ""}
      <div class="news-article__body">
        <p><strong>Vì sao đáng chú ý:</strong> ${escapeHtml(article.why_it_matters_vi)}</p>
        ${renderParagraphs(article.body_vi)}
      </div>
      <footer class="news-article__source">
        <span>Nguồn gốc: ${externalLink(article.source_url, article.source_name || "Nguồn chính thức")}</span>
        ${article.image_credit ? `<span>Credit ảnh: ${escapeHtml(article.image_credit)}${safeHttpUrl(article.image_source_url) ? ` · ${externalLink(article.image_source_url, "nguồn ảnh")}` : ""}</span>` : ""}
      </footer>
    </article>
  </main>
  <div id="site-footer"></div>
  <script src="../../assets/site-shell.js" defer></script>
</body>
</html>
`;
}

async function githubRequest(path: string, options: RequestInit = {}) {
  const token = Deno.env.get("GITHUB_TOKEN");
  const repo = Deno.env.get("GITHUB_REPO");
  if (!token || !repo) throw new Error("Missing GITHUB_TOKEN or GITHUB_REPO.");
  const response = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `GitHub returned ${response.status}`);
  return payload;
}

async function ensureBranch(branch: string, baseBranch: string) {
  try {
    await githubRequest(`/git/ref/heads/${branch}`);
    return;
  } catch (_) {
    const baseRef = await githubRequest(`/git/ref/heads/${baseBranch}`);
    await githubRequest(`/git/refs`, {
      method: "POST",
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: baseRef.object.sha
      })
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflightResponse(req);

  try {
    requirePost(req);
    requireFunctionSecret(req);
    const supabase = serviceClient();
    const { data: articles, error } = await supabase
      .from("news_articles")
      .select("*")
      .eq("status", "published")
      .eq("featured_static", true)
      .in("static_export_status", ["none", "pending", "needs_github_config", "error"])
      .limit(10);

    if (error) throw error;

    if (!Deno.env.get("GITHUB_TOKEN") || !Deno.env.get("GITHUB_REPO")) {
      for (const article of articles || []) {
        await supabase.from("news_articles").update({
          static_export_status: "needs_github_config",
          static_export_error: "Set GITHUB_TOKEN and GITHUB_REPO to export static news pages."
        }).eq("id", article.id);
      }
      return jsonResponse({ ok: true, exported: 0, needs_github_config: articles?.length || 0 }, 200, req);
    }

    const baseBranch = Deno.env.get("GITHUB_BASE_BRANCH") || "main";
    const branch = Deno.env.get("GITHUB_EXPORT_BRANCH") || `spaceverse-news-${new Date().toISOString().slice(0, 10)}`;
    await ensureBranch(branch, baseBranch);

    const exported = [];
    for (const article of articles || []) {
      try {
        const staticSlug = slugify(article.static_slug || article.slug || article.title_vi);
        const path = `vi/news/${staticSlug}.html`;
        const html = articleHtml(article, staticSlug);
        let existingSha = null;
        try {
          const existing = await githubRequest(`/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${encodeURIComponent(branch)}`);
          existingSha = existing.sha || null;
        } catch (_) {
          existingSha = null;
        }
        await githubRequest(`/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}`, {
          method: "PUT",
          body: JSON.stringify({
            message: `Add static news page: ${article.title_vi}`,
            content: toBase64(html),
            branch,
            ...(existingSha ? { sha: existingSha } : {})
          })
        });
        await supabase.from("news_articles").update({
          static_slug: staticSlug,
          static_export_status: "pr_opened",
          static_export_error: null
        }).eq("id", article.id);
        exported.push({ id: article.id, path });
      } catch (error) {
        await supabase.from("news_articles").update({
          static_export_status: "error",
          static_export_error: String(error?.message || error)
        }).eq("id", article.id);
      }
    }

    const createPr = Deno.env.get("GITHUB_CREATE_PR") !== "false";
    let pullRequest = null;
    if (createPr && exported.length) {
      pullRequest = await githubRequest(`/pulls`, {
        method: "POST",
        body: JSON.stringify({
          title: `Publish Space-Verse news pages ${new Date().toISOString().slice(0, 10)}`,
          head: branch,
          base: baseBranch,
          body: "Generated static news pages from approved Space-Verse articles."
        })
      });
    }

    return jsonResponse({ ok: true, exported, pull_request_url: pullRequest?.html_url || null }, 200, req);
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error?.message || error) }, errorStatus(error), req);
  }
});
