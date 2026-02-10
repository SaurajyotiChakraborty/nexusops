/**
 * NexusOps Service Worker
 * This is a minimal service worker to satisfy requests for sw.js
 * and resolve "sw.js not found" errors.
 */

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Currently no fetch interception needed
