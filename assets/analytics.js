// Set this to the deployed Worker URL. Empty means collection is disabled.
const endpoint = 'https://heo-analytics.heo-thithilia.workers.dev';
if (endpoint && location.origin === 'https://thithilia.github.io' && location.pathname.startsWith('/Space-Verse/') && navigator.doNotTrack !== '1' && !navigator.globalPrivacyControl) {
  let sent = false;
  const record = () => {
    if (sent || document.visibilityState !== 'visible') return;
    sent = true;
    let path = location.pathname;
    if (path.endsWith('/')) path += 'index.html';
    fetch(endpoint + '/collect', { method: 'POST', body: JSON.stringify({ path }), headers: { 'Content-Type': 'text/plain' }, credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true }).catch(() => {});
    document.removeEventListener('visibilitychange', record);
  };
  record();
  if (!sent) document.addEventListener('visibilitychange', record);
}
