const CACHE_NAME = 'musa-games-v3';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const isNavigationRequest = event.request.mode === 'navigate';

  event.respondWith(
    isNavigationRequest
      ? fetch(event.request).catch(() => caches.match(event.request))
      : caches.open(CACHE_NAME).then(cache => {
          return cache.match(event.request).then(response => {
            return response || fetch(event.request).then(networkResponse => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          });
        })
  );
});
