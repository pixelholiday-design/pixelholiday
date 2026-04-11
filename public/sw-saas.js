const CACHE_NAME = "fotiqo-saas-v1";
const STATIC_ASSETS = [
  "/fotiqo-icon.svg",
  "/logo-icon.png",
  "/logo-full.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API routes and auth
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Cache static assets
        if (response.ok && (url.pathname.match(/\.(svg|png|jpg|ico|css|js|woff2?)$/) || STATIC_ASSETS.includes(url.pathname))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (request.mode === "navigate") {
          return new Response(
            "<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>",
            { headers: { "Content-Type": "text/html" } }
          );
        }
        return new Response("Offline", { status: 503 });
      });
    })
  );
});
