import {
  errorStatus,
  jsonResponse,
  parseBoundedInteger,
  parseRss,
  preflightResponse,
  requireFunctionSecret,
  requirePost,
  safeHttpUrl,
  serviceClient
} from "../_shared/news-utils.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflightResponse(req);

  try {
    requirePost(req);
    requireFunctionSecret(req);
    const supabase = serviceClient();
    const limit = parseBoundedInteger(new URL(req.url).searchParams.get("limit"), 12, 1, 25);
    const { data: sources, error: sourceError } = await supabase
      .from("news_sources")
      .select("*")
      .eq("enabled", true)
      .limit(limit);

    if (sourceError) throw sourceError;

    const result = [];
    for (const source of sources || []) {
      try {
        const feedUrl = safeHttpUrl(source.feed_url);
        if (!feedUrl) throw new Error("Source feed URL must be http or https.");
        const response = await fetch(feedUrl, {
          headers: {
            "User-Agent": "Space-Verse news curator/0.1; contact: contact.space-verse@gmail.com"
          }
        });
        if (!response.ok) throw new Error(`Feed returned ${response.status}`);
        const xml = await response.text();
        const items = await parseRss(xml, source);
        if (items.length) {
          const { error } = await supabase
            .from("news_raw_items")
            .upsert(items, { onConflict: "content_hash", ignoreDuplicates: true });
          if (error) throw error;
        }
        result.push({ source: source.source_key, inserted_or_seen: items.length });
      } catch (error) {
        result.push({ source: source.source_key, error: String(error?.message || error) });
      }
    }

    return jsonResponse({ ok: true, result }, 200, req);
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error?.message || error) }, errorStatus(error), req);
  }
});
