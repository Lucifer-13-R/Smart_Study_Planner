const CACHE_NAME = 'smart-study-v1';
const ASSETS = ['.','/index.html','/styles.css','/app.js'];

self.addEventListener('install', (e)=> {
  e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e)=> {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (e)=> {
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});
