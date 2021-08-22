var CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";
var urlToCache = [
    "/",
    "/manifest.json",
    "/db.js",
    "/index.js",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
]

self.addEventListener("install", event => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => cache.addAll(urlToCache))

    );
});

self.addEventListener("fetch", event => {
    // non GET requests are not cached and requests to other origins are not cached


    // handle runtime GET requests for data from /api routes
    if (event.request.url.includes("/api/")) {
        // make network request and fallback to cache if network request fails (offline)
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        cache.put(event.request, response.clone());
                        return response;
                    })
                    .catch(() => caches.match(event.request));
            })
        );
        return;
    }

    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request).then(function(response) {
                if (response) {
                    return response;
                } else if(event.request.headers.get("accept").includes("text/html")) {
                    return caches.match("/")
                }
            });
        })
    );
});
