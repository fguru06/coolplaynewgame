const CACHE_NAME = 'coolplay-games-v4';
const OFFLINE_ASSET_MANIFEST_URL = '/api/offline-assets';
const FALLBACK_ASSETS = ['/', '/index.html', '/Styles.css', '/manifest.json', '/icon-192.svg', '/icon-512.svg', '/offline-sync.js'];
const SYNC_TAG = 'coolplay-offline-sync';

async function getOfflineAssetList() {
  try {
    const response = await fetch(OFFLINE_ASSET_MANIFEST_URL, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('Could not load offline asset manifest.');
    }

    const payload = await response.json();
    return Array.isArray(payload.assets) ? payload.assets : FALLBACK_ASSETS;
  } catch (error) {
    return FALLBACK_ASSETS;
  }
}

async function cacheOfflineAssets() {
  const cache = await caches.open(CACHE_NAME);
  const assets = await getOfflineAssetList();
  await cache.addAll(Array.from(new Set(assets.concat(FALLBACK_ASSETS))));
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return cache.match('/index.html');
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const networkPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => undefined);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return cache.match('/index.html');
}

self.addEventListener('install', event => {
  event.waitUntil(cacheOfflineAssets().then(() => self.skipWaiting()));
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

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isNavigationRequest = event.request.mode === 'navigate';
  const isApiRequest = isSameOrigin && requestUrl.pathname.startsWith('/api/');

  if (isNavigationRequest || isApiRequest) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (isSameOrigin) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

self.addEventListener('sync', event => {
  if (event.tag !== SYNC_TAG) {
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'flush-offline-queue' });
      });
    })
  );
});
