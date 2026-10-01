const CACHE='1903-modular-0.3.12';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./core/engine.js','./core/stories.js','./core/coaches.js','./core/calendar.js','./data/coaches.js','./core/dna.js','./core/pathways.js','./core/transitions.js','./core/positions.js','./core/random.js','./core/match.js','./core/persistence.js','./data/clubs-br-2026.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('1903-modular-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request))));
