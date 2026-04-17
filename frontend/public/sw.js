// Service Worker - VC Meal Planner
// Estrategia: cache-first para assets estáticos, network-first para API.
// Se completará en la Fase 5.

const CACHE_NAME = 'vc-mealplanner-v1';
const STATIC_ASSETS = ['/', '/offline.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first para llamadas a la API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline', message: 'Sin conexión a internet.' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        }),
      ),
    );
    return;
  }

  // Cache-first para assets estáticos
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => caches.match('/offline.html'));
    }),
  );
});
