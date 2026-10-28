const CACHE_NAME = "whoami-v1";
const CORE_ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    // Sadece GET ve same-origin istekleri cache'le. WebSocket geçer.
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        caches.match(req).then((cached) => {
            const network = fetch(req).then((res) => {
                if (res && res.status === 200) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
                }
                return res;
            }).catch(() => cached);
            return cached || network;
        })
    );
});
