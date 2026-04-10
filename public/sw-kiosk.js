/* Fotiqo kiosk service worker v2
 * Strategy:
 *  - App shell (HTML, CSS, JS) → cache-first, fallback network
 *  - /api/local/* → network-first, fallback cache (LAN data)
 *  - /api/kiosk/* → network-first, fallback cache (kiosk operations)
 *  - Photos (cloudinary / r2.dev / picsum / /api/photo / /api/local/photo) → cache-first with size cap
 */
const SHELL_CACHE = "fotiqo-kiosk-shell-v2";
const PHOTO_CACHE = "fotiqo-kiosk-photos-v2";
const API_CACHE = "fotiqo-kiosk-api-v2";
const MAX_PHOTO_ENTRIES = 500; // ~200MB cap

const SHELL = [
  "/kiosk/sale-point",
  "/kiosk/gallery",
  "/kiosk/self-service",
  "/kiosk/tv-display",
  "/kiosk/sd-upload",
  "/kiosk/print-queue",
  "/kiosk/setup",
  "/manifest-sale-kiosk.json",
  "/manifest-gallery-kiosk.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith("fotiqo-kiosk-"))
          .concat(["ph-kiosk-shell-v1", "ph-kiosk-photos-v1"]) // old caches
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Helper: is this a photo URL?
function isPhotoRequest(url) {
  return (
    url.host.endsWith("cloudinary.com") ||
    url.host.endsWith("r2.dev") ||
    url.host.endsWith("picsum.photos") ||
    url.host.endsWith("fotiqo.com") && url.pathname.startsWith("/api/photo/") ||
    url.pathname.startsWith("/api/local/photo/")
  );
}

// Helper: is this a LAN/kiosk API request?
function isApiRequest(url) {
  return (
    url.pathname.startsWith("/api/local/") ||
    url.pathname.startsWith("/api/kiosk/")
  );
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // ── Photos: cache-first ──
  if (isPhotoRequest(url)) {
    e.respondWith(
      caches.open(PHOTO_CACHE).then(async (cache) => {
        const hit = await cache.match(e.request);
        if (hit) return hit;
        try {
          const res = await fetch(e.request);
          if (res.ok) {
            cache.put(e.request, res.clone());
            // Evict old entries if over limit
            cache.keys().then((keys) => {
              if (keys.length > MAX_PHOTO_ENTRIES) {
                keys.slice(0, keys.length - MAX_PHOTO_ENTRIES).forEach((k) => cache.delete(k));
              }
            });
          }
          return res;
        } catch {
          return hit || new Response("Photo offline", { status: 503 });
        }
      })
    );
    return;
  }

  // ── API calls: network-first with cache fallback ──
  if (isApiRequest(url)) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok && e.request.method === "GET") {
            const clone = res.clone();
            caches.open(API_CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.open(API_CACHE).then((c) =>
            c.match(e.request).then((r) => r || new Response(JSON.stringify({ error: "Offline" }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            }))
          )
        )
    );
    return;
  }

  // ── App shell: cache-first ──
  if (SHELL.some((s) => url.pathname === s || url.pathname.startsWith(s + "/"))) {
    e.respondWith(
      caches.match(e.request).then((r) => r || fetch(e.request))
    );
    return;
  }

  // ── Everything else: network with cache fallback for navigations ──
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  }
});
