import { expect, test } from "@playwright/test";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";

const listHtmlPages = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "Not_included" ? [] : listHtmlPages(fullPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });

const responsivePages = listHtmlPages(join(process.cwd(), "vi"))
  .map((filePath) => `/${relative(process.cwd(), filePath).replaceAll("\\", "/")}`)
  .sort();

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 }
];

test.describe("responsive layout checks", () => {
  for (const viewport of viewports) {
    for (const path of responsivePages) {
      test(`${path} has no horizontal overflow at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(path);

        await expect(page.locator(".site-header")).toHaveCount(1);
        await expect(page.locator(".site-footer")).toHaveCount(1);

        const metrics = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        }));

        expect(
          metrics.scrollWidth,
          `${path} should not create horizontal overflow at ${viewport.name}`
        ).toBeLessThanOrEqual(metrics.clientWidth + 1);
      });
    }
  }
});
