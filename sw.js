/* OnsAms offline cache (version afd0f866a2). Pages: network first, so updates arrive; fonts and the
   Preact bundle: cache first. Font files are precached on install so the app also opens offline. */
const CACHE = 'onsams-afd0f866a2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png'];
const EXTERNAL = ["https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700;800&display=swap"];
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE).catch(() => {});
    for (const u of EXTERNAL) {
      try {
        const r = await fetch(u, { mode: 'cors' }); await c.put(u, r.clone());
        if (u.includes('fonts.googleapis.com')) {
          const css = await r.text();
          for (const m of css.matchAll(/url\((https:[^)]+)\)/g)) { try { const f = await fetch(m[1], { mode: 'cors' }); await c.put(m[1], f); } catch (x) {} }
        }
      } catch (x) {}
    }
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // no-cache: revalidate with the server (a cheap 304), so a new publish shows up at once instead of
    // after Pages' 10-minute browser cache. A navigate-mode Request can't take init options, so fetch by URL.
    const fresh = req.mode === 'navigate'
      ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then((r) => (r.redirected ? fetch(req) : r))
      : fetch(req, { cache: 'no-cache' });
    e.respondWith(fresh.then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'))));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$|cdn\.jsdelivr\.net$/.test(url.host)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return r; })));
  }
});
