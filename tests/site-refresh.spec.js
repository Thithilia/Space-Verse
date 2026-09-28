import { expect, test } from "@playwright/test";

test("mascots load on their intended pages", async ({ page }) => {
  for (const [path, selector, asset] of [
    ["/vi/index.html", ".home-axiom-intro__mascot", "curiousheo.png"],
    ["/vi/news.html", ".news-sources__mascot", "lookingheo.png"],
    ["/vi/resources.html", ".resource-intro__mascot", "teachheo.png"]
  ]) {
    await page.goto(path);
    const image = page.locator(selector);
    await expect(image).toBeVisible();
    expect(await image.getAttribute("src")).toContain(asset);
    await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBeTruthy();
  }
});

test("research pages list journals before recommended resources", async ({ page }) => {
  for (const [field, count] of [
    ["satellite-technology", 6], ["remote-sensing", 6],
    ["earth-sciences", 8], ["space-physics", 6], ["particle-physics", 7]
  ]) {
    await page.goto(`/vi/fields/${field}.html`);
    const group = page.locator(".field-reference-group");
    await expect(group.locator("h2")).toHaveText(["Các tạp chí khoa học", "Recommended resources"]);
    await expect(group.locator("ul").first().locator("a")).toHaveCount(count);
    expect(await group.locator("ul").nth(1).locator("a").count()).toBeGreaterThanOrEqual(2);
  }
});

test("compact sidebar opens on mobile and tablet", async ({ page }) => {
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/vi/resources/skills.html");
    const disclosure = page.locator("#resource-sidebar details");
    await expect(disclosure).not.toHaveAttribute("open", "");
    await disclosure.locator("summary").click();
    await expect(disclosure).toHaveAttribute("open", "");
    await expect(disclosure.locator(".resource-link").first()).toBeVisible();
  }
});

test("six larger planets rotate without removed controls or legend", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/vi/index.html");
  const system = page.locator(".home-research__stack");
  await system.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(page.locator(".planetary-orbit")).toHaveCount(6);
  await expect(page.locator(".planetary-motion-toggle, .planetary-legend")).toHaveCount(0);
  const orbit = page.locator(".planetary-orbit").first();
  const initial = await orbit.evaluate(el => getComputedStyle(el).transform);
  await expect.poll(() => orbit.evaluate(el => getComputedStyle(el).transform)).not.toBe(initial);
  const size = await page.locator(".home-circle-item").first().evaluate(el => el.getBoundingClientRect().width);
  expect(size).toBeGreaterThan(90);
  const diameters = await page.locator(".planetary-orbit").evaluateAll(elements =>
    elements.map(el => parseFloat(el.style.getPropertyValue("--orbit"))));
  expect(diameters).toEqual([12, 28, 44, 60, 76, 92]);
  expect(errors).toEqual([]);
});
