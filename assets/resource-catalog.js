(function () {
  const catalog = [
    { slug: "skills", href: "resources/skills.html", title: "Kỹ năng học thuật và nghề nghiệp", level: "foundation", tags: ["ky-nang", "viet-bai", "dao-duc"], summary: "Viết học thuật, trích dẫn, dùng AI có trách nhiệm, quản lý thời gian và kỹ năng làm việc học thuật." },
    { slug: "scientific-programming", href: "resources/scientific-programming.html", title: "Lập trình khoa học với Python", level: "foundation", tags: ["lap-trinh", "python", "du-lieu"], summary: "Chuỗi tài nguyên cho Python, notebook, mô phỏng số và xử lý dữ liệu khoa học." },
    { slug: "maths", href: "resources/maths.html", title: "Toán nền tảng", level: "foundation", tags: ["toan", "phan-tich", "dai-so"], summary: "Các môn toán cần thiết để theo học vật lý, thiên văn và kỹ thuật không gian." },
    { slug: "CM-SR", href: "resources/CM-SR.html", title: "Cơ học cổ điển và thuyết tương đối hẹp", level: "foundation", tags: ["vat-ly", "co-hoc"], summary: "Nhập môn động lực học, Lagrangian, Hamiltonian và nền tảng của thuyết tương đối hẹp." },
    { slug: "thermostat", href: "resources/thermostat.html", title: "Nhiệt động lực học và cơ học thống kê", level: "foundation", tags: ["vat-ly", "nhiet-dong"], summary: "Các chủ đề về entropy, hàm phân bố và mô tả vi mô của hệ nhiều hạt." },
    { slug: "electromagnetism", href: "resources/electromagnetism.html", title: "Điện từ học", level: "foundation", tags: ["vat-ly", "dien-tu"], summary: "Trường điện từ, phương trình Maxwell và ứng dụng trong khoa học không gian." },
    { slug: "optics", href: "resources/optics.html", title: "Quang học", level: "foundation", tags: ["vat-ly", "quang-hoc"], summary: "Quang học sóng, quang học lượng tử cơ bản và thiết bị quang trong quan sát thiên văn." },
    { slug: "electronics", href: "resources/electronics.html", title: "Điện tử", level: "foundation", tags: ["dien-tu", "ky-thuat"], summary: "Mạch điện, thiết bị bán dẫn và nền tảng phần cứng cho cảm biến và vệ tinh." },
    { slug: "satellite-technology", href: "resources/satellite-technology.html", title: "Công nghệ vệ tinh", level: "advanced", tags: ["ve-tinh", "ky-thuat"], summary: "Kiến thức hệ thống cho payload, bus vệ tinh, điều khiển và thiết kế sứ mệnh." },
    { slug: "fluid-mechanics", href: "resources/fluid-mechanics.html", title: "Cơ học chất lưu", level: "foundation", tags: ["vat-ly", "dong-luc-hoc"], summary: "Dòng chảy, khí động học và cơ sở cho mô phỏng môi trường và phương tiện bay." },
    { slug: "earth-science", href: "resources/earth-science.html", title: "Khoa học Trái Đất", level: "advanced", tags: ["trai-dat", "vien-tham"], summary: "Địa chất, môi trường, hệ thống Trái Đất và các nguồn dữ liệu phục vụ viễn thám." },
    { slug: "QM", href: "resources/QM.html", title: "Cơ học lượng tử", level: "advanced", tags: ["vat-ly", "luong-tu"], summary: "Nguyên lý lượng tử, toán tử, trạng thái lượng tử và ứng dụng trong vật lý hiện đại." },
    { slug: "plasma-physics", href: "resources/plasma-physics.html", title: "Vật lý plasma", level: "advanced", tags: ["vat-ly", "plasma"], summary: "Môi trường plasma trong vật lý không gian, MHD và tương tác sóng-hạt." },
    { slug: "atomic-physics", href: "resources/atomic-physics.html", title: "Vật lý nguyên tử", level: "advanced", tags: ["vat-ly", "nguyen-tu"], summary: "Cấu trúc nguyên tử, phổ học và nền tảng cho quang phổ thiên văn." },
    { slug: "astro-cosmo", href: "resources/astro-cosmo.html", title: "Thiên văn học, vật lý thiên văn và vũ trụ học", level: "advanced", tags: ["thien-van", "vu-tru"], summary: "Tổng quan tài nguyên để học từ quan sát bầu trời đến cấu trúc và tiến hóa của vũ trụ." },
    { slug: "particle-physics", href: "resources/particle-physics.html", title: "Vật lý hạt", level: "advanced", tags: ["vat-ly", "hat"], summary: "Mô hình chuẩn, detector và mối liên hệ với vật lý thiên văn năng lượng cao." },
    { slug: "general-relativity", href: "resources/general-relativity.html", title: "Thuyết tương đối rộng", level: "advanced", tags: ["vat-ly", "hap-dan"], summary: "Không-thời gian cong, hình học vi phân và ứng dụng trong thiên văn, vũ trụ học." }
  ];

  const body = document.body;
  const locale = body.dataset.locale;
  const page = body.dataset.page || "";
  const root = body.dataset.root || "../";

  if (locale !== "vi") return;
  if (!(page === "resources.html" || page.startsWith("resources/"))) return;

  const resourceLayout = document.querySelector(".resource-layout");
  const sidebarTarget = document.getElementById("resource-sidebar");
  const overviewTarget = document.getElementById("resource-overview");
  if (!resourceLayout || !sidebarTarget) return;

  const currentSlug = page === "resources.html" ? null : page.split("/").pop().replace(".html", "");
  const state = { query: "", level: "all" };

  function levelLabel(level) {
    return level === "advanced" ? "Nâng cao" : "Nền tảng";
  }

  function tagLabel(tag) {
    return tag.replaceAll("-", " ");
  }

  function filterResources() {
    return catalog.filter((item) => {
      const haystack = [item.title, item.summary, item.tags.join(" ")].join(" ").toLowerCase();
      const queryOk = !state.query || haystack.includes(state.query.toLowerCase());
      const levelOk = state.level === "all" || item.level === state.level;
      return queryOk && levelOk;
    });
  }

  function groupedResources(items) {
    return [
      { key: "foundation", label: "Nền tảng", items: items.filter((item) => item.level === "foundation") },
      { key: "advanced", label: "Nâng cao", items: items.filter((item) => item.level === "advanced") }
    ];
  }

  function renderSidebar() {
    const filtered = filterResources();
    const groupsHtml = groupedResources(filtered).map((group) => {
      if (!group.items.length) return "";
      const links = group.items.map((item) => {
        const activeClass = item.slug === currentSlug ? " is-active" : "";
        return `<a class="resource-link${activeClass}" href="${root}vi/${item.href}"><span>${item.title}</span></a>`;
      }).join("");
      return `<div class="resource-list__group"><div class="resource-list__title">${group.label}</div>${links}</div>`;
    }).join("");

    sidebarTarget.innerHTML = `
      <div class="resource-sidebar">
        <section class="panel-card resource-sidebar__panel resource-search">
          <h2>Tài nguyên học tập</h2>
          <p>Tìm nhanh theo môn học, kỹ năng hoặc độ khó.</p>
          <label class="visually-hidden" for="resource-search-input">Tìm tài nguyên</label>
          <input id="resource-search-input" type="search" placeholder="Tìm theo tên môn, tag..." value="${state.query}">
          <div class="resource-chip-row" role="tablist" aria-label="Lọc theo mức độ">
            <button class="resource-chip${state.level === "all" ? " is-active" : ""}" type="button" data-level="all">Tất cả</button>
            <button class="resource-chip${state.level === "foundation" ? " is-active" : ""}" type="button" data-level="foundation">Nền tảng</button>
            <button class="resource-chip${state.level === "advanced" ? " is-active" : ""}" type="button" data-level="advanced">Nâng cao</button>
          </div>
        </section>
        <section class="panel-card resource-sidebar__panel resource-list">
          ${groupsHtml || '<div class="resource-empty">Không có mục nào khớp bộ lọc hiện tại.</div>'}
        </section>
      </div>
    `;

    const input = sidebarTarget.querySelector("#resource-search-input");
    input.addEventListener("input", function () {
      state.query = input.value.trim();
      renderSidebar();
      if (page === "resources.html") renderOverview();
    });

    sidebarTarget.querySelectorAll("[data-level]").forEach((button) => {
      button.addEventListener("click", function () {
        state.level = button.dataset.level;
        renderSidebar();
        if (page === "resources.html") renderOverview();
      });
    });
  }

  function renderOverview() {
    if (!overviewTarget) return;
    const filtered = filterResources();
    const cards = filtered.map((item) => {
      const tags = item.tags.slice(0, 2).map((tag) => `<span class="resource-pill">${tagLabel(tag)}</span>`).join("");
      return `<article class="resource-card"><div class="resource-meta"><span class="resource-pill level-${item.level}">${levelLabel(item.level)}</span>${tags}</div><div><h3>${item.title}</h3><p>${item.summary}</p></div><a class="btn dark" href="${root}vi/${item.href}">Xem tài nguyên</a></article>`;
    }).join("");

    overviewTarget.innerHTML = `
      <section class="resource-summary">
        <div class="notice">Danh mục này được nhóm theo mức độ để người mới bắt đầu có thể đi từ các môn nền tảng trước, sau đó chuyển dần sang các chủ đề chuyên sâu.</div>
        <div class="resource-cards">${cards || '<div class="resource-empty">Không tìm thấy tài nguyên phù hợp. Hãy thử từ khóa hoặc mức độ khác.</div>'}</div>
      </section>
    `;
  }

  function enhanceDetailPage() {
    if (!currentSlug) return;
    const currentItem = catalog.find((item) => item.slug === currentSlug);
    if (!currentItem) return;
    const title = document.querySelector(".hero-banner h1");
    if (title) title.textContent = currentItem.title;
    const breadcrumbCurrent = document.querySelector("[data-resource-current]");
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = currentItem.title;
    const detailMeta = document.getElementById("resource-detail-meta");
    if (detailMeta) {
      detailMeta.innerHTML = `<span class="resource-pill level-${currentItem.level}">${levelLabel(currentItem.level)}</span>${currentItem.tags.map((tag) => `<span class="resource-pill">${tagLabel(tag)}</span>`).join("")}`;
    }
  }

  renderSidebar();
  if (page === "resources.html") renderOverview();
  enhanceDetailPage();
})();
