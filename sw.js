// Service worker minimal : juste assez pour satisfaire les critères
// d'installabilité PWA de Chrome/Android. Ne met rien en cache de façon
// agressive pour que l'app charge toujours la dernière version du code
// (important ici : pas de flux vidéo à mettre en cache, juste la coquille HTML).

const CACHE_NAME = 'surveillance-bureau-v1';
const SHELL_FILES = ['./index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Stratégie "réseau d'abord" : on essaie toujours d'avoir la dernière version
// en ligne, et on ne retombe sur le cache que si le réseau est indisponible.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
