/* Fotiqo kiosk service worker
 * Strategy:
 *  - App shell (HTML, CSS, JS) → cache-first, fallback network
 *  - /api/local/* → network-first, fallback cache
 *  - Photos (res.cloudinary.com / *.r2.dev) → cache-first with size cap (~200 MB)
 */
const SHELL_CACHE = "ph-kiosk-shell-v1";
const PHOTO_CACHE = "ph-kiosk-photos-v1";
const SHELL = ["/kiosk/sale-point", "/kiosk/gallery", "/manifest-sale-kiosk.json", "/manifest-gallery-kiosk.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== PHOTO_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Photos
  if (url.host.endsWith("cloudinary.com") || url.host.endsWith("r2.dev") || url.host.endsWith("picsum.photos")) {
    e.respondWith(
      caches.open(PHOTO_CACHE).then(async (cache) => {
        const hit = await cache.match(e.request);
        if (hit) return hit;
        try {
          const res = await fetch(e.request);
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        } catch {
          return hit || Response.error();
        }
      })
    );
    return;
  }
  // Local API → network-first
  if (url.pathname.startsWith("/api/local/")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then((r) => r || Response.error()))
    );
    return;
  }
  // App shell → cache-first
  if (SHELL.some((s) => url.pathname.startsWith(s))) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
  }
});
