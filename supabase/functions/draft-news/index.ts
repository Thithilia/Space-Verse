import {
  errorStatus,
  jsonResponse,
  parseBoundedInteger,
  preflightResponse,
  requireFunctionSecret,
  requirePost,
  serviceClient,
  slugify
} from "../_shared/news-utils.ts";

const ARTICLE_SCHEMA = {
  type: "object",
  properties: {
    title_vi: { type: "string", minLength: 12 },
    summary_vi: { type: "string", minLength: 80 },
    why_it_matters_vi: { type: "string", minLength: 80 },
    body_vi: { type: "string", minLength: 180 },
    field: {
      type: "string",
      enum: ["astrophysics", "satellite_technology", "remote_sensing", "space_physics", "opportunities", "general"]
    },
    tags: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 8
    },
    image_credit: { type: "string" },
    image_source_url: { type: "string" }
  },
  required: ["title_vi", "summary_vi", "why_it_matters_vi", "body_vi", "field", "tags", "image_credit", "image_source_url"],
  additionalProperties: false
};

function extractResponseText(payload: any) {
  if (payload.output_text) return payload.output_text;
  const chunks = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) chunks.push(content.text);
      if (content.type === "text" && content.text) chunks.push(content.text);
    }
  }
  return chunks.join("");
}

async function createDraft(rawItem: any) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY.");
  const model = Deno.env.get("OPENAI_MODEL") || "gpt-5-mini";

  const source = rawItem.news_sources;
  const input = `
Bạn là biên tập viên khoa học của Space-Verse. Viết bản tin tiếng Việt dựa trên metadata bên dưới.

Quy tắc:
- Không dịch nguyên văn và không copy đoạn dài từ nguồn.
- Không bịa dữ kiện ngoài metadata.
- Viết cho học sinh, sinh viên Việt Nam quan tâm đến khoa học vũ trụ.
- Luôn dẫn người đọc về bài gốc.
- body_vi gồm 2-4 đoạn, mỗi đoạn cách nhau bằng một dòng trống.

Nguồn: ${source?.name || ""}
URL nguồn: ${rawItem.canonical_url}
Ngày nguồn: ${rawItem.published_at || ""}
Tiêu đề gốc: ${rawItem.title}
Tóm tắt gốc: ${rawItem.summary || ""}
Lĩnh vực gợi ý: ${rawItem.raw_payload?.field_guess || source?.default_field || "general"}
Ảnh gốc: ${rawItem.image_url || ""}
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input,
      text: {
        format: {
          type: "json_schema",
          name: "spaceverse_news_draft",
          strict: true,
          schema: ARTICLE_SCHEMA
        }
      }
    })
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || `OpenAI returned ${response.status}`);
  const text = extractResponseText(payload);
  const draft = JSON.parse(text);
  return draft;
}

function shortRawId(rawItem: any) {
  return String(rawItem.id || "").replaceAll("-", "").slice(0, 8) || "daily";
}

function createArticleRow(rawItem: any, draft: any) {
  const now = new Date().toISOString();
  const baseSlug = slugify(draft.title_vi).slice(0, 72).replace(/-+$/g, "") || "space-news";
  const datePrefix = rawItem.published_at ? rawItem.published_at.slice(0, 10) : now.slice(0, 10);
  const slug = `${datePrefix}-${baseSlug}-${shortRawId(rawItem)}`;
  return {
    raw_item_id: rawItem.id,
    source_id: rawItem.source_id,
    status: "draft",
    slug,
    title_vi: draft.title_vi,
    summary_vi: draft.summary_vi,
    why_it_matters_vi: draft.why_it_matters_vi,
    body_vi: draft.body_vi,
    source_name: rawItem.news_sources?.name || "Nguồn chính thức",
    source_url: rawItem.canonical_url,
    source_published_at: rawItem.published_at,
    field: draft.field,
    tags: draft.tags,
    image_url: rawItem.image_url,
    image_credit: draft.image_credit,
    image_source_url: draft.image_source_url,
    published_at: null,
    reviewed_at: null
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflightResponse(req);

  try {
    requirePost(req);
    requireFunctionSecret(req);
    const supabase = serviceClient();
    const params = new URL(req.url).searchParams;
    const limit = parseBoundedInteger(params.get("limit"), 5, 1, 10);

    const { data: rawItems, error } = await supabase
      .from("news_raw_items")
      .select("*, news_sources(*)")
      .eq("draft_status", "pending")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) throw error;

    const result = [];
    for (const rawItem of rawItems || []) {
      try {
        const existing = await supabase
          .from("news_articles")
          .select("id")
          .eq("raw_item_id", rawItem.id)
          .maybeSingle();
        if (existing.data) {
          await supabase.from("news_raw_items").update({ draft_status: "drafted" }).eq("id", rawItem.id);
          result.push({ raw_item_id: rawItem.id, skipped: "already drafted" });
          continue;
        }

        const draft = await createDraft(rawItem);
        const articleRow = createArticleRow(rawItem, draft);
        const { error: insertError } = await supabase.from("news_articles").insert(articleRow);
        if (insertError) throw insertError;

        await supabase.from("news_raw_items").update({ draft_status: "drafted", draft_error: null }).eq("id", rawItem.id);
        result.push({ raw_item_id: rawItem.id, slug: articleRow.slug, status: articleRow.status });
      } catch (error) {
        await supabase.from("news_raw_items").update({
          draft_status: "error",
          draft_error: String(error?.message || error)
        }).eq("id", rawItem.id);
        result.push({ raw_item_id: rawItem.id, error: String(error?.message || error) });
      }
    }

    return jsonResponse({ ok: true, result }, 200, req);
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error?.message || error) }, errorStatus(error), req);
  }
});
