(function () {
  const sections = {
    research: {
      pages: (page) => page === "research.html" || page.startsWith("fields/"),
      sidebarId: "research-sidebar",
      overviewId: "research-overview",
      heading: "Lĩnh vực nghiên cứu",
      ariaLabel: "Lĩnh vực nghiên cứu",
      emptyText: "Chưa có lĩnh vực nào trong danh mục này.",
      overviewText: "Chọn một lĩnh vực ở cột bên trái để đi tới trang giới thiệu chi tiết, gồm bối cảnh, chủ đề nghiên cứu, nền tảng cần chuẩn bị, phương pháp, dữ liệu và nguồn bắt đầu.",
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
          summary: "Thu nhận, xử lý và diễn giải dữ liệu vệ tinh, ảnh không gian và dữ liệu địa lý."
        },
        {
          href: "fields/remote-sensing-&-earth-sciences.html",
          title: "Viễn thám và khoa học Trái Đất",
          summary: "Nhánh chuyên sâu về khí hậu, môi trường, tài nguyên, thiên tai và hệ Trái Đất."
        },
        {
          href: "fields/space-physics.html",
          title: "Vật lý không gian",
          summary: "Môi trường plasma, gió Mặt Trời, từ quyển, tầng điện ly và thời tiết không gian."
        }
      ]
    },
    opportunities: {
      pages: (page) => page === "opportunities.html" || page.startsWith("opportunities/"),
      sidebarId: "opportunity-sidebar",
      overviewId: "opportunity-overview",
      heading: "Cơ hội",
      ariaLabel: "Các nhóm cơ hội",
      emptyText: "Chưa có nhóm cơ hội nào trong danh mục này.",
      overviewText: "Chọn một nhóm cơ hội ở cột bên trái để xem thông tin định hướng, các điểm cần chuẩn bị và lưu ý khi theo dõi nguồn chính thức.",
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

  function activeHref() {
    if (page.startsWith("fields/astrophysics/")) return "fields/astrophysics-&-cosmology.html";
    if (page.startsWith("fields/earth-sciences/")) return "fields/remote-sensing-&-earth-sciences.html";
    return page;
  }

  function renderSidebar() {
    const currentHref = activeHref();
    const links = section.items.map((item) => {
      const activeClass = item.href === currentHref ? " is-active" : "";
      const currentAttr = item.href === currentHref ? ' aria-current="page"' : "";
      return `<a class="resource-link${activeClass}" href="${root}vi/${item.href}"${currentAttr}><span>${item.title}</span><span aria-hidden="true">›</span></a>`;
    }).join("");

    sidebarTarget.innerHTML = `
      <div class="resource-sidebar">
        <div class="resource-sidebar__heading">
          <h2>${section.heading}</h2>
        </div>
        <nav class="resource-list" aria-label="${section.ariaLabel}">
          <div class="resource-list__group">${links || `<div class="resource-empty">${section.emptyText}</div>`}</div>
        </nav>
      </div>
    `;
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
