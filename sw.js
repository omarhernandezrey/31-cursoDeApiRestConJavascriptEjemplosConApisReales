// sw.js (en la raíz del proyecto)
const CACHE_NAME = 'plazimovies-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/css/styles.css',
  '/src/img/no-image.jpg',
  '/src/img/no-avatar.png',
  '/src/js/main.js',
  'https://cdn.jsdelivr.net/npm/axios@1.6.8/+esm',
  'https://fonts.googleapis.com/css2?family=Dosis:wght@700;800&family=Red+Hat+Display:wght@400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});