(function () {
  const pagesByLocale = {
    en: new Set(["index.html", "about.html", "projects.html", "contact.html"]),
    fr: new Set(["index.html", "about.html", "projects.html", "contact.html"]),
    vi: new Set([
      "index.html",
      "about.html",
      "research.html",
      "opportunities.html",
      "resources.html",
      "fields/astrophysics-&-cosmology.html",
      "fields/remote-sensing-&-earth-sciences.html",
      "resources/skills.html",
      "resources/scientific-programming.html",
      "resources/maths.html",
      "resources/CM-SR.html",
      "resources/thermostat.html",
      "resources/electromagnetism.html",
      "resources/optics.html",
      "resources/electronics.html",
      "resources/satellite-technology.html",
      "resources/fluid-mechanics.html",
      "resources/earth-science.html",
      "resources/QM.html",
      "resources/plasma-physics.html",
      "resources/atomic-physics.html",
      "resources/astro-cosmo.html",
      "resources/particle-physics.html",
      "resources/general-relativity.html"
    ])
  };

  const localeConfig = {
    vi: {
      code: "VI",
      flag: "🇻🇳",
      topLinks: [
        { label: "GitHub", href: "https://github.com/Thithilia/Space-Verse" },
        { label: "Liên hệ", href: "mailto:contact.space-verse@gmail.com" }
      ],
      footer: {
        title: "Space-Verse",
        summary: "Nền tảng tài nguyên mở dành cho học sinh, sinh viên Việt Nam quan tâm đến khoa học vũ trụ và công nghệ không gian.",
        quickTitle: "Khám phá",
        contactTitle: "Liên hệ",
        quickLinks: [
          { label: "Về chúng tôi", href: "about.html" },
          { label: "Nghiên cứu", href: "research.html" },
          { label: "Tài nguyên", href: "resources.html" }
        ],
        contactLines: [
          "Email: contact.space-verse@gmail.com",
          "GitHub: github.com/Thithilia/Space-Verse"
        ],
        copyright: "Space-Verse. Nội dung được cập nhật cho cộng đồng học thuật Việt Nam."
      },
      nav: [
        {
          type: "submenu",
          label: "Giới thiệu",
          items: [{ label: "Về chúng tôi", href: "about.html" }]
        },
        {
          type: "submenu",
          label: "Nghiên cứu",
          href: "research.html",
          items: [
            { label: "Vật lý thiên văn và vũ trụ học", href: "fields/astrophysics-&-cosmology.html" },
            { label: "Viễn thám và khoa học Trái Đất", href: "fields/remote-sensing-&-earth-sciences.html" }
          ]
        },
        { type: "link", label: "Cơ hội", href: "opportunities.html" },
        { type: "link", label: "Tài nguyên", href: "resources.html" }
      ]
    },
    en: {
      code: "EN",
      flag: "🇬🇧",
      topLinks: [
        { label: "GitHub", href: "https://github.com/Thithilia/Space-Verse" },
        { label: "Contact", href: "mailto:contact.space-verse@gmail.com" }
      ],
      footer: {
        title: "Space-Verse",
        summary: "Open learning resources for Vietnamese students exploring space science, astrophysics, Earth observation, and satellite technology.",
        quickTitle: "Explore",
        contactTitle: "Contact",
        quickLinks: [
          { label: "About", href: "about.html" },
          { label: "Projects", href: "projects.html" },
          { label: "Contact", href: "contact.html" }
        ],
        contactLines: [
          "Email: contact.space-verse@gmail.com",
          "GitHub: github.com/Thithilia/Space-Verse"
        ],
        copyright: "Space-Verse. Shared openly for the student community."
      },
      nav: [
        { type: "link", label: "Home", href: "index.html" },
        { type: "link", label: "About", href: "about.html" },
        { type: "link", label: "Projects", href: "projects.html" },
        { type: "link", label: "Contact", href: "contact.html" }
      ]
    },
    fr: {
      code: "FR",
      flag: "🇫🇷",
      topLinks: [
        { label: "GitHub", href: "https://github.com/Thithilia/Space-Verse" },
        { label: "Contact", href: "mailto:contact.space-verse@gmail.com" }
      ],
      footer: {
        title: "Space-Verse",
        summary: "Une plateforme de ressources ouvertes pour les étudiantes et étudiants vietnamiens intéressés par les sciences et technologies spatiales.",
        quickTitle: "Explorer",
        contactTitle: "Contact",
        quickLinks: [
          { label: "À propos", href: "about.html" },
          { label: "Projets", href: "projects.html" },
          { label: "Contact", href: "contact.html" }
        ],
        contactLines: [
          "Email: contact.space-verse@gmail.com",
          "GitHub: github.com/Thithilia/Space-Verse"
        ],
        copyright: "Space-Verse. Ressources ouvertes pour la communauté étudiante."
      },
      nav: [
        { type: "link", label: "Accueil", href: "index.html" },
        { type: "link", label: "À propos", href: "about.html" },
        { type: "link", label: "Projets", href: "projects.html" },
        { type: "link", label: "Contact", href: "contact.html" }
      ]
    }
  };

  const body = document.body;
  const locale = body.dataset.locale || document.documentElement.lang || "en";
  const root = body.dataset.root || "../";
  const page = body.dataset.page || "index.html";
  const headerRoot = document.getElementById("site-header");
  const footerRoot = document.getElementById("site-footer");
  const config = localeConfig[locale] || localeConfig.en;

  function localeHref(targetLocale, targetPage) {
    return root + targetLocale + "/" + targetPage;
  }

  function resolveLocaleTarget(targetLocale) {
    const targetPages = pagesByLocale[targetLocale] || new Set(["index.html"]);
    return targetPages.has(page) ? page : "index.html";
  }

  function renderNav(items) {
    return items.map((item) => {
      if (item.type === "submenu") {
        const overviewLink = item.href ? `<a href="${localeHref(locale, item.href)}">${item.label}</a>` : "";
        const submenu = item.items.map((subItem) => {
          const href = localeHref(locale, subItem.href);
          const current = subItem.href === page ? ' aria-current="page"' : "";
          return `<a href="${href}"${current}>${subItem.label}</a>`;
        }).join("");
        return `<div class="nav-item has-submenu"><button type="button">${item.label}</button><div class="submenu">${overviewLink}${submenu}</div></div>`;
      }
      const href = localeHref(locale, item.href);
      const current = item.href === page ? ' aria-current="page"' : "";
      return `<a href="${href}"${current}>${item.label}</a>`;
    }).join("");
  }

  function renderHeader() {
    if (!headerRoot) return;
    const topLinks = config.topLinks.map((link) => `<a href="${link.href}">${link.label}</a>`).join("");
    const menu = renderNav(config.nav);
    const langMenu = Object.keys(localeConfig).map((key) => {
      const targetPage = resolveLocaleTarget(key);
      const href = localeHref(key, targetPage);
      const current = key === locale ? ' aria-current="page"' : "";
      const fallbackLabel = targetPage === page ? "" : (key === "vi" ? "Trang chủ" : key === "fr" ? "Accueil" : "Home");
      return `<li><a href="${href}" data-locale="${key}"${current}><span><span class="lang-flag">${localeConfig[key].flag}</span> <span class="lang-label">${localeConfig[key].code}</span></span><span>${fallbackLabel}</span></a></li>`;
    }).join("");

    headerRoot.innerHTML = `
      <header class="site-header">
        <div class="site-header__top">
          <div class="container">
            <nav class="top-links" aria-label="Quick links">${topLinks}</nav>
            <div class="header-tools">
              <div class="lang-switcher">
                <button class="lang-trigger" type="button" aria-haspopup="true" aria-expanded="false">
                  <span class="lang-flag">${config.flag}</span>
                  <span>${config.code}</span>
                </button>
                <ul class="lang-menu" aria-label="Language menu">${langMenu}</ul>
              </div>
              <button class="menu-toggle" type="button" aria-expanded="false">Menu</button>
            </div>
          </div>
        </div>
        <div class="site-header__main">
          <div class="container">
            <a class="brand" href="${localeHref(locale, "index.html")}">
              <span class="brand__mark">SV</span>
              <span class="brand__text">
                <span class="brand__name">Space-Verse</span>
                <span class="brand__tagline">Open resources for space science learners</span>
              </span>
            </a>
            <nav class="main-nav" aria-label="Main navigation">${menu}</nav>
          </div>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    if (!footerRoot) return;
    const footer = config.footer;
    const quickLinks = footer.quickLinks.map((link) => `<li><a href="${localeHref(locale, link.href)}">${link.label}</a></li>`).join("");
    const contact = footer.contactLines.map((line) => `<p>${line}</p>`).join("");
    footerRoot.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="site-footer__grid">
            <div class="site-footer__brand">
              <h2>${footer.title}</h2>
              <p>${footer.summary}</p>
            </div>
            <div>
              <h3>${footer.quickTitle}</h3>
              <ul>${quickLinks}</ul>
            </div>
            <div>
              <h3>${footer.contactTitle}</h3>
              ${contact}
            </div>
          </div>
          <div class="site-footer__bottom">
            <span>© <span id="footer-year"></span></span>
            <span>${footer.copyright}</span>
          </div>
        </div>
      </footer>
    `;
    const year = footerRoot.querySelector("#footer-year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function enhanceInteractions() {
    const header = headerRoot.querySelector(".site-header");
    if (!header) return;
    const langTrigger = header.querySelector(".lang-trigger");
    const langMenu = header.querySelector(".lang-menu");
    const menuToggle = header.querySelector(".menu-toggle");
    const submenuParents = Array.from(header.querySelectorAll(".nav-item.has-submenu"));

    langTrigger.addEventListener("click", function () {
      const isOpen = langMenu.classList.toggle("is-open");
      langTrigger.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", function (event) {
      if (!langMenu.contains(event.target) && !langTrigger.contains(event.target)) {
        langMenu.classList.remove("is-open");
        langTrigger.setAttribute("aria-expanded", "false");
      }
    });

    menuToggle.addEventListener("click", function () {
      const isOpen = header.dataset.menuOpen === "true";
      header.dataset.menuOpen = isOpen ? "false" : "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
    });

    submenuParents.forEach(function (item) {
      const trigger = item.querySelector("button");
      if (!trigger) return;
      trigger.addEventListener("click", function () {
        if (window.innerWidth > 920) return;
        const open = item.dataset.open === "true";
        submenuParents.forEach((other) => {
          if (other !== item) other.dataset.open = "false";
        });
        item.dataset.open = open ? "false" : "true";
      });
    });
  }

  function updateAlternateLinks() {
    const existing = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'));
    existing.forEach((element) => element.remove());
    Object.keys(localeConfig).forEach((key) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = key;
      link.href = localeHref(key, resolveLocaleTarget(key));
      document.head.appendChild(link);
    });
  }

  renderHeader();
  renderFooter();
  enhanceInteractions();
  updateAlternateLinks();
})();
