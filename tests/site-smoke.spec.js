import { expect, test } from "@playwright/test";

const pages = [
  { path: "/vi/index.html", title: /Space-Verse/, checks: [[".home-circle-item", 4]] },
  { path: "/en/index.html", title: /Space-Verse/, checks: [[".home-circle-item", 4], [".home-dual__cell", 3]] },
  { path: "/fr/index.html", title: /Space-Verse/, checks: [[".home-circle-item", 4], [".home-dual__cell", 3]] },
  { path: "/vi/about.html", title: /Space-Verse/ },
  { path: "/vi/disclaimer.html", title: /Space-Verse/ },
  { path: "/vi/news.html", title: /Tin/, checks: [[".news-toolbar", 1], ["[data-news-root]", 1]] },
  { path: "/vi/news.html?demo=1", title: /Tin/, checks: [[".news-card", 10], [".news-card__media img", 10]] },
  { path: "/vi/news/article.html?slug=demo-webb-exoplanet-atmosphere&demo=1", title: /Space-Verse/, checks: [[".news-article", 1]] },
  { path: "/vi/news/article.html?slug=test", title: /Tin/, checks: [[".news-state", 1]] },
  { path: "/vi/admin/news.html", title: /Tin/, checks: [["input[name='email']", 1]] },
  { path: "/vi/research.html", title: /Space-Verse/, checks: [[".resource-sidebar", 1], ["#research-sidebar .resource-link", 5], ["#research-overview .resource-overview-link", 5]] },
  {
    path: "/vi/fields/astrophysics-&-cosmology.html",
    title: /Space-Verse/,
    checks: [[".resource-sidebar", 1], ["#research-sidebar .resource-link", 5], ["#astro-categories-title", 1], [".taxonomy-group", 6], [".taxonomy-code", 6]]
  },
  {
    path: "/vi/fields/satellite-technology.html",
    title: /Space-Verse/,
    checks: [[".resource-sidebar", 1], ["#research-sidebar .resource-link", 5], [".mission-scale", 1], [".cosmic-node", 6]]
  },
  {
    path: "/vi/fields/remote-sensing.html",
    title: /Space-Verse/,
    checks: [[".resource-sidebar", 1], ["#research-sidebar .resource-link", 5], [".mission-scale", 1], [".cosmic-node", 7]]
  },
  {
    path: "/vi/fields/remote-sensing-&-earth-sciences.html",
    title: /Space-Verse/,
    checks: [[".resource-sidebar", 1], ["#research-sidebar .resource-link", 5], [".field-copy", 7]]
  },
  {
    path: "/vi/fields/space-physics.html",
    title: /Space-Verse/,
    checks: [[".resource-sidebar", 1], ["#research-sidebar .resource-link", 5], [".space-weather-map", 1], [".space-weather-node", 6]]
  },
  {
    path: "/vi/resources.html",
    title: /Space-Verse/,
    checks: [[".resource-sidebar", 1], [".resource-link", 18], [".resource-intro", 1]]
  },
  {
    path: "/vi/resources/profile-building.html",
    title: /Space-Verse/,
    checks: [[".resource-sidebar", 1], [".resource-link", 18], [".resource-detail", 1]]
  },
  { path: "/vi/opportunities.html", title: /Space-Verse/, checks: [[".resource-sidebar", 1], ["#opportunity-sidebar .resource-link", 3], ["#opportunity-overview .resource-overview-link", 3]] },
  { path: "/vi/opportunities/graduate-programs.html", title: /Space-Verse/, checks: [[".resource-sidebar", 1], ["#opportunity-sidebar .resource-link", 3], [".resource-detail", 1]] },
  { path: "/vi/opportunities/internships.html", title: /Space-Verse/, checks: [[".resource-sidebar", 1], ["#opportunity-sidebar .resource-link", 3], [".resource-detail", 1]] },
  { path: "/vi/opportunities/scholarships.html", title: /Space-Verse/, checks: [[".resource-sidebar", 1], ["#opportunity-sidebar .resource-link", 3], [".resource-detail", 1], [".scholarship-table", 1], [".scholarship-table thead th", 4], [".scholarship-table tbody tr", 17]] }
];

test.describe("site smoke checks", () => {
  for (const pageCase of pages) {
    test(`${pageCase.path} renders expected shell and content`, async ({ page }) => {
      const response = await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });
      expect(response?.ok(), `${pageCase.path} should return HTTP 2xx/3xx`).toBeTruthy();

      await expect(page).toHaveTitle(pageCase.title);
      await expect(page.locator(".site-header")).toHaveCount(1);
      await expect(page.locator(".site-footer")).toHaveCount(1);

      for (const [selector, minimum] of pageCase.checks || []) {
        await expect.poll(async () => page.locator(selector).count(), {
          message: `${pageCase.path} should render at least ${minimum} element(s) for ${selector}`
        }).toBeGreaterThanOrEqual(minimum);
      }
    });
  }

  test("hamburger navigation opens and exposes major links", async ({ page }) => {
    await page.goto("/vi/index.html", { waitUntil: "domcontentloaded" });

    await expect(page.locator(".menu-toggle")).toHaveCount(1);
    await page.locator(".menu-toggle").click();

    await expect(page.locator(".site-header[data-menu-open='true']")).toHaveCount(1);
    const panel = page.locator(".site-menu-panel");
    await expect(panel).toBeVisible();
    await expect(panel.locator('a[href$="/vi/news.html"]')).toBeVisible();
    await expect(panel.locator('a[href$="/vi/resources.html"]')).toBeVisible();

    await panel.locator(".nav-item.has-submenu").filter({ has: page.locator('a[href$="/vi/fields/space-physics.html"]') }).locator("button").click();
    await expect(panel.locator('a[href$="/vi/fields/astrophysics-&-cosmology.html"]')).toBeVisible();
    await expect(panel.locator('a[href$="/vi/fields/space-physics.html"]')).toBeVisible();
  });

  test("shared header and footer render the supplied Space-Verse logo", async ({ page }) => {
    for (const path of ["/vi/index.html", "/vi/fields/astrophysics/exoplanets.html"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      for (const selector of [".brand__mark img", ".site-footer__mark img"]) {
        const logo = page.locator(selector);
        await expect(logo).toHaveCount(1);
        await expect(logo).toHaveAttribute("src", /assets\/space-verse-logo\.png$/);
        await expect.poll(() => logo.evaluate((image) => image.complete && image.naturalWidth > 0)).toBeTruthy();
      }
    }
  });

  test("language switcher renders image flags instead of regional letter glyphs", async ({ page }) => {
    await page.goto("/vi/index.html", { waitUntil: "domcontentloaded" });
    await page.locator(".menu-toggle").click();
    await page.locator(".lang-trigger").click();

    const flags = page.locator(".lang-trigger .lang-flag, .lang-menu .lang-flag");
    await expect(flags).toHaveCount(4);
    await expect(page.locator('.lang-menu .lang-flag[src$="/assets/flags/vi.svg"]')).toHaveCount(1);
    await expect(page.locator('.lang-menu .lang-flag[src$="/assets/flags/gb.svg"]')).toHaveCount(1);
    await expect(page.locator('.lang-menu .lang-flag[src$="/assets/flags/fr.svg"]')).toHaveCount(1);

    for (const flag of await flags.all()) {
      await expect.poll(() => flag.evaluate((image) => image.complete && image.naturalWidth > 0)).toBeTruthy();
    }
  });

  test("English and French home pages match the translated home experience", async ({ page }) => {
    const locales = [
      {
        path: "/en/index.html",
        lang: "en",
        heading: "Explore research across space and the Universe.",
        field: "Astrophysics and cosmology",
        section: "Academic resources"
      },
      {
        path: "/fr/index.html",
        lang: "fr",
        heading: "Explorez les domaines de recherche sur l’espace et l’Univers.",
        field: "Astrophysique et cosmologie",
        section: "Ressources académiques"
      }
    ];

    for (const locale of locales) {
      await page.goto(locale.path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("lang", locale.lang);
      await expect(page.locator("body")).toHaveAttribute("data-locale", locale.lang);
      await expect(page.locator(".home-research__label")).toHaveText(locale.heading);
      await expect(page.locator(".home-circle-item__title").first()).toHaveText(locale.field);
      await expect(page.locator(".home-dual__cell .section-title").nth(1)).toHaveText(locale.section);
      await expect(page.locator(".home-circle-item")).toHaveCount(4);
      await expect(page.locator(".home-dual__cell")).toHaveCount(3);
      await expect(page.locator(".home-circle-item img")).toHaveCount(4);
    }
  });

  test("website guide page and navigation entry are removed", async ({ page, request }) => {
    const guideResponse = await request.get("/vi/guide.html");
    expect(guideResponse.status()).toBe(404);

    await page.goto("/vi/index.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator('a[href*="guide.html"]')).toHaveCount(0);
    await expect(page.getByText("Hướng dẫn sử dụng website", { exact: true })).toHaveCount(0);
    await expect(page.locator(".home-dual__cell")).toHaveCount(3);
  });

  test("main content connects directly to the gray footer without a tinted gap", async ({ page }) => {
    const paths = [
      "/vi/resources.html",
      "/vi/research.html",
      "/vi/opportunities.html",
      "/vi/news.html"
    ];

    for (const path of paths) {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      const colors = await page.evaluate(() => ({
        main: getComputedStyle(document.querySelector(".site-main")).backgroundColor,
        footer: getComputedStyle(document.querySelector(".site-footer")).backgroundColor
      }));

      expect(colors.main).toBe("rgb(255, 255, 255)");
      expect(colors.footer).toBe("rgb(245, 245, 245)");
    }
  });

  test("breadcrumbs are removed across sidebar and detail page layouts", async ({ page }) => {
    const paths = [
      "/vi/resources/profile-building.html",
      "/vi/opportunities/graduate-programs.html",
      "/vi/fields/astrophysics-&-cosmology.html",
      "/vi/fields/astrophysics/exoplanets.html",
      "/vi/news.html",
      "/vi/news/article.html?slug=demo-webb-exoplanet-atmosphere&demo=1"
    ];

    for (const path of paths) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeHidden();
    }

    await page.goto("/vi/news.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".hero-banner")).toBeHidden();
  });

  test("decorative eyebrow labels are removed across page types", async ({ page }) => {
    const paths = [
      "/vi/research.html",
      "/vi/opportunities.html",
      "/vi/fields/astrophysics-&-cosmology.html",
      "/vi/news.html",
      "/en/about.html"
    ];

    for (const path of paths) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator(".eyebrow")).toBeHidden();
    }
  });

  test("top-level field page titles stay on one line without overflowing mobile", async ({ page }) => {
    const paths = [
      "/vi/fields/astrophysics-&-cosmology.html",
      "/vi/fields/satellite-technology.html",
      "/vi/fields/remote-sensing.html",
      "/vi/fields/remote-sensing-&-earth-sciences.html",
      "/vi/fields/space-physics.html"
    ];

    await page.setViewportSize({ width: 1280, height: 800 });

    for (const path of paths) {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      const desktopTitle = await page.locator("h1.section-title").evaluate((title) => {
        const style = getComputedStyle(title);
        return {
          height: title.getBoundingClientRect().height,
          lineHeight: Number.parseFloat(style.lineHeight),
          whiteSpace: style.whiteSpace
        };
      });

      expect(desktopTitle.whiteSpace).toBe("nowrap");
      expect(desktopTitle.height).toBeLessThanOrEqual(desktopTitle.lineHeight * 1.1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
    }

    await page.setViewportSize({ width: 390, height: 844 });

    for (const path of paths) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect.poll(() => page.locator("h1.section-title").evaluate((title) => getComputedStyle(title).whiteSpace)).toBe("normal");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
    }
  });

  test("research sidebar links open the selected field detail", async ({ page }) => {
    await page.goto("/vi/research.html", { waitUntil: "domcontentloaded" });

    await page.locator("#research-sidebar .resource-link", { hasText: "Viễn thám và khoa học Trái Đất" }).click();

    await expect(page).toHaveURL(/\/vi\/fields\/remote-sensing-&-earth-sciences\.html$/);
    await expect(page.locator("h1")).toContainText("Viễn thám và khoa học Trái Đất");
    await expect(page.locator("#research-sidebar .resource-link.is-active")).toContainText("Viễn thám và khoa học Trái Đất");
  });

  test("opportunity sidebar links open the selected detail", async ({ page }) => {
    await page.goto("/vi/opportunities.html", { waitUntil: "domcontentloaded" });

    await page.locator("#opportunity-sidebar .resource-link", { hasText: "Cơ hội internship" }).click();

    await expect(page).toHaveURL(/\/vi\/opportunities\/internships\.html$/);
    await expect(page.locator("h1")).toContainText("Cơ hội internship");
    await expect(page.locator("#opportunity-sidebar .resource-link.is-active")).toContainText("Cơ hội internship");
  });

  test("scholarship catalogue keeps four columns and scrolls locally on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/vi/opportunities/scholarships.html", { waitUntil: "domcontentloaded" });

    await expect(page.locator(".scholarship-table thead th")).toHaveCount(4);
    await expect(page.locator(".scholarship-table tbody tr")).toHaveCount(17);
    await expect(page.locator(".scholarship-table tbody a[target='_blank']")).toHaveCount(17);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "domcontentloaded" });

    const overflow = await page.evaluate(() => {
      const wrapper = document.querySelector(".scholarship-table-wrap");
      return {
        local: wrapper.scrollWidth > wrapper.clientWidth,
        page: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });

    expect(overflow.local).toBeTruthy();
    expect(overflow.page).toBeFalsy();
  });

  test("news demo page uses a five by two card grid on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/vi/news.html?demo=1", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".news-card")).toHaveCount(10);

    const grid = await page.locator(".news-card").evaluateAll((cards) => {
      const rects = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return {
          top: Math.round(rect.top),
          width: Math.round(rect.width),
          imageCount: card.querySelectorAll(".news-card__media img").length
        };
      });
      const firstTop = rects[0]?.top ?? 0;
      return {
        count: rects.length,
        firstRowCount: rects.filter((rect) => Math.abs(rect.top - firstTop) <= 2).length,
        rowCount: new Set(rects.map((rect) => rect.top)).size,
        allHaveImages: rects.every((rect) => rect.imageCount === 1),
        equalWidth: rects.every((rect) => Math.abs(rect.width - rects[0].width) <= 2)
      };
    });

    expect(grid).toEqual({
      count: 10,
      firstRowCount: 5,
      rowCount: 2,
      allHaveImages: true,
      equalWidth: true
    });
  });

  test("internal links on key pages do not point to missing pages", async ({ page, request }) => {
    const keyPages = [
      "/vi/index.html",
      "/en/index.html",
      "/fr/index.html",
      "/vi/about.html",
      "/vi/news.html",
      "/vi/research.html",
      "/vi/resources.html",
      "/vi/fields/astrophysics-&-cosmology.html",
      "/vi/fields/satellite-technology.html",
      "/vi/fields/remote-sensing.html",
      "/vi/fields/remote-sensing-&-earth-sciences.html",
      "/vi/fields/space-physics.html"
    ];
    const internalPaths = new Set();

    for (const path of keyPages) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const hrefs = await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.href));
      for (const href of hrefs) {
        const url = new URL(href);
        if (url.origin !== new URL(page.url()).origin) continue;
        if (!["/vi/", "/en/", "/fr/", "/assets/"].some((prefix) => url.pathname.startsWith(prefix))) continue;
        internalPaths.add(`${url.pathname}${url.search}`);
      }
    }

    for (const path of internalPaths) {
      const response = await request.get(path);
      expect(response.status(), `${path} should not be missing`).toBeLessThan(400);
    }
  });

  test("images on key pages are loaded", async ({ page }) => {
    for (const path of ["/vi/index.html", "/vi/research.html"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.locator(".menu-toggle").click();
      await page.locator(".lang-trigger").click();

      await expect.poll(() =>
        page.locator("img").evaluateAll((images) =>
          images
            .filter((image) => !image.complete || image.naturalWidth === 0)
            .map((image) => image.getAttribute("src"))
        )
      ).toEqual([]);
    }
  });
});
