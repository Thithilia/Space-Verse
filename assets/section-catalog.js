(function () {
  const sections = {
    research: {
      pages: (page) => page === "research.html" || page.startsWith("fields/"),
      sidebarId: "research-sidebar",
      overviewId: "research-overview",
      heading: "Lĩnh vực nghiên cứu",
      ariaLabel: "Lĩnh vực nghiên cứu",
      mobilePrompt: "Chọn lĩnh vực",
      emptyText: "Chưa có lĩnh vực nào trong danh mục này.",
      overviewText: "Chọn một lĩnh vực trong danh mục để đi tới trang giới thiệu chi tiết, gồm bối cảnh, chủ đề nghiên cứu, nền tảng cần chuẩn bị, phương pháp, dữ liệu và nguồn bắt đầu.",
      items: [
        {
          href: "fields/astrophysics-&-cosmology.html",
          title: "Vật lý thiên văn và vũ trụ học",
          summary: "Từ quan sát đa bước sóng đến cấu trúc, lịch sử và tương lai của vũ trụ."
        },
        {
          href: "fields/satellite-technology.html",
          title: "Công nghệ vệ tinh",
          summary: "Thiết kế, vận hành và khai thác hệ thống vệ tinh cho khoa học và ứng dụng không gian."
        },
        {
          href: "fields/remote-sensing.html",
          title: "Viễn thám",
          summary: "Thu nhận, xử lý và phân tích thông tin từ xa bằng cảm biến quang học, radar, lidar và các hệ thống quan sát khác."
        },
        {
          href: "fields/earth-sciences.html",
          title: "Khoa học Trái Đất",
          summary: "Nghiên cứu các hệ thống đất, nước, khí quyển, băng quyển, sinh quyển và những biến đổi của Trái Đất."
        },
        {
          href: "fields/space-physics.html",
          title: "Vật lý không gian",
          summary: "Môi trường plasma, gió Mặt Trời, từ quyển, tầng điện ly và thời tiết không gian."
        },
        {
          href: "fields/particle-physics.html",
          title: "Vật lý hạt",
          summary: "Các hạt cơ bản, tương tác nền tảng, máy gia tốc, detector và vật lý năng lượng cao."
        }
      ]
    },
    opportunities: {
      pages: (page) => page === "opportunities.html" || page.startsWith("opportunities/"),
      sidebarId: "opportunity-sidebar",
      overviewId: "opportunity-overview",
      heading: "Cơ hội",
      ariaLabel: "Các nhóm cơ hội",
      mobilePrompt: "Chọn nhóm cơ hội",
      emptyText: "Chưa có nhóm cơ hội nào trong danh mục này.",
      overviewText: "Chọn một nhóm cơ hội trong danh mục để xem thông tin định hướng, các điểm cần chuẩn bị và lưu ý khi theo dõi nguồn chính thức.",
      items: [
        {
          href: "opportunities/graduate-programs.html",
          title: "Chương trình học thạc sĩ / tiến sĩ",
          summary: "Các hướng học sau đại học liên quan đến khoa học vũ trụ, vật lý, viễn thám và công nghệ không gian."
        },
        {
          href: "opportunities/internships.html",
          title: "Cơ hội internship",
          summary: "Thực tập, dự án hè và nghiên cứu ngắn hạn để làm quen với môi trường nghiên cứu."
        },
        {
          href: "opportunities/scholarships.html",
          title: "Các chương trình học bổng",
          summary: "Nguồn hỗ trợ học phí, sinh hoạt phí, nghiên cứu và trao đổi học thuật."
        },
        {
          href: "opportunities/summer-schools-workshops-conferences.html",
          title: "Trường hè/Hội thảo/Hội nghị",
          summary: "Các trường hè, hội thảo và hội nghị về khoa học vũ trụ và công nghệ không gian."
        },
        {
          href: "opportunities/competitions.html",
          title: "Các cuộc thi",
          summary: "Vật lý và Toán."
        }
      ]
    }
  };

  const body = document.body;
  const locale = body.dataset.locale;
  const page = body.dataset.page || "";
  const root = body.dataset.root || "../";

  if (locale !== "vi") return;

  const section = Object.values(sections).find((candidate) => candidate.pages(page));
  if (!section) return;

  const sidebarTarget = document.getElementById(section.sidebarId);
  if (!sidebarTarget) return;
  const compactNavigation = window.matchMedia("(max-width: 1199px), (hover: none) and (pointer: coarse)");

  function activeHref() {
    if (page.startsWith("fields/astrophysics/")) return "fields/astrophysics-&-cosmology.html";
    if (page.startsWith("fields/earth-sciences/")) return "fields/earth-sciences.html";
    return page;
  }

  function renderSidebar() {
    const currentHref = activeHref();
    const currentItem = section.items.find((item) => item.href === currentHref);
    const links = section.items.map((item) => {
      const activeClass = item.href === currentHref ? " is-active" : "";
      const currentAttr = item.href === currentHref ? ' aria-current="page"' : "";
      return `<a class="resource-link${activeClass}" href="${root}vi/${item.href}"${currentAttr}><span>${item.title}</span><span aria-hidden="true">›</span></a>`;
    }).join("");

    sidebarTarget.innerHTML = `
      <div class="resource-sidebar">
        <details class="resource-sidebar__disclosure"${compactNavigation.matches ? "" : " open"}>
          <summary class="resource-sidebar__heading">
            <h2>${section.heading}</h2>
            <span class="resource-sidebar__mobile-label">
              <span class="resource-sidebar__prompt">${section.mobilePrompt}</span>
              <span class="resource-sidebar__current">${currentItem ? currentItem.title : section.heading}</span>
            </span>
          </summary>
          <nav class="resource-list" aria-label="${section.ariaLabel}">
            <div class="resource-list__group">${links || `<div class="resource-empty">${section.emptyText}</div>`}</div>
          </nav>
        </details>
      </div>
    `;

    const disclosure = sidebarTarget.querySelector("details");
    const summary = disclosure.querySelector("summary");
    function syncSidebar() {
      disclosure.open = !compactNavigation.matches;
      summary.tabIndex = compactNavigation.matches ? 0 : -1;
    }
    summary.addEventListener("click", (event) => {
      if (!compactNavigation.matches) event.preventDefault();
    });
    disclosure.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && compactNavigation.matches && disclosure.open) {
        disclosure.open = false;
        summary.focus();
        event.preventDefault();
      }
    });
    compactNavigation.addEventListener("change", syncSidebar);
    syncSidebar();
  }

  function renderOverview() {
    const overviewTarget = document.getElementById(section.overviewId);
    if (!overviewTarget) return;

    const cards = section.items.map((item) => {
      return `<a class="resource-overview-link" href="${root}vi/${item.href}"><span>${item.title}</span><span>${item.summary}</span></a>`;
    }).join("");

    overviewTarget.innerHTML = `
      <section class="resource-summary">
        <p>${section.overviewText}</p>
        <div class="resource-overview-list">${cards || `<div class="resource-empty">${section.emptyText}</div>`}</div>
      </section>
    `;
  }

  renderSidebar();
  renderOverview();
})();
