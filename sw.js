// CACHE_NAME : compteur INDEPENDANT, +1 a chaque deploiement (ne suit PAS VERSION)
var CACHE_NAME = 'ukulele-v55';
var ASSETS = ['./', './manifest.json', './icon-192.png', './icon-512.png', './icon-192-maskable.png', './icon-512-maskable.png', './apple-touch-icon.png', './favicon-32.png', './audio/1-A4.mp3', './audio/1-B4.mp3', './audio/1-Bb4.mp3', './audio/1-C5.mp3', './audio/1-Db5.mp3', './audio/2-E4.mp3', './audio/2-F4.mp3', './audio/2-G4.mp3', './audio/2-Gb4.mp3', './audio/3-C4.mp3', './audio/3-D4.mp3', './audio/3-Db4.mp3', './audio/3-E4.mp3', './audio/3-Eb4.mp3', './audio/4-A4.mp3', './audio/4-Ab4.mp3', './audio/4-B4.mp3', './audio/4-Bb4.mp3', './audio/4-G4.mp3'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c) { return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Ne pas intercepter les requêtes externes (CDN, audio, polices) ni les non-GET
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  // Stale-while-revalidate : sert le cache tout de suite (rapide + hors-ligne),
  // ET re-télécharge en arrière-plan pour rafraîchir le cache à la prochaine ouverture.
  e.respondWith(
    caches.open(CACHE_NAME).then(function(c) {
      return c.match(e.request).then(function(cached) {
        var net = fetch(e.request).then(function(resp) {
          if (resp && resp.status === 200) c.put(e.request, resp.clone());
          return resp;
        }).catch(function() { return cached; });
        return cached || net;
      });
    })
  );
});
