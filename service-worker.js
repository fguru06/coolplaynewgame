// v6 — dead simple: cache everything from static manifest, serve cache-first
var CACHE = "coolplay-v6";
var MANIFEST = "/offline-assets.json";
var SYNC_TAG = "coolplay-offline-sync";

self.addEventListener("install", function(e) {
  console.log("[SW v6] install start");
  e.waitUntil(
    fetch(MANIFEST, { cache: "no-store" })
      .then(function(r) { return r.json(); })
      .catch(function() { return []; })
      .then(function(list) {
        console.log("[SW v6] caching " + list.length + " URLs");
        return caches.open(CACHE).then(function(cache) {
          return Promise.allSettled(list.map(function(url) {
            return cache.add(url).catch(function(err) {
              console.warn("[SW v6] FAIL " + url + " — " + (err.message || err));
            });
          }));
        });
      })
      .then(function() { console.log("[SW v6] skipWaiting"); return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e) {
  console.log("[SW v6] activate");
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) {
        console.log("[SW v6] delete old " + k); return caches.delete(k);
      }));
    }).then(function() { console.log("[SW v6] claim"); return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(function(cache) {
      return cache.match(e.request).then(function(hit) {
        var net = fetch(e.request).then(function(r) {
          if (r.ok) cache.put(e.request, r.clone());
          return r;
        }).catch(function() { return null; });
        if (hit) return hit;
        return net.then(function(r) { return r || cache.match("/index.html"); });
      });
    })
  );
});

self.addEventListener("sync", function(e) {
  if (e.tag !== SYNC_TAG) return;
  e.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: "window" }).then(function(clients) {
      clients.forEach(function(c) { c.postMessage({ type: "flush-offline-queue" }); });
    })
  );
});

self.addEventListener("message", function(e) {
  if (e.data && e.data.type === "SKIP_WAITING") {
    console.log("[SW v6] SKIP_WAITING received");
    self.skipWaiting();
  }
});
