// ทุ่งพระวาจา service worker — เปลี่ยนเลข VERSION ทุกครั้งที่อัปเดต index.html
const VERSION = "tungprawaja-v5";
const FILES = ["./", "./index.html", "./style.css", "./notify.js", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// network first: online users always get the newest version; offline falls back to the cache
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});
