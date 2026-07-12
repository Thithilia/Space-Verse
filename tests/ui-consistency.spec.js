import { expect, test } from "@playwright/test";

test.describe("UI consistency guardrails", () => {
  test("news grid adapts through the intended column steps", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/vi/news.html?demo=1", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".news-card")).toHaveCount(10);

    const cases = [
      { width: 1440, columns: 5 },
      { width: 1024, columns: 3 },
      { width: 768, columns: 2 },
      { width: 390, columns: 1 }
    ];

    for (const item of cases) {
      await page.setViewportSize({ width: item.width, height: 900 });
      const columns = await page.locator(".news-list").evaluate((list) =>
        getComputedStyle(list).gridTemplateColumns.split(" ").filter(Boolean).length
      );
      expect(columns, `${item.width}px news grid`).toBe(item.columns);
    }
  });

  test("resource catalog is grouped and puts reading content first on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/vi/resources/profile-building.html", { waitUntil: "domcontentloaded" });

    await expect(page.locator(".resource-link")).toHaveCount(18);
    await expect(page.locator(".resource-list__title")).toHaveText(["Nền tảng", "Chuyên sâu"]);
    await expect(page.getByRole("heading", { level: 2, name: "Tài nguyên học tập" })).toBeVisible();
    await expect(page.locator('.resource-list[aria-label="Tài nguyên học tập"]')).toBeVisible();
    await expect(page.locator('.resource-link[aria-current="page"]')).toHaveCount(1);

    const palette = await page.evaluate(() => ({
      body: getComputedStyle(document.body).backgroundColor,
      main: getComputedStyle(document.querySelector("main")).backgroundColor,
      band: getComputedStyle(document.querySelector(".resource-top-band")).backgroundColor,
      text: getComputedStyle(document.querySelector(".resource-detail")).color,
      activeLink: getComputedStyle(document.querySelector('.resource-link[aria-current="page"]')).color,
      groupLabel: getComputedStyle(document.querySelector(".resource-list__title")).color
    }));
    expect(palette).toEqual({
      body: "rgb(255, 255, 255)",
      main: "rgb(255, 255, 255)",
      band: "rgb(238, 244, 255)",
      text: "rgb(18, 32, 51)",
      activeLink: "rgb(20, 86, 193)",
      groupLabel: "rgb(15, 118, 110)"
    });

    const positions = await page.locator(".resource-layout .page-grid").evaluate((grid) => ({
      contentTop: grid.querySelector(".content-stack").getBoundingClientRect().top,
      sidebarTop: grid.querySelector("aside").getBoundingClientRect().top
    }));
    expect(positions.contentTop).toBeLessThan(positions.sidebarTop);

    await page.goto("/vi/resources.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#resource-overview .resource-overview-link")).toHaveCount(18);

    await page.goto("/vi/resources/maths.html", { waitUntil: "domcontentloaded" });
    const textDecorations = await page.evaluate(() => ({
      reference: getComputedStyle(document.querySelector(".resource-detail pre a")).textDecorationLine,
      navigation: getComputedStyle(document.querySelector(".resource-link")).textDecorationLine
    }));
    expect(textDecorations.reference).toContain("underline");
    expect(textDecorations.navigation).toBe("none");
  });

  test("navigation panel remains inside a short viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 520 });
    await page.goto("/vi/index.html", { waitUntil: "domcontentloaded" });
    await page.locator(".menu-toggle").click();

    const panel = page.locator(".site-menu-panel");
    await expect(panel).toBeVisible();
    await panel.getByRole("button", { name: "Nghiên cứu" }).click();
    const bounds = await panel.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        viewportHeight: innerHeight,
        overflowY: getComputedStyle(element).overflowY,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight
      };
    });
    expect(bounds.top).toBeGreaterThanOrEqual(0);
    expect(bounds.bottom).toBeLessThanOrEqual(bounds.viewportHeight + 1);
    expect(bounds.overflowY).toBe("auto");
    expect(bounds.scrollHeight).toBeGreaterThan(bounds.clientHeight);
  });

  test("visible heading levels and wide field atlas stay aligned", async ({ page }) => {
    await page.goto("/vi/news.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".news-toolbar h1")).toBeVisible();

    await page.goto("/vi/research.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".research-card h2")).toHaveCount(4);
    await expect(page.locator(".research-card h3")).toHaveCount(0);

    for (const path of [
      "/en/index.html", "/en/about.html", "/en/projects.html", "/en/contact.html",
      "/fr/index.html", "/fr/about.html", "/fr/projects.html", "/fr/contact.html"
    ]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator(".info-card h2"), path).toHaveCount(2);
      await expect(page.locator(".info-card h3"), path).toHaveCount(0);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    for (const path of [
      "/vi/fields/astrophysics-&-cosmology.html",
      "/vi/fields/satellite-technology.html",
      "/vi/fields/remote-sensing.html",
      "/vi/fields/space-physics.html"
    ]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator(".field-atlas > .atlas-heading h2"), path).toHaveCount(1);
      const widths = await page.locator(".field-page__inner").evaluate((inner) => ({
        inner: inner.getBoundingClientRect().width,
        lead: inner.querySelector(".field-copy--lead").getBoundingClientRect().width
      }));
      expect(widths.inner, path).toBeGreaterThan(widths.lead + 100);
    }
  });
});
