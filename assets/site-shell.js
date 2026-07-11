(function () {
  const pagesByLocale = {
    en: new Set(["index.html", "about.html", "projects.html", "contact.html"]),
    fr: new Set(["index.html", "about.html", "projects.html", "contact.html"]),
    vi: new Set([
      "index.html",
      "about.html",
      "disclaimer.html",
      "guide.html",
      "news.html",
      "news/article.html",
      "admin/news.html",
      "research.html",
      "opportunities.html",
      "opportunities/graduate-programs.html",
      "opportunities/internships.html",
      "opportunities/scholarships.html",
      "resources.html",
      "fields/astrophysics-&-cosmology.html",
      "fields/astrophysics/exoplanets.html",
      "fields/astrophysics/gamma-ray-astronomy.html",
      "fields/astrophysics/microlensing.html",
      "fields/satellite-technology.html",
      "fields/remote-sensing.html",
      "fields/remote-sensing-&-earth-sciences.html",
      "fields/space-physics.html",
      "resources/skills.html",
      "resources/profile-building.html",
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
      ui: {
        home: "Trang chủ Space-Verse",
        openNavigation: "Mở menu điều hướng",
        closeNavigation: "Đóng menu điều hướng",
        mainNavigation: "Điều hướng chính",
        quickLinks: "Liên kết nhanh",
        languageMenu: "Chọn ngôn ngữ",
        skipToContent: "Chuyển đến nội dung chính",
        overview: "Tổng quan",
        footerPrimary: "Liên kết chính ở chân trang",
        footerSecondary: "Liên kết phụ ở chân trang",
        news: "Tin tức",
        material: "Tài nguyên",
        about: "Về chúng tôi",
        research: "Nghiên cứu",
        contact: "Liên hệ",
        copyright: "Bản quyền đã được bảo lưu."
      },
      topLinks: [
        { label: "GitHub", href: "https://github.com/Thithilia/New-Space-Verse" },
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
          "GitHub: github.com/Thithilia/New-Space-Verse"
        ],
        copyright: "Space-Verse. Nội dung được cập nhật cho cộng đồng học thuật Việt Nam."
      },
      nav: [
        {
          type: "submenu",
          label: "Giới thiệu",
          items: [
            { label: "Về chúng tôi", href: "about.html" },
            { label: "Tuyên bố miễn trừ trách nhiệm", href: "disclaimer.html" },
            { label: "Hướng dẫn sử dụng website", href: "guide.html" }
          ]
        },
        { type: "link", label: "Tin tức", href: "news.html" },
        {
          type: "submenu",
          label: "Nghiên cứu",
          href: "research.html",
          items: [
            { label: "Vật lý thiên văn và vũ trụ học", href: "fields/astrophysics-&-cosmology.html" },
            { label: "Công nghệ vệ tinh", href: "fields/satellite-technology.html" },
            { label: "Viễn thám", href: "fields/remote-sensing.html" },
            { label: "Vật lý không gian", href: "fields/space-physics.html" }
          ]
        },
        {
          type: "submenu",
          label: "Cơ hội",
          href: "opportunities.html",
          items: [
            { label: "Chương trình học thạc sĩ / tiến sĩ", href: "opportunities/graduate-programs.html" },
            { label: "Cơ hội internship", href: "opportunities/internships.html" },
            { label: "Các chương trình học bổng", href: "opportunities/scholarships.html" }
          ]
        },
        { type: "link", label: "Tài nguyên", href: "resources.html" }
      ]
    },
    en: {
      code: "EN",
      flag: "🇬🇧",
      ui: {
        home: "Space-Verse home",
        openNavigation: "Open navigation",
        closeNavigation: "Close navigation",
        mainNavigation: "Main navigation",
        quickLinks: "Quick links",
        languageMenu: "Choose language",
        skipToContent: "Skip to main content",
        overview: "Overview",
        footerPrimary: "Footer primary links",
        footerSecondary: "Footer secondary links",
        news: "News",
        material: "Resources",
        about: "About us",
        research: "Projects",
        contact: "Contact",
        copyright: "All rights reserved."
      },
      topLinks: [
        { label: "GitHub", href: "https://github.com/Thithilia/New-Space-Verse" },
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
          "GitHub: github.com/Thithilia/New-Space-Verse"
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
      ui: {
        home: "Accueil Space-Verse",
        openNavigation: "Ouvrir la navigation",
        closeNavigation: "Fermer la navigation",
        mainNavigation: "Navigation principale",
        quickLinks: "Liens rapides",
        languageMenu: "Choisir la langue",
        skipToContent: "Aller au contenu principal",
        overview: "Vue d’ensemble",
        footerPrimary: "Liens principaux du pied de page",
        footerSecondary: "Liens secondaires du pied de page",
        news: "Actualités",
        material: "Ressources",
        about: "À propos",
        research: "Projets",
        contact: "Contact",
        copyright: "Tous droits réservés."
      },
      topLinks: [
        { label: "GitHub", href: "https://github.com/Thithilia/New-Space-Verse" },
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
          "GitHub: github.com/Thithilia/New-Space-Verse"
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
    return items.map((item, index) => {
      if (item.type === "submenu") {
        const submenuId = `site-submenu-${locale}-${index}`;
        const overviewCurrent = item.href === page ? ' aria-current="page"' : "";
        const overview = item.href
          ? `<a class="submenu__overview" href="${localeHref(locale, item.href)}"${overviewCurrent}>${config.ui.overview}: ${item.label}</a>`
          : "";
        const submenu = item.items.map((subItem) => {
          const href = localeHref(locale, subItem.href);
          const current = subItem.href === page ? ' aria-current="page"' : "";
          return `<a href="${href}"${current}>${subItem.label}</a>`;
        }).join("");
        return `<div class="nav-item has-submenu" data-open="false"><button type="button" aria-expanded="false" aria-controls="${submenuId}">${item.label}</button><div class="submenu" id="${submenuId}">${overview}${submenu}</div></div>`;
      }
      const href = localeHref(locale, item.href);
      const current = item.href === page ? ' aria-current="page"' : "";
      return `<a href="${href}"${current}>${item.label}</a>`;
    }).join("");
  }

  function renderHeader() {
    if (!headerRoot) return;
    const main = document.querySelector("main");
    const mainId = main?.id || "main-content";
    if (main && !main.id) main.id = mainId;
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
      <a class="skip-link" href="#${mainId}">${config.ui.skipToContent}</a>
      <header class="site-header">
        <div class="site-header__bar">
          <a class="brand" href="${localeHref(locale, "index.html")}" aria-label="${config.ui.home}">
            <span class="brand__mark">SV</span>
            <span class="brand__name">Space-Verse</span>
          </a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu-panel" aria-label="${config.ui.openNavigation}">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>
        <div class="site-menu-panel" id="site-menu-panel">
          <nav class="main-nav" aria-label="${config.ui.mainNavigation}">${menu}</nav>
          <nav class="top-links" aria-label="${config.ui.quickLinks}">${topLinks}</nav>
          <div class="lang-switcher">
            <button class="lang-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="language-menu">
              <span class="lang-flag">${config.flag}</span>
              <span>${config.code}</span>
            </button>
            <ul class="lang-menu" id="language-menu" aria-label="${config.ui.languageMenu}">${langMenu}</ul>
          </div>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    if (!footerRoot) return;
    const researchHref = locale === "vi" ? localeHref(locale, "research.html") : localeHref(locale, "projects.html");
    const materialHref = locale === "vi" ? localeHref(locale, "resources.html") : localeHref(locale, "index.html");
    const newsHref = locale === "vi" ? localeHref(locale, "news.html") : localeHref(locale, "index.html");
    const contactHref = "mailto:contact.space-verse@gmail.com";
    footerRoot.innerHTML = `
      <footer class="site-footer">
        <div class="site-footer__inner">
          <a class="site-footer__brand" href="${localeHref(locale, "index.html")}" aria-label="${config.ui.home}">
            <span class="site-footer__mark" aria-hidden="true"></span>
            <span>Space-Verse</span>
          </a>

          <div class="site-footer__nav">
            <div class="site-footer__primary-links" aria-label="${config.ui.footerPrimary}">
              <a href="${newsHref}">${config.ui.news}</a>
              <a href="${materialHref}">${config.ui.material}</a>
            </div>
            <div class="site-footer__secondary-links" aria-label="${config.ui.footerSecondary}">
              <a href="${localeHref(locale, "about.html")}">${config.ui.about}</a>
              <a href="${researchHref}">${config.ui.research}</a>
              <a href="${contactHref}">${config.ui.contact}</a>
              <a href="https://github.com/Thithilia/New-Space-Verse">GitHub</a>
            </div>
          </div>

          <div class="site-footer__copyright">
            Copyright © <span id="footer-year"></span> Space-Verse — ${config.ui.copyright}
          </div>
        </div>
      </footer>
    `;
    const year = footerRoot.querySelector("#footer-year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function enhanceInteractions() {
    if (!headerRoot) return;
    const header = headerRoot.querySelector(".site-header");
    if (!header) return;
    const langTrigger = header.querySelector(".lang-trigger");
    const langMenu = header.querySelector(".lang-menu");
    const menuToggle = header.querySelector(".menu-toggle");
    const submenuParents = Array.from(header.querySelectorAll(".nav-item.has-submenu"));

    function setLanguageMenu(open) {
      langMenu.classList.toggle("is-open", open);
      langTrigger.setAttribute("aria-expanded", String(open));
    }

    function setSubmenu(item, open) {
      item.dataset.open = String(open);
      const trigger = item.querySelector(":scope > button");
      if (trigger) trigger.setAttribute("aria-expanded", String(open));
    }

    function closeSubmenus(except) {
      submenuParents.forEach((item) => {
        if (item !== except) setSubmenu(item, false);
      });
    }

    function setMainMenu(open) {
      header.dataset.menuOpen = String(open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? config.ui.closeNavigation : config.ui.openNavigation);
      if (!open) {
        setLanguageMenu(false);
        closeSubmenus();
      }
    }

    langTrigger.addEventListener("click", function () {
      setLanguageMenu(langTrigger.getAttribute("aria-expanded") !== "true");
    });

    langMenu.addEventListener("click", function (event) {
      const link = event.target.closest("a[data-locale]");
      if (!link) return;
      try {
        localStorage.setItem("site_lang", link.dataset.locale);
      } catch (error) {
        // Navigation must still work when storage is blocked by browser policy.
      }
    });

    menuToggle.addEventListener("click", function () {
      setMainMenu(header.dataset.menuOpen !== "true");
    });

    submenuParents.forEach(function (item) {
      const trigger = item.querySelector("button");
      if (!trigger) return;
      trigger.addEventListener("click", function () {
        const open = item.dataset.open === "true";
        closeSubmenus(item);
        setSubmenu(item, !open);
      });
      trigger.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowDown") return;
        event.preventDefault();
        closeSubmenus(item);
        setSubmenu(item, true);
        item.querySelector(".submenu a")?.focus();
      });
    });

    document.addEventListener("click", function (event) {
      if (!langMenu.contains(event.target) && !langTrigger.contains(event.target)) {
        setLanguageMenu(false);
      }
      if (!header.contains(event.target)) setMainMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;

      if (langTrigger.getAttribute("aria-expanded") === "true") {
        setLanguageMenu(false);
        langTrigger.focus();
        event.preventDefault();
        return;
      }

      const openSubmenu = submenuParents.find((item) => item.dataset.open === "true");
      if (openSubmenu) {
        setSubmenu(openSubmenu, false);
        openSubmenu.querySelector(":scope > button")?.focus();
        event.preventDefault();
        return;
      }

      if (header.dataset.menuOpen === "true") {
        setMainMenu(false);
        menuToggle.focus();
        event.preventDefault();
      }
    });
  }

  function updateAlternateLinks() {
    const existing = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'));
    existing.forEach((element) => element.remove());
    const equivalentLocales = Object.keys(localeConfig).filter((key) => pagesByLocale[key]?.has(page));
    if (equivalentLocales.length < 2) return;
    equivalentLocales.forEach((key) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = key;
      link.href = new URL(localeHref(key, page), window.location.href).href;
      document.head.appendChild(link);
    });
  }

  function updateCanonicalLink() {
    if (document.querySelector('link[rel="canonical"]')) return;
    const link = document.createElement("link");
    const url = new URL(localeHref(locale, page), window.location.href);
    url.search = "";
    url.hash = "";
    link.rel = "canonical";
    link.href = url.href;
    document.head.appendChild(link);
  }

  renderHeader();
  renderFooter();
  enhanceInteractions();
  updateAlternateLinks();
  updateCanonicalLink();
})();
