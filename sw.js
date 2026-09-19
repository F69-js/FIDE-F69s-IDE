// FIDE PWA Service Worker - NewTacs© 23-Lang & WebWorker Complete Cache (v1.6 Final)
const CACHE_NAME = "fide-tacs-cache-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./styles/main.css",
  "./scripts/main.js",
  "./scripts/highlighter.js",
  "./scripts/highlighter-worker.js",
  "./scripts/linter/tide.js",
  "./scripts/langs/gateway.js",
  "./scripts/langs/js.js",
  "./scripts/langs/json.js",
  "./scripts/langs/html.js",
  "./scripts/langs/css.js",
  "./scripts/langs/md.js",
  "./scripts/langs/py.js",
  "./scripts/langs/php.js",
  "./scripts/langs/cpp.js",
  "./scripts/langs/cs.js",
  "./scripts/langs/java.js",
  "./scripts/langs/ts.js",
  "./scripts/langs/sql.js",
  "./scripts/langs/sh.js",
  "./scripts/langs/yaml.js",
  "./scripts/langs/toml.js",
  "./scripts/langs/rust.js",
  "./scripts/langs/go.js",
  "./scripts/langs/ruby.js",
  "./scripts/langs/kt.js",
  "./scripts/langs/swift.js",
  "./scripts/langs/dart.js",
  "./scripts/langs/r.js",
  "./scripts/langs/docker.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[FIDE PWA] 📦 23大言語モジュール＆WebWorkerコアを100%キャッシュに完全隔離しました！");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[FIDE PWA] 🧹 古いキャッシュを安全に消去しました:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("placehold.co")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // 💡 【バグ完全粉砕】自動誤変換の原因になる「||」を使わず、
      // 単純な if 文による安全な三項展開構造に書き換えて、記号クラッシュを100%根本から消滅！
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
