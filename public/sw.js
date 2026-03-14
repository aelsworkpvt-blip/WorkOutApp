const CACHE_NAME = "forge-motion-v1";
const OFFLINE_URL = "/offline";
const STATIC_ASSETS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-512-maskable.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(request) {
  const url = new URL(request.url);

  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname === "/manifest.webmanifest" ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".ico"))
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedOfflinePage = await caches.match(OFFLINE_URL);
        return cachedOfflinePage || Response.error();
      }),
    );
    return;
  }

  if (!isStaticAsset(request)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkResponse = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clonedResponse = response.clone();
            void caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, clonedResponse));
          }

          return response;
        })
        .catch(() => cachedResponse || Response.error());

      return cachedResponse || networkResponse;
    }),
  );
});
