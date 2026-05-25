const FIELD_LABELS = {
  astrophysics: "Vật lý thiên văn",
  satellite_technology: "Công nghệ vệ tinh",
  remote_sensing: "Viễn thám",
  space_physics: "Vật lý không gian",
  opportunities: "Cơ hội",
  general: "Tin không gian"
};

const FIELD_FALLBACK_IMAGES = {
  astrophysics: "image/astroarea.jpg",
  satellite_technology: "image/sate.png",
  remote_sensing: "image/remote.png",
  space_physics: "image/crabglass.png",
  opportunities: "image/galaxy.png",
  general: "image/galaxy.png"
};

const SUPABASE_MODULE_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.105.3/+esm";

let supabaseClientPromise = null;
let adminLoadVersion = 0;

function getConfig() {
  return window.SpaceVerseNewsConfig || {};
}

function isDemoRequest() {
  return new URLSearchParams(window.location.search).get("demo") === "1";
}

function hasSupabaseConfig() {
  const config = getConfig();
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

function adminRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

function hasAuthCallbackParams() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.slice(1));
  return Boolean(
    query.get("code") ||
    query.get("error") ||
    hash.get("access_token") ||
    hash.get("refresh_token") ||
    hash.get("error")
  );
}

function clearAuthCallbackParams() {
  if (hasAuthCallbackParams()) {
    window.history.replaceState(null, document.title, window.location.pathname);
  }
}

function getDemoArticles(force = false) {
  const config = getConfig();
  if (!force && !isDemoRequest() && config.demoMode === false) return [];
  return Array.isArray(window.SpaceVerseNewsDemoArticles) ? window.SpaceVerseNewsDemoArticles : [];
}

async function getSupabaseClient() {
  if (!hasSupabaseConfig()) {
    throw new Error("Missing Supabase configuration.");
  }
  if (!supabaseClientPromise) {
    supabaseClientPromise = import(SUPABASE_MODULE_URL).then(({ createClient }) => {
      const config = getConfig();
      return createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
    });
  }
  return supabaseClientPromise;
}

async function completeAuthCallback(supabase) {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.slice(1));

  const hashError = hash.get("error_description") || hash.get("error");
  const queryError = query.get("error_description") || query.get("error");
  if (hashError || queryError) {
    clearAuthCallbackParams();
    throw new Error(hashError || queryError);
  }

  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    clearAuthCallbackParams();
    if (error) throw error;
    return;
  }

  const code = query.get("code");
  if (code && typeof supabase.auth.exchangeCodeForSession === "function") {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    clearAuthCallbackParams();
    if (error) throw error;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeHttpUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch (_) {
    return "";
  }
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function fieldLabel(value) {
  return FIELD_LABELS[value] || value || "Tin không gian";
}

function rootPath() {
  return document.body.dataset.root || "";
}

function fallbackImageForField(field) {
  return `${rootPath()}${FIELD_FALLBACK_IMAGES[field] || FIELD_FALLBACK_IMAGES.general}`;
}

function cardImageUrls(article) {
  const fallback = fallbackImageForField(article.field);
  return {
    image: safeHttpUrl(article.image_url) || fallback,
    fallback
  };
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function articleHref(article) {
  if (article.demo) {
    return `./news/article.html?slug=${encodeURIComponent(article.slug)}&demo=1`;
  }
  return `./news/article.html?slug=${encodeURIComponent(article.slug)}`;
}

function paragraphsFromText(value) {
  return String(value || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function articleSearchText(article) {
  return normalizeSearchText([
    article.title_vi,
    article.summary_vi,
    article.source_name,
    fieldLabel(article.field),
    ...(Array.isArray(article.tags) ? article.tags : [])
  ].join(" "));
}

function renderNewsCard(article) {
  const imageUrls = cardImageUrls(article);
  return `
    <a class="news-card" data-news-card data-field="${escapeHtml(article.field || "general")}" data-search="${escapeHtml(articleSearchText(article))}" href="${articleHref(article)}">
      <span class="news-card__media">
        <img data-news-card-image src="${escapeHtml(imageUrls.image)}" data-fallback-src="${escapeHtml(imageUrls.fallback)}" alt="" loading="lazy" referrerpolicy="no-referrer">
      </span>
      <span class="news-card__main">
        <span class="news-meta">
          <span class="news-tag">${escapeHtml(fieldLabel(article.field))}</span>
          <span>${escapeHtml(article.source_name)}</span>
          <span>${escapeHtml(formatDate(article.source_published_at))}</span>
        </span>
        <h3>${escapeHtml(article.title_vi)}</h3>
        <p>${escapeHtml(article.summary_vi)}</p>
      </span>
      <span class="news-source">Đọc bản tin</span>
    </a>
  `;
}

function renderNewsFilters(articles) {
  const fields = [...new Set(articles.map((article) => article.field || "general"))];
  return `
    <div class="news-controls" aria-label="Bộ lọc tin tức">
      <label class="news-search">
        <span>Tìm tin</span>
        <input type="search" data-news-search placeholder="Tìm theo tiêu đề, nguồn hoặc lĩnh vực">
      </label>
      <div class="news-filter" role="group" aria-label="Lọc theo lĩnh vực">
        <button type="button" class="is-active" data-news-filter="all">Tất cả</button>
        ${fields.map((field) => `<button type="button" data-news-filter="${escapeHtml(field)}">${escapeHtml(fieldLabel(field))}</button>`).join("")}
      </div>
      <p class="news-result-count" data-news-count>${articles.length} bản tin</p>
    </div>
  `;
}

function renderNewsCards(articles) {
  if (!articles.length) return "";
  return `
    <div class="news-list">
      ${articles.slice(0, 10).map((article) => renderNewsCard(article)).join("")}
    </div>
    <div class="news-state news-state--empty" data-news-empty hidden>
      <strong>Không có bản tin phù hợp.</strong>
      <p>Thử đổi từ khóa tìm kiếm hoặc chọn lọc tất cả lĩnh vực.</p>
    </div>
  `;
}

function initNewsCardImages(target) {
  target.querySelectorAll("[data-news-card-image]").forEach((image) => {
    image.addEventListener("error", () => {
      const fallback = image.dataset.fallbackSrc;
      if (!fallback) return;
      const fallbackUrl = new URL(fallback, window.location.href).href;
      if (image.src !== fallbackUrl) image.src = fallback;
    });
  });
}

function initNewsFilters(target) {
  const search = target.querySelector("[data-news-search]");
  const filterButtons = Array.from(target.querySelectorAll("[data-news-filter]"));
  const cards = Array.from(target.querySelectorAll("[data-news-card]"));
  const count = target.querySelector("[data-news-count]");
  const empty = target.querySelector("[data-news-empty]");
  if (!search || !filterButtons.length || !cards.length) return;

  function applyFilters() {
    const activeFilter = filterButtons.find((button) => button.classList.contains("is-active"))?.dataset.newsFilter || "all";
    const query = normalizeSearchText(search.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const matchesField = activeFilter === "all" || card.dataset.field === activeFilter;
      const matchesSearch = !query || (card.dataset.search || "").includes(query);
      const isVisible = matchesField && matchesSearch;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (count) count.textContent = `${visibleCount} / ${cards.length} bản tin`;
    if (empty) empty.hidden = visibleCount !== 0;
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      applyFilters();
    });
  });

  search.addEventListener("input", applyFilters);
  applyFilters();
}

function renderNewsIndex(target, articles, noticeHtml = "") {
  const visibleArticles = articles.slice(0, 10);
  target.innerHTML = `
    ${noticeHtml}
    ${renderNewsFilters(visibleArticles)}
    ${renderNewsCards(visibleArticles)}
  `;
  initNewsCardImages(target);
  initNewsFilters(target);
}

function renderSetupState(target, isAdmin = false) {
  const demoArticles = getDemoArticles();
  if (!isAdmin && demoArticles.length) {
    renderNewsIndex(target, demoArticles.map((article) => ({ ...article, demo: true })), `
      <div class="news-state">
        <strong>Mục Tin tức đang chạy ở chế độ demo.</strong>
        <p>Điền <code>supabaseUrl</code> và <code>supabaseAnonKey</code> trong <code>assets/news-config.js</code> để thay dữ liệu mẫu bằng các bài đã duyệt từ backend.</p>
      </div>
    `);
    return;
  }

  target.innerHTML = `
    <div class="news-state">
      <strong>${isAdmin ? "Admin dashboard chưa được kết nối Supabase." : "Mục Tin tức đã sẵn sàng nhưng chưa có cấu hình Supabase."}</strong>
      <p>Điền <code>supabaseUrl</code> và <code>supabaseAnonKey</code> trong <code>assets/news-config.js</code>, sau đó chạy migration Supabase để bật dữ liệu thật.</p>
    </div>
  `;
}

function renderAdminSetupGuide() {
  return `
    <aside class="news-admin__setup" aria-labelledby="news-admin-setup-title">
      <h2 id="news-admin-setup-title">Quyền admin</h2>
      <p>Đăng nhập bằng magic link để tạo phiên Supabase. Quyền duyệt bài được quản lý riêng trong backend bởi owner của project.</p>
      <p>Trang public <code>/vi/news.html</code> chỉ hiện bài có <code>status = published</code>. Draft chỉ hiện ở dashboard này sau khi tài khoản đã được owner cấp quyền.</p>
    </aside>
  `;
}

function renderAdminSessionActions(session) {
  const email = session?.user?.email || "admin";
  return `
    <div class="news-admin__session">
      <span>Đã đăng nhập: <strong>${escapeHtml(email)}</strong></span>
      <button type="button" class="secondary" data-action="sign-out">Đăng xuất</button>
    </div>
  `;
}

function renderAdminDiagnostics({ session, isAdmin, visibleCount, allCount, draftCount, publishedCount }) {
  return `
    <details class="news-admin__diagnostics">
      <summary>Chẩn đoán kết nối</summary>
      <dl>
        <dt>Email</dt>
        <dd>${escapeHtml(session?.user?.email || "")}</dd>
        <dt>User ID</dt>
        <dd><code>${escapeHtml(session?.user?.id || "")}</code></dd>
        <dt>is_news_admin()</dt>
        <dd><code>${escapeHtml(String(isAdmin))}</code></dd>
        <dt>Rows admin query thấy</dt>
        <dd><code>${escapeHtml(String(visibleCount))}</code></dd>
        <dt>Rows tổng thấy qua RLS</dt>
        <dd><code>${escapeHtml(String(allCount))}</code></dd>
        <dt>Draft thấy qua RLS</dt>
        <dd><code>${escapeHtml(String(draftCount))}</code></dd>
        <dt>Published thấy qua RLS</dt>
        <dd><code>${escapeHtml(String(publishedCount))}</code></dd>
      </dl>
    </details>
  `;
}

async function renderNewsList(target) {
  if (isDemoRequest()) {
    renderNewsIndex(target, getDemoArticles(true).map((article) => ({ ...article, demo: true })), `
      <div class="news-state">
        <strong>News demo grid.</strong>
        <p>Trang này đang hiển thị 10 bài mẫu để kiểm tra layout 5x2.</p>
      </div>
    `);
    return;
  }

  if (!hasSupabaseConfig()) {
    renderSetupState(target);
    return;
  }

  target.innerHTML = `<div class="news-state">Đang tải tin tức...</div>`;
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("news_articles")
      .select("slug,title_vi,summary_vi,source_name,source_url,source_published_at,field,tags,image_url")
      .eq("status", "published")
      .order("source_published_at", { ascending: false, nullsFirst: false })
      .limit(10);

    if (error) throw error;
    if (!data || data.length === 0) {
      target.innerHTML = `<div class="news-state"><strong>Chưa có tin đã duyệt.</strong><p>Trang này chỉ hiển thị bài có <code>status = published</code>. Tài khoản admin phải được owner cấp quyền trong backend trước khi duyệt draft.</p></div>`;
      return;
    }

    renderNewsIndex(target, data);
  } catch (error) {
    target.innerHTML = `<div class="news-state"><strong>Không tải được tin tức.</strong><p>${escapeHtml(error.message)}</p></div>`;
  }
}

function renderArticle(target, data) {
  document.title = `${data.title_vi} | Space-Verse`;
  const imageUrl = safeHttpUrl(data.image_url);
  const sourceUrl = safeHttpUrl(data.source_url);
  const imageSourceUrl = safeHttpUrl(data.image_source_url);
  const sourceLabel = escapeHtml(data.source_name || "Nguồn chính thức");
  target.innerHTML = `
    <article class="news-article">
      <header class="news-article__header">
        <div class="news-meta">
          <span class="news-tag">${escapeHtml(fieldLabel(data.field))}</span>
          <span>${escapeHtml(data.source_name)}</span>
          <span>${escapeHtml(formatDate(data.source_published_at))}</span>
        </div>
        <h1>${escapeHtml(data.title_vi)}</h1>
        <p class="news-article__summary">${escapeHtml(data.summary_vi)}</p>
      </header>
      ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(data.title_vi)}" referrerpolicy="no-referrer">` : ""}
      <div class="news-article__body">
        <p><strong>Vì sao đáng chú ý:</strong> ${escapeHtml(data.why_it_matters_vi)}</p>
        ${paragraphsFromText(data.body_vi)}
      </div>
      <footer class="news-article__source">
        <span>Nguồn gốc: ${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" rel="noopener noreferrer" referrerpolicy="no-referrer" target="_blank">${sourceLabel}</a>` : sourceLabel}</span>
        ${data.image_credit ? `<span>Credit ảnh: ${escapeHtml(data.image_credit)}${imageSourceUrl ? ` · <a href="${escapeHtml(imageSourceUrl)}" rel="noopener noreferrer" referrerpolicy="no-referrer" target="_blank">nguồn ảnh</a>` : ""}</span>` : ""}
      </footer>
    </article>
  `;
}

async function renderNewsArticle(target) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  if (!slug) {
    target.innerHTML = `<div class="news-state"><strong>Thiếu slug bài viết.</strong><p>Hãy mở bài viết từ trang danh sách Tin tức.</p></div>`;
    return;
  }

  if (params.get("demo") === "1") {
    const article = getDemoArticles(true).find((item) => item.slug === slug);
    if (!article) {
      target.innerHTML = `<div class="news-state"><strong>Không tìm thấy bài demo.</strong><p>Hãy mở bài viết từ trang danh sách Tin tức.</p></div>`;
      return;
    }
    renderArticle(target, article);
    return;
  }

  if (!hasSupabaseConfig()) {
    renderSetupState(target);
    return;
  }

  target.innerHTML = `<div class="news-state">Đang tải bài viết...</div>`;
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("news_articles")
      .select("slug,title_vi,summary_vi,why_it_matters_vi,body_vi,source_name,source_url,source_published_at,field,tags,image_url,image_credit,image_source_url,featured_static,static_slug")
      .eq("status", "published")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    renderArticle(target, data);
  } catch (error) {
    target.innerHTML = `<div class="news-state"><strong>Không tải được bài viết.</strong><p>${escapeHtml(error.message)}</p></div>`;
  }
}

function articleEditor(article) {
  return `
    <article class="news-admin__item" data-id="${escapeHtml(article.id)}">
      <h3>${escapeHtml(article.title_vi || article.raw_title || "Draft chưa có tiêu đề")}</h3>
      <div class="news-meta">
        <span>${escapeHtml(article.source_name || "")}</span>
        <span>${escapeHtml(formatDate(article.source_published_at))}</span>
        <span>${escapeHtml(article.status)}</span>
      </div>
      <div class="news-admin__fields">
        <label>Tiêu đề tiếng Việt
          <input data-field="title_vi" value="${escapeHtml(article.title_vi)}">
        </label>
        <label>Slug
          <input data-field="slug" value="${escapeHtml(article.slug)}">
        </label>
        <label>Lĩnh vực
          <select data-field="field">
            ${Object.keys(FIELD_LABELS).map((field) => `<option value="${field}"${field === article.field ? " selected" : ""}>${FIELD_LABELS[field]}</option>`).join("")}
          </select>
        </label>
        <label>Tóm tắt
          <textarea data-field="summary_vi">${escapeHtml(article.summary_vi)}</textarea>
        </label>
        <label>Vì sao đáng chú ý
          <textarea data-field="why_it_matters_vi">${escapeHtml(article.why_it_matters_vi)}</textarea>
        </label>
        <label>Nội dung
          <textarea data-field="body_vi">${escapeHtml(article.body_vi)}</textarea>
        </label>
        <label>Tags, phân tách bằng dấu phẩy
          <input data-field="tags" value="${escapeHtml((article.tags || []).join(", "))}">
        </label>
        <label>
          <span><input type="checkbox" data-field="featured_static"${article.featured_static ? " checked" : ""}> Xuất HTML tĩnh khi publish</span>
        </label>
      </div>
      <div class="news-admin__actions">
        <button type="button" data-action="save">Lưu draft</button>
        <button type="button" data-action="publish">Duyệt publish</button>
        <button type="button" data-action="reject" class="secondary">Từ chối</button>
      </div>
    </article>
  `;
}

function collectArticlePayload(item, status = null) {
  const payload = {};
  item.querySelectorAll("[data-field]").forEach((field) => {
    const key = field.dataset.field;
    if (field.type === "checkbox") {
      payload[key] = field.checked;
    } else if (key === "tags") {
      payload[key] = field.value.split(",").map((tag) => tag.trim()).filter(Boolean);
    } else {
      payload[key] = field.value.trim();
    }
  });
  if (status) {
    payload.status = status;
    payload.reviewed_at = new Date().toISOString();
    if (status === "published") payload.published_at = new Date().toISOString();
  }
  return payload;
}

async function renderAdmin(target) {
  target.innerHTML = `
    <section class="news-admin__panel">
      <h1>Quản trị Tin tức</h1>
      <p>Đăng nhập bằng email admin để duyệt draft. Nếu đây là lần đầu dùng email này, hãy đăng nhập một lần rồi thêm user vào <code>admin_profiles</code>.</p>
      ${renderAdminSetupGuide()}
      <form id="news-login-form">
        <label>Email admin
          <input name="email" type="email" autocomplete="email" required>
        </label>
        <button type="submit"${hasSupabaseConfig() ? "" : " disabled"}>Gửi link đăng nhập</button>
      </form>
      <div id="news-admin-session"></div>
      <div id="news-admin-status" class="news-state"></div>
      <div id="news-admin-diagnostics"></div>
      <div id="news-admin-list"></div>
    </section>
  `;

  const status = target.querySelector("#news-admin-status");
  const list = target.querySelector("#news-admin-list");
  const form = target.querySelector("#news-login-form");
  const setup = target.querySelector(".news-admin__setup");
  const sessionPanel = target.querySelector("#news-admin-session");
  const diagnostics = target.querySelector("#news-admin-diagnostics");

  if (!hasSupabaseConfig()) {
    status.innerHTML = "Chưa có Supabase config nên dashboard đang ở chế độ khóa.";
    return;
  }

  const supabase = await getSupabaseClient();

  async function loadArticles(session = null) {
    const loadVersion = ++adminLoadVersion;
    const currentSession = session || (await supabase.auth.getSession()).data.session;
    if (loadVersion !== adminLoadVersion) return;

    if (!currentSession) {
      form.hidden = false;
      setup.hidden = false;
      sessionPanel.innerHTML = "";
      diagnostics.innerHTML = "";
      status.textContent = "Chưa đăng nhập. Hãy gửi magic link, mở link trong email, rồi quay lại trang này.";
      list.innerHTML = "";
      return;
    }

    form.hidden = true;
    form.reset();
    sessionPanel.innerHTML = renderAdminSessionActions(currentSession);

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_news_admin");
    if (loadVersion !== adminLoadVersion) return;
    if (adminError) {
      status.textContent = `Không kiểm tra được quyền admin: ${adminError.message}`;
      list.innerHTML = "";
      return;
    }
    if (!isAdmin) {
      setup.hidden = false;
      status.innerHTML = "Bạn đã đăng nhập, nhưng tài khoản này chưa có quyền admin. Hãy nhờ owner cấp quyền trong backend rồi tải lại trang.";
      list.innerHTML = "";
      return;
    }

    setup.hidden = true;
    status.textContent = "Đang tải draft...";
    const articlesQuery = await supabase
      .from("news_articles")
      .select("id,slug,status,title_vi,summary_vi,why_it_matters_vi,body_vi,source_name,source_published_at,field,tags,featured_static")
      .in("status", ["draft", "published"])
      .order("created_at", { ascending: false })
      .limit(50);
    if (loadVersion !== adminLoadVersion) return;

    const { data, error } = articlesQuery;

    if (error) {
      status.textContent = error.message;
      return;
    }

    const [allRows, draftRows, publishedRows] = await Promise.all([
      supabase.from("news_articles").select("id", { count: "exact", head: true }),
      supabase.from("news_articles").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("news_articles").select("id", { count: "exact", head: true }).eq("status", "published")
    ]);
    if (loadVersion !== adminLoadVersion) return;

    diagnostics.innerHTML = renderAdminDiagnostics({
      session: currentSession,
      isAdmin,
      visibleCount: data.length,
      allCount: allRows.count ?? 0,
      draftCount: draftRows.count ?? 0,
      publishedCount: publishedRows.count ?? 0
    });

    status.textContent = data.length ? `${data.length} bài cần quản trị.` : "Chưa có draft nào hiển thị qua session hiện tại.";
    list.innerHTML = data.map(articleEditor).join("");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = new FormData(form).get("email");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: adminRedirectUrl() }
    });
      status.textContent = error ? error.message : "Đã gửi magic link. Mở link trong email; nếu là lần đầu đăng nhập, hãy nhờ owner cấp quyền admin trong backend.";
  });

  sessionPanel.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action='sign-out']");
    if (!button) return;
    const { error } = await supabase.auth.signOut();
    status.textContent = error ? error.message : "Đã đăng xuất.";
    await loadArticles(null);
  });

  list.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const item = button.closest("[data-id]");
    const id = item.dataset.id;
    const action = button.dataset.action;
    const statusValue = action === "publish" ? "published" : action === "reject" ? "rejected" : null;
    const payload = collectArticlePayload(item, statusValue);
    const { error } = await supabase.from("news_articles").update(payload).eq("id", id);
    status.textContent = error ? error.message : "Đã lưu thay đổi.";
    if (!error) await loadArticles();
  });

  const { data: authSubscription } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
      loadArticles(session);
    }
  });

  if (hasAuthCallbackParams()) {
    status.textContent = "Đang hoàn tất đăng nhập...";
    try {
      await completeAuthCallback(supabase);
    } catch (error) {
      status.textContent = error.message;
    }
  }

  await loadArticles();
}

document.addEventListener("DOMContentLoaded", () => {
  const target = document.querySelector("[data-news-root]");
  if (!target) return;
  const view = document.body.dataset.newsView;
  if (view === "article") renderNewsArticle(target);
  else if (view === "admin") renderAdmin(target);
  else renderNewsList(target);
});
