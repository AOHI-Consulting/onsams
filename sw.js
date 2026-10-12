/* OnsAms offline cache (version 1bb69914b2). Pages: network first, so updates arrive; fonts and the
   Preact bundle: cache first. Font files are precached on install so the app also opens offline. */
const CACHE = 'onsams-1bb69914b2';
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
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'))));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$|cdn\.jsdelivr\.net$/.test(url.host)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return r; })));
  }
});
