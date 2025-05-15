// sw.js

const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '') || '/';
const CACHE_NAME = 'story-app-v2';
const APP_SHELL = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.webmanifest',
  BASE_PATH + 'icons/icon-192.png',
  BASE_PATH + 'icons/icon-512.png',
  BASE_PATH + 'bundle.js',
  BASE_PATH + 'sw.js',
  BASE_PATH + 'src/styles/style.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Handle navigation requests (SPA routing)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(BASE_PATH + 'index.html').then((response) => response || fetch(BASE_PATH + 'index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request)
        .then((networkResponse) => {
          // Cache dynamic resources (optional, for API/images)
          if (event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback offline: bisa tambahkan offline.html jika mau
          if (event.request.destination === 'document') {
            return caches.match(BASE_PATH + 'index.html');
          }
        });
    })
  );
});

self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Notifikasi',
      options: {
        body: 'Anda mendapat notifikasi baru.',
        icon: BASE_PATH + 'icons/icon-192.png',
        badge: BASE_PATH + 'icons/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        }
      },
    };
  }
  const { title, options } = data;
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(BASE_PATH)
  );
});
