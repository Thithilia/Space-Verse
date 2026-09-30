import paths from './paths.json';

const allowedPaths = new Set(paths);
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dayInVietnam = (date) => new Date(date.getTime() + 7 * 3600000).toISOString().slice(0, 10);
async function authorized(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Basic ')) return false;
  try {
    const supplied = atob(header.slice(6));
    const digest = async (text) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
    const a = await digest(supplied);
    const b = await digest('admin:' + env.ADMIN_PASSWORD);
    return a.reduce((difference, byte, i) => difference | (byte ^ b[i]), 0) === 0;
  } catch { return false; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/collect') {
      if (request.headers.get('Origin') !== env.SITE_ORIGIN) return new Response(null, { status: 403 });
      const headers = { 'Access-Control-Allow-Origin': env.SITE_ORIGIN, 'Vary': 'Origin', 'Cache-Control': 'no-store' };
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
      if (request.method !== 'POST') return new Response(null, { status: 405, headers });
      if (request.headers.get('DNT') === '1' || request.headers.get('Sec-GPC') === '1') return new Response(null, { status: 204, headers });
      const reader = request.body?.getReader();
      if (!reader) return new Response(null, { status: 400, headers });
      let body = '', size = 0;
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1024) { await reader.cancel(); return new Response(null, { status: 413, headers }); }
        body += decoder.decode(value, { stream: true });
      }
      body += decoder.decode();
      let path;
      try { path = JSON.parse(body).path; } catch { return new Response(null, { status: 400, headers }); }
      if (!allowedPaths.has(path)) return new Response(null, { status: 400, headers });
      if (/bot|crawler|spider|headless/i.test(request.headers.get('User-Agent') || '')) return new Response(null, { status: 204, headers });
      try {
        await env.DB.prepare('INSERT INTO daily_views (day, path, views) VALUES (?, ?, 1) ON CONFLICT(day, path) DO UPDATE SET views = views + 1').bind(dayInVietnam(new Date()), path).run();
        return new Response(null, { status: 204, headers });
      } catch { return new Response(null, { status: 503, headers }); }
    }
    if (url.pathname !== '/' || request.method !== 'GET') return new Response('Not found', { status: 404 });
    if (!await authorized(request, env)) return new Response('Đăng nhập bằng tài khoản admin.', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="HEO analytics", charset="UTF-8"', 'Cache-Control': 'no-store' } });
    const days = [7, 30, 90].includes(Number(url.searchParams.get('days'))) ? Number(url.searchParams.get('days')) : 30;
    const now = new Date();
    const end = dayInVietnam(now);
    const start = dayInVietnam(new Date(now.getTime() - (days - 1) * 86400000));
    try {
      const results = await env.DB.batch([
        env.DB.prepare('SELECT day, SUM(views) AS views FROM daily_views WHERE day BETWEEN ? AND ? GROUP BY day ORDER BY day DESC').bind(start, end),
        env.DB.prepare('SELECT path, SUM(views) AS views FROM daily_views WHERE day BETWEEN ? AND ? GROUP BY path ORDER BY views DESC').bind(start, end)
      ]);
      const counts = new Map(results[0].results.map(row => [row.day, row.views]));
      const daily = Array.from({ length: days }, (_, i) => { const day = dayInVietnam(new Date(now.getTime() - i * 86400000)); return { day, views: counts.get(day) || 0 }; });
      const total = daily.reduce((sum, row) => sum + row.views, 0);
      const html = `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Thống kê HEO</title><style>body{font:17px/1.6 system-ui;margin:32px auto;padding:0 20px;max-width:1000px;color:#142c45;background:#fff}a{color:#0052a8;margin-right:16px}table{border-collapse:collapse;width:100%;margin-bottom:36px}td,th{padding:10px;border-bottom:1px solid #ddd;text-align:left;overflow-wrap:anywhere}td:last-child,th:last-child{text-align:right}.total{font-size:40px;font-weight:700}</style><h1>Thống kê HEO</h1><nav><a href="?days=7">7 ngày</a><a href="?days=30">30 ngày</a><a href="?days=90">90 ngày</a></nav><p>${escape(start)} – ${escape(end)} · Giờ Việt Nam</p><div class="total">${total.toLocaleString('vi-VN')} lượt xem</div><p>Đếm lượt mở trang, không phải số người. Tải lại trang được tính thêm lượt; trình chặn theo dõi và bot có thể làm sai lệch số liệu. Chỉ có dữ liệu từ khi bật bộ đếm.</p><h2>Theo trang</h2><table><thead><tr><th>Trang</th><th>Lượt xem</th></tr></thead><tbody>${results[1].results.map(row => `<tr><td>${escape(row.path)}</td><td>${row.views}</td></tr>`).join('') || '<tr><td colspan="2">Chưa có lượt xem.</td></tr>'}</tbody></table><h2>Theo ngày</h2><table><thead><tr><th>Ngày</th><th>Lượt xem</th></tr></thead><tbody>${daily.map(row => `<tr><td>${row.day}</td><td>${row.views}</td></tr>`).join('')}</tbody></table></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'", 'X-Content-Type-Options': 'nosniff' } });
    } catch { return new Response('Không tải được thống kê. Vui lòng thử lại.', { status: 503 }); }
  }
};
