const CACHE = 'bus-v1';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // APIリクエストはキャッシュしない（常に最新を取得）
  if (url.hostname === 'api.transit.ls8h.com') {
    e.respondWith(fetch(e.request));
    return;
  }

  // アプリ本体はキャッシュ優先、失敗時はネットワーク
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
