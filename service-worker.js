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
  const allAssets = Array.from(new Set(assets.concat(FALLBACK_ASSETS)));

  // Add assets one-by-one so one failure doesn't kill the whole batch
  const results = await Promise.allSettled(
    allAssets.map(url => cache.add(url).catch(() => undefined))
  );

  const failed = results.filter(r => r.status === 'rejected').length;
  if (failed > 0) {
    console.warn('[SW] ' + failed + ' of ' + allAssets.length + ' assets failed to precache.');
  }
}

function normalizeNavigationUrl(requestUrl) {
  // Strip trailing slash variations so cache.match works reliably
  const url = new URL(requestUrl);
  let pathname = url.pathname;

  if (pathname.endsWith('/') && pathname !== '/') {
    pathname = pathname.slice(0, -1);
  }

  return url.origin + pathname;
}

async function offlinePageResponse() {
  const cache = await caches.open(CACHE_NAME);
  const cachedHome = await cache.match('/index.html');
  if (cachedHome) return cachedHome;

  // Absolute last resort: a minimal offline page from thin air
  return new Response(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Offline</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;' +
    'min-height:100vh;margin:0;background:#f0f4ff;color:#333;text-align:center;padding:24px}' +
    'h1{font-size:1.4rem}a{color:#4f8df7}</style></head><body><div><h1>📡 You are offline</h1>' +
    '<p>Open the app online once to cache all games, then they\'ll work offline.</p>' +
    '<p><a href="/">🏠 Go Home</a></p></div></body></html>',
    { status: 503, headers: { 'Content-Type': 'text/html' } }
  );
}

// Cache-first for navigations: load instantly offline, refresh in background
async function navigationHandler(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Always kick off a background network fetch to keep cache fresh
  const networkPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => undefined);

  if (cachedResponse) {
    // Return cached immediately; background refresh already started
    return cachedResponse;
  }

  // Not in cache yet: wait for network, fall back to offline page
  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return offlinePageResponse();
}

// Network-first for API calls: always try live, fall back to cache
async function apiHandler(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    return cachedResponse || offlinePageResponse();
  }
}

// Stale-while-revalidate for static assets
async function staticAssetHandler(request) {
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

  return offlinePageResponse();
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

  if (isNavigationRequest) {
    event.respondWith(navigationHandler(event.request));
    return;
  }

  if (isApiRequest) {
    event.respondWith(apiHandler(event.request));
    return;
  }

  if (isSameOrigin) {
    event.respondWith(staticAssetHandler(event.request));
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
