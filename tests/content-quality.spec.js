import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const root = process.cwd();
const siteOrigin = "https://thithilia.github.io/New-Space-Verse/";

function listHtmlPages(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "admin" || entry.name === "Not_included") return [];
      return listHtmlPages(fullPath);
    }
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

const publicPages = ["en", "fr", "vi"]
  .flatMap((locale) => listHtmlPages(join(root, locale)));
const allHtmlPages = [join(root, "index.html"), join(root, "404.html"), join(root, "vi", "admin", "news.html"), ...["en", "fr", "vi"]
  .flatMap((locale) => listHtmlPages(join(root, locale)))];

function source(filePath) {
  return readFileSync(filePath, "utf8");
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"))?.[2]?.trim() || "";
}

function metadata(html) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "";
  const descriptionTag = (html.match(/<meta\b[^>]*>/gi) || [])
    .find((tag) => attr(tag, "name").toLowerCase() === "description");
  const canonicalTag = (html.match(/<link\b[^>]*>/gi) || [])
    .find((tag) => attr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical"));
  const robotsTag = (html.match(/<meta\b[^>]*>/gi) || [])
    .find((tag) => attr(tag, "name").toLowerCase() === "robots");
  return {
    title,
    description: descriptionTag ? attr(descriptionTag, "content") : "",
    canonical: canonicalTag ? attr(canonicalTag, "href") : "",
    hasH1: /<h1\b/i.test(html),
    noindex: robotsTag ? attr(robotsTag, "content").toLowerCase().includes("noindex") : false
  };
}

test.describe("public content and SEO guardrails", () => {
  test("public pages have a title, description, canonical URL, and H1", () => {
    const failures = [];

    for (const filePath of publicPages) {
      const path = relative(root, filePath).replaceAll("\\", "/");
      const data = metadata(source(filePath));
      if (!data.title) failures.push(`${path}: missing title`);
      if (data.description.length < 50) failures.push(`${path}: missing or short meta description`);
      if (!data.canonical.startsWith(siteOrigin)) failures.push(`${path}: missing absolute canonical URL`);
      if (!data.hasH1) failures.push(`${path}: missing H1`);
    }

    expect(failures).toEqual([]);
  });

  test("titles are specific and unique within each locale", () => {
    const failures = [];
    const titlesByLocale = new Map();

    for (const filePath of publicPages) {
      const path = relative(root, filePath).replaceAll("\\", "/");
      const locale = path.split("/")[0];
      const title = metadata(source(filePath)).title;
      if (/^Space-Verse Resources$/i.test(title)) failures.push(`${path}: generic title`);

      const pagesForTitle = titlesByLocale.get(locale) || new Map();
      const duplicates = pagesForTitle.get(title) || [];
      duplicates.push(path);
      pagesForTitle.set(title, duplicates);
      titlesByLocale.set(locale, pagesForTitle);
    }

    for (const pagesForTitle of titlesByLocale.values()) {
      for (const [title, paths] of pagesForTitle) {
        if (title && paths.length > 1) failures.push(`duplicate title "${title}": ${paths.join(", ")}`);
      }
    }

    expect(failures).toEqual([]);
  });

  test("public-facing source does not link to the retired repository", () => {
    const files = [...publicPages, join(root, "assets", "site-shell.js")];
    const offenders = files
      .filter((filePath) => source(filePath).includes("github.com/Thithilia/Space-Verse"))
      .map((filePath) => relative(root, filePath).replaceAll("\\", "/"));

    expect(offenders).toEqual([]);
  });

  test("every HTML entry point links to the published favicon", () => {
    const failures = [];

    for (const filePath of allHtmlPages) {
      const html = source(filePath);
      const iconTags = (html.match(/<link\b[^>]*>/gi) || [])
        .filter((tag) => attr(tag, "rel").toLowerCase().split(/\s+/).includes("icon"));
      const href = iconTags.length === 1 ? attr(iconTags[0], "href") : "";
      if (iconTags.length !== 1 || !href || !existsSync(resolve(dirname(filePath), href))) {
        failures.push(relative(root, filePath).replaceAll("\\", "/"));
      }
    }

    expect(failures).toEqual([]);
  });

  test("local links, scripts, styles, and images resolve to tracked files", () => {
    const failures = [];

    for (const filePath of allHtmlPages) {
      const html = source(filePath);
      const references = [...html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi)]
        .map((match) => match[2].replaceAll("&amp;", "&").trim())
        .filter((value) => value && !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value));

      for (const reference of references) {
        const withoutQuery = reference.split(/[?#]/, 1)[0];
        let decoded;
        try {
          decoded = decodeURIComponent(withoutQuery);
        } catch (_) {
          failures.push(`${relative(root, filePath)}: malformed URL ${reference}`);
          continue;
        }

        const target = decoded.startsWith("/New-Space-Verse/")
          ? join(root, decoded.slice("/New-Space-Verse/".length))
          : decoded.startsWith("/")
            ? join(root, decoded.slice(1))
            : resolve(dirname(filePath), decoded);
        const resolvedTarget = decoded.endsWith("/") ? join(target, "index.html") : target;
        if (!existsSync(resolvedTarget)) {
          failures.push(`${relative(root, filePath)} -> ${reference}`);
        }
      }
    }

    expect(failures).toEqual([]);
  });

  test("resource pages do not ship empty spacing or placeholder divider artifacts", () => {
    const resourcePages = listHtmlPages(join(root, "vi", "resources"));
    const failures = [];

    for (const filePath of resourcePages) {
      const html = source(filePath);
      const path = relative(root, filePath).replaceAll("\\", "/");
      if (/<p\b[^>]*>\s*<\/p>/i.test(html)) failures.push(`${path}: empty paragraph`);
      if (/<pre\b[^>]*>\s*<\/pre>/i.test(html)) failures.push(`${path}: empty preformatted block`);
      if (/<div class="circle">\s*\?\s*<\/div>/i.test(html)) failures.push(`${path}: placeholder divider`);
      if (/style="color:\s*blue;?"/i.test(html)) failures.push(`${path}: inline link color`);
    }

    expect(failures).toEqual([]);
  });

  test("sitemap contains every public canonical URL exactly once", () => {
    const locations = [...source(join(root, "sitemap.xml")).matchAll(/<loc>(.*?)<\/loc>/g)]
      .map((match) => match[1].replaceAll("&amp;", "&"));
    const expected = [siteOrigin, ...publicPages
      .map((filePath) => metadata(source(filePath)))
      .filter((data) => !data.noindex)
      .map((data) => data.canonical)];

    expect([...new Set(locations)].sort()).toEqual([...new Set(expected)].sort());
    expect(locations).toHaveLength(new Set(locations).size);
  });
});
