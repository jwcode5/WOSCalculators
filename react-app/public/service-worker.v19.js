// Increment this cache name whenever cached files change so old caches are replaced.
const CACHE_NAME = 'wos-calculator-v22';

// These are the app shell files needed for offline use.
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './i18n.js',
  './main_spa_loader.js',
  './kingshot-i18n-overrides.js',
  './manifest.json',
  './data/buildings.json',
  './data/prerequisites.json',
  './data/chiefGear.json',
  './data/chiefCharm.json'
  // Add icon paths when available
];

// Pre-cache core files during installation so the app can start offline.
// On install, pre-cache and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// On activate, take control of all clients immediately
self.addEventListener('activate', event => {
  self.clients.claim();
});

// Allow the page to request immediate activation of a waiting worker.
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Use network-first for app-shell assets so CSS/JS updates are picked up quickly,
// with cache fallback for offline reliability.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isAppShellAsset = isSameOrigin && (
    requestUrl.pathname === '/' ||
    requestUrl.pathname.endsWith('.html') ||
    requestUrl.pathname.endsWith('.css') ||
    requestUrl.pathname.endsWith('.js') ||
    requestUrl.pathname.endsWith('.json')
  );

  if (isAppShellAsset) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For all other requests, use default fetch behavior
});

// Remove outdated caches from older app versions, then take control immediately.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});
