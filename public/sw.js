const CACHE_NAME = "projects-shell-v3";
const SHELL_ASSETS = [
  "/projects",
  "/projects/narrate",
  "/projects/airgap",
  "/projects/airgap/sender",
  "/projects/airgap/receiver",
  "/projects/skills",
  "/projects/matter-integration",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }
  if (!new URL(request.url).pathname.startsWith("/projects")) {
    return; // registered with scope "/projects/", but stay defensively scoped here too
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
