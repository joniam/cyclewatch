// Service worker — CycleWatch
// Strategy:
//   App shell (HTML, fonts, Tailwind, Mapbox JS/CSS) → cache-first
//   Mapbox tile/API requests → network-first (tiles must stay fresh)
//
// Cache key includes a version string. Bump CACHE_VER on any app-shell
// change to force old caches to evict on next install.

const CACHE_VER = 'v7';
const SHELL_CACHE = `cyclewatch-shell-${CACHE_VER}`;

const SHELL_URLS = [
  '.',
  'index.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

// ── Update trigger — main thread sends SKIP_WAITING when user taps wordmark ──
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// ── Install: pre-cache the app shell ────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS))
  );
  // Activate immediately — don't wait for existing tabs to close
  self.skipWaiting();
});

// ── Activate: evict stale caches from previous versions ─────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('cyclewatch-') && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: route requests ────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Mapbox tiles and API → network-first, no caching
  // (tiles are large and versioned; caching them wastes quota)
  if (url.hostname.includes('mapbox.com') || url.hostname.includes('mapbox.cn')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Google Fonts → network-first (font versioning handled by Google CDN)
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // Everything else (app shell) → cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
