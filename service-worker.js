// Increment this cache name whenever cached files change so old caches are replaced.
const CACHE_NAME = 'wos-calculator-v8';

// These are the app shell files needed for offline use.
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/data/buildings.json',
  '/data/prerequisites.json'
  // Add icon paths when available
];

// Pre-cache core files during installation so the app can start offline.
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Serve cached files first, then fall back to the network for anything uncached.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Remove outdated caches from older app versions, then take control immediately.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});