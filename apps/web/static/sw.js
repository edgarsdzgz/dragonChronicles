/**
 * Service Worker for Draconia Chronicles PWA
 * Uses Workbox for caching strategies and offline functionality
 */

// Import Workbox modules with fallback
try {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');
} catch {
  console.warn('Failed to load Workbox from CDN, using minimal service worker functionality');
  // Define minimal workbox-like objects for fallback
  self.workbox = {
    precaching: {
      precacheAndRoute: () => {},
      cleanupOutdatedCaches: () => {}
    },
    routing: {
      registerRoute: () => {},
      NavigationRoute: class NavigationRoute {}
    },
    strategies: {
      StaleWhileRevalidate: class StaleWhileRevalidate {},
      CacheFirst: class CacheFirst {},
      NetworkFirst: class NetworkFirst {}
    },
    expiration: {
      ExpirationPlugin: class ExpirationPlugin {}
    },
    cacheableResponse: {
      CacheableResponsePlugin: class CacheableResponsePlugin {}
    }
  };
}

const { precacheAndRoute, cleanupOutdatedCaches } = self.workbox.precaching;
const { registerRoute, NavigationRoute } = self.workbox.routing;
const { StaleWhileRevalidate, CacheFirst, NetworkFirst } = self.workbox.strategies;
const { ExpirationPlugin } = self.workbox.expiration;
const { CacheableResponsePlugin } = self.workbox.cacheableResponse;

// Clean up outdated caches
cleanupOutdatedCaches();

// Precache and route all static assets
if (self.__WB_MANIFEST) {
  precacheAndRoute(self.__WB_MANIFEST);
} else {
  console.warn('Workbox manifest not available, skipping precaching');
}

// Handle navigation requests (SPA routing)
registerRoute(
  new NavigationRoute(
    // Use network first for navigation to ensure fresh content
    new NetworkFirst({
      cacheName: 'pages',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          maxEntries: 50,
        }),
      ],
    }),
  ),
);

// Cache images with CacheFirst strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        maxEntries: 100,
      }),
    ],
  }),
);

// Cache fonts with CacheFirst strategy
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        maxEntries: 30,
      }),
    ],
  }),
);

// Cache JavaScript and CSS with StaleWhileRevalidate
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        maxEntries: 50,
      }),
    ],
  }),
);

// Cache API responses with NetworkFirst for dynamic content
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 5 * 60, // 5 minutes
        maxEntries: 50,
      }),
    ],
  }),
);

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Take control of all clients immediately
      self.clients.claim(),
      // Clean up old caches
      cleanupOutdatedCaches(),
    ]),
  );
});

// Handle fetch events for offline fallbacks
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle offline fallback for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return the precached index.html for offline navigation
        return caches.match('/index.html');
      }),
    );
  }
});

// Log service worker events for debugging
self.addEventListener('install', (_event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (_event) => {
  console.log('Service Worker: Activating...');
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    // Handle offline actions when connection is restored
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow('/'));
});
