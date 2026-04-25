const CACHE='fafa-game-arena-v9';
const ASSETS=['./','./index.html','./style.css','./app.js','./data/missions.js','./assets/logo.png','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
