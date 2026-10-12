/* OnsAms offline cache (version 225ea5b467). Pages: network first, so updates arrive; fonts and the
   Preact bundle: cache first. Font files are precached on install so the app also opens offline. */
const CACHE = 'onsams-225ea5b467';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png'];
const EXTERNAL = ["https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700;800&display=swap", "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0..1,0&icon_names=account_balance,add,add_circle,agriculture,apps,arrow_back,arrow_downward,arrow_forward,arrow_upward,autorenew,bar_chart,battery_full,bedtime,bolt,bookmark,bookmark_add,bookmark_added,celebration,chat,check,check_circle,chevron_right,close,confirmation_number,construction,content_copy,delete,delete_sweep,diversity_3,eco,edit,edit_note,emoji_nature,error,event,event_available,explore,favorite,format_quote,forum,give,group_add,groups,groups_3,handshake,heron,home,hotel,houses,how_to_reg,how_to_vote,hub,inbox,info,ios_share,light_mode,lightbulb,link,local_florist,location_on,lock,lock_open,luggage,map,more_horiz,my_location,nature_people,nights_stay,palette,park,payments,person,person_add,photo_camera,play_arrow,potted_plant,qr_code_2,radio_button_unchecked,rate_review,redeem,refresh,remove,replay,restart_alt,restaurant,room_service,schedule,school,search,search_off,select_all,self_improvement,sell,send,sentiment_satisfied,shopping_bag,signal_cellular_alt,spa,star,sticky_note_2,stop,storefront,swap_horiz,timer,touch_app,train,travel_explore,visibility,volume_up,volunteer_activism,vote,wallet,warning,water,water_drop,wb_twilight,welcome,wifi&display=block", "https://cdn.jsdelivr.net/npm/htm@3.1.1/preact/standalone.umd.js"];
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
