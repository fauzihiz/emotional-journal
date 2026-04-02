// Simple Service Worker to satisfy PWA requirements
const CACHE_NAME = 'jurnal-emosi-v1';

self.addEventListener('install', (event) => {
  // Use event.waitUntil() to ensure installation is complete
  console.log('[SW] Installed');
});

self.addEventListener('fetch', (event) => {
  // Required to make Chrome think it's a "real" PWA
  event.respondWith(
    fetch(event.request).catch(() => {
      // Fallback or just ignore for now
      return new Response('Offline');
    })
  );
});
