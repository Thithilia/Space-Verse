import { expect, test } from "@playwright/test";

const pages = [
  { path: "/vi/index.html", title: /Space-Verse/, checks: [[".home-circle-item", 4]] },
  { path: "/vi/about.html", title: /Space-Verse/ },
  { path: "/vi/disclaimer.html", title: /Space-Verse/ },
  { path: "/vi/guide.html", title: /Hướng dẫn/, checks: [[".program-list a", 5]] },
  { path: "/vi/news.html", title: /Tin/, checks: [[".news-toolbar", 1], ["[data-news-root]", 1]] },
  { path: "/vi/news.html?demo=1", title: /Tin/, checks: [[".news-card", 10], [".news-card__media img", 10]] },
  { path: "/vi/news/article.html?slug=demo-webb-exoplanet-atmosphere&demo=1", title: /Space-Verse/, checks: [[".news-article", 1]] },
  { path: "/vi/news/article.html?slug=test", title: /Tin/, checks: [[".news-state", 1]] },
  { path: "/vi/admin/news.html", title: /Tin/, checks: [["input[name='email']", 1]] },
  { path: "/vi/research.html", title: /Space-Verse/, checks: [[".research-card", 4]] },
  {
    path: "/vi/fields/astrophysics-&-cosmology.html",
    title: /Space-Verse/,
    checks: [["#astro-field-list-title", 1], [".atlas-section", 10], [".field-link-list--atlas li", 100], [".field-link-list--atlas a[href]", 3]]
  },
  {
    path: "/vi/fields/satellite-technology.html",
    title: /Space-Verse/,
    checks: [[".mission-scale", 1], [".cosmic-node", 6]]
  },
  {
    path: "/vi/fields/remote-sensing.html",
    title: /Space-Verse/,
    checks: [[".mission-scale", 1], [".cosmic-node", 7]]
  },
  {
    path: "/vi/fields/space-physics.html",
    title: /Space-Verse/,
    checks: [[".space-weather-map", 1], [".space-weather-node", 6]]
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
  { path: "/vi/opportunities.html", title: /Space-Verse/ },
  { path: "/vi/opportunities/graduate-programs.html", title: /Space-Verse/ },
  { path: "/vi/opportunities/internships.html", title: /Space-Verse/ },
  { path: "/vi/opportunities/scholarships.html", title: /Space-Verse/ }
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

    const menuToggle = page.locator(".menu-toggle");
    await expect(menuToggle).toHaveCount(1);
    await expect(menuToggle).toHaveAttribute("aria-controls", "site-menu-panel");
    await expect(menuToggle).toHaveAttribute("aria-expanded", "false");
    await menuToggle.click();

    await expect(page.locator(".site-header[data-menu-open='true']")).toHaveCount(1);
    await expect(menuToggle).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator(".site-menu-panel");
    await expect(panel).toBeVisible();
    await expect(panel.locator('a[href$="/vi/news.html"]')).toBeVisible();
    await expect(panel.locator('a[href$="/vi/resources.html"]')).toBeVisible();

    const researchTrigger = panel.locator(".nav-item.has-submenu").filter({ has: page.locator('a[href$="/vi/fields/space-physics.html"]') }).locator("button");
    await expect(researchTrigger).toHaveAttribute("aria-expanded", "false");
    await researchTrigger.click();
    await expect(researchTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(panel.locator('a[href$="/vi/fields/astrophysics-&-cosmology.html"]')).toBeVisible();
    await expect(panel.locator('a[href$="/vi/fields/space-physics.html"]')).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(researchTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(researchTrigger).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(menuToggle).toHaveAttribute("aria-expanded", "false");
    await expect(menuToggle).toBeFocused();
  });

  test("skip link and Vietnamese footer labels are available", async ({ page }) => {
    await page.goto("/vi/index.html", { waitUntil: "domcontentloaded" });

    const skipLink = page.locator(".skip-link");
    await expect(skipLink).toHaveAttribute("href", "#main-content");
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.locator(".site-footer__primary-links")).toContainText("Tin tức");
    await expect(page.locator(".site-footer__primary-links")).toContainText("Tài nguyên");
    await expect(page.locator(".site-footer__secondary-links")).toContainText("Về chúng tôi");
    await expect(page.locator(".site-footer__secondary-links a[href='https://github.com/Thithilia/New-Space-Verse']")).toHaveCount(1);
  });

  test("language choice is remembered for the root redirect", async ({ page }) => {
    await page.goto("/vi/index.html", { waitUntil: "domcontentloaded" });
    await page.locator(".menu-toggle").click();
    await page.locator(".lang-trigger").click();
    await page.locator('.lang-menu a[data-locale="en"]').click();

    await expect(page).toHaveURL(/\/en\/index\.html$/);
    await expect.poll(() => page.evaluate(() => localStorage.getItem("site_lang"))).toBe("en");
  });

  test("news page loads the safe browser config without asset failures", async ({ page }) => {
    const failedPaths = [];
    page.on("response", (response) => {
      if (response.status() >= 400) failedPaths.push(new URL(response.url()).pathname);
    });

    await page.goto("/vi/news.html", { waitUntil: "networkidle" });
    expect(failedPaths).toEqual([]);
    await expect.poll(() => page.evaluate(() => window.SpaceVerseNewsConfig)).toEqual({
      supabaseUrl: "",
      supabaseAnonKey: "",
      demoMode: false
    });
    await expect(page.locator("[data-news-root] .news-state")).toContainText("Mục Tin tức chưa mở trong bản beta");
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
      "/vi/about.html",
      "/vi/guide.html",
      "/vi/news.html",
      "/vi/research.html",
      "/vi/resources.html",
      "/vi/fields/astrophysics-&-cosmology.html",
      "/vi/fields/satellite-technology.html",
      "/vi/fields/remote-sensing.html",
      "/vi/fields/space-physics.html"
    ];
    const internalPaths = new Set();

    for (const path of keyPages) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const hrefs = await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.href));
      for (const href of hrefs) {
        const url = new URL(href);
        if (url.origin !== new URL(page.url()).origin) continue;
        if (!url.pathname.startsWith("/vi/") && !url.pathname.startsWith("/assets/")) continue;
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
      const broken = await page.locator("img").evaluateAll((images) =>
        images
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute("src"))
      );
      expect(broken, `${path} should not contain broken images`).toEqual([]);
    }
  });
});
