// MS Boi - Service Worker (PWA)
// Cache simples app-shell + estratégia network-first para API
const CACHE = 'msboi-v1';
const SHELL = [
  '/', '/index.html', '/styles.css', '/app.js',
  '/manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // API: sempre rede (não cachear holerite, recados, etc — dados sensíveis LGPD)
  if (url.pathname.startsWith('/api/')) return;
  // Demais: cache-first
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(resp => {
        if (resp.ok && e.request.method === 'GET') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match('/index.html'))
    )
  );
});
