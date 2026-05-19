import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.3";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://thithilia.github.io",
  "http://127.0.0.1:8000",
  "http://localhost:8000"
];

function configuredAllowedOrigins() {
  const configured = Deno.env.get("NEWS_ALLOWED_ORIGINS");
  const origins = (configured ? configured.split(",") : DEFAULT_ALLOWED_ORIGINS)
    .map((origin) => origin.trim())
    .filter((origin) => origin !== "*")
    .filter(Boolean);
  return origins.length ? origins : DEFAULT_ALLOWED_ORIGINS;
}

export function corsHeadersFor(req?: Request) {
  const origins = configuredAllowedOrigins();
  const requestOrigin = req?.headers.get("origin") || "";
  const allowedOrigin = origins.includes(requestOrigin) ? requestOrigin : origins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-spaceverse-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}

export const corsHeaders = corsHeadersFor();

export function preflightResponse(req: Request) {
  return new Response("ok", { headers: corsHeadersFor(req) });
}

export function httpError(message: string, status = 500) {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}

export function errorStatus(error: unknown, fallback = 500) {
  const status = (error as { status?: unknown })?.status;
  return typeof status === "number" && status >= 400 && status <= 599 ? status : fallback;
}

export function requirePost(req: Request) {
  if (req.method !== "POST") {
    throw httpError("Method not allowed.", 405);
  }
}

export function parseBoundedInteger(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export function safeHttpUrl(value: string | null | undefined) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch (_) {
    return "";
  }
}

export function safeIsoDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function jsonResponse(body: unknown, status = 200, req?: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeadersFor(req),
      "Content-Type": "application/json"
    }
  });
}

export function requireFunctionSecret(req: Request) {
  const expected = Deno.env.get("NEWS_FUNCTION_SECRET");
  if (!expected) {
    throw httpError("NEWS_FUNCTION_SECRET is required before this function can run.", 500);
  }
  const actual = req.headers.get("x-spaceverse-secret");
  if (actual !== expected) {
    throw httpError("Unauthorized function call.", 401);
  }
}

export function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase service configuration.");
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function normalizeWhitespace(value: string | null | undefined) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function slugify(value: string) {
  return normalizeWhitespace(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 82) || "space-news";
}

export async function sha256(value: string) {
  const input = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function textFrom(parent: Element, selectors: string[]) {
  for (const selector of selectors) {
    const node = parent.querySelector(selector);
    const text = normalizeWhitespace(node?.textContent);
    if (text) return text;
  }
  return "";
}

function attrFrom(parent: Element, selectors: string[], attribute: string) {
  for (const selector of selectors) {
    const node = parent.querySelector(selector);
    const value = node?.getAttribute(attribute);
    if (value) return value.trim();
  }
  return "";
}

export function classifyField(sourceDefault: string, title: string, summary: string) {
  const text = `${title} ${summary}`.toLowerCase();
  if (/\b(exoplanet|galax|cosmolog|black hole|webb|hubble|chandra|supernova|gamma-ray|microlens|star)\b/.test(text)) return "astrophysics";
  if (/\b(remote sensing|earth observation|landsat|sentinel|modis|sar|climate|wildfire|flood|ice|ocean)\b/.test(text)) return "remote_sensing";
  if (/\b(satellite|spacecraft|payload|launcher|orbit|telecommunication|navigation)\b/.test(text)) return "satellite_technology";
  if (/\b(solar wind|heliophysics|magnetosphere|ionosphere|aurora|space weather|plasma|parker solar)\b/.test(text)) return "space_physics";
  return sourceDefault || "general";
}

export async function parseRss(xmlText: string, source: Record<string, string>) {
  const xml = new DOMParser().parseFromString(xmlText, "text/xml");
  const parseError = xml.querySelector("parsererror");
  if (parseError) {
    throw new Error(normalizeWhitespace(parseError.textContent) || "Could not parse RSS XML.");
  }

  const nodes = Array.from(xml.querySelectorAll("item, entry"));
  const items = [];
  for (const node of nodes) {
    const title = textFrom(node, ["title"]);
    const summary = textFrom(node, ["description", "summary", "content", "content\\:encoded"]);
    const atomLink = attrFrom(node, ["link[href]"], "href");
    const rssLink = textFrom(node, ["link", "guid"]);
    const canonicalUrl = safeHttpUrl(atomLink || rssLink);
    if (!title || !canonicalUrl) continue;

    const publishedText = textFrom(node, ["pubDate", "published", "updated", "dc\\:date"]);
    const publishedAt = safeIsoDate(publishedText);
    const imageUrl =
      attrFrom(node, ["media\\:content[url]", "media\\:thumbnail[url]", "enclosure[url]"], "url") ||
      attrFrom(node, ["img[src]"], "src");
    const safeImageUrl = safeHttpUrl(imageUrl);
    const author = textFrom(node, ["author", "dc\\:creator"]);
    const contentHash = await sha256(`${source.source_key}:${canonicalUrl}:${title}`);

    items.push({
      source_id: source.id,
      canonical_url: canonicalUrl,
      title,
      summary,
      author,
      published_at: publishedAt,
      image_url: safeImageUrl || null,
      content_hash: contentHash,
      raw_payload: {
        source_key: source.source_key,
        source_name: source.name,
        homepage_url: source.homepage_url,
        default_field: source.default_field,
        field_guess: classifyField(source.default_field, title, summary),
        title,
        summary,
        canonical_url: canonicalUrl,
        published_at: publishedAt,
        image_url: safeImageUrl || null
      }
    });
  }
  return items;
}

export function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
