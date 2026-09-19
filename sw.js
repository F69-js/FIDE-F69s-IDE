// FIDE PWA Service Worker - NewTacs© Universal Path Sync Cache (v3.0 Final Master)
const CACHE_NAME = "fide-tacs-cache-v2";

// 💡 【物理パス完全同期】すべての新言語・Workerを正しい「scripts/newtacs/」のツリーへ完全配線！
const urlsToCache = [
  "./",
  "./index.html",
  "./styles/main.css",
  
  // ─── 💡 1. メインエントリースクリプト ───
  "./scripts/index.js",
  
  // ─── 💡 2. 新TacsマルチスレッドWorkerコア（物理配置） ───
  "./scripts/newtacs/highlighter.js",
  "./scripts/newtacs/highlighter-worker.js",
  "./scripts/linter/tide.js",
  
  // ─── 💡 3. 一括集約ゲートウェイ ───
  "./scripts/newtacs/langs/gateway.js",
  
  // ─── 💡 4. 新Tacs 23大言語プラグイン（全言語を newtacs/langs/ に完全統一！） ───
  "./scripts/newtacs/langs/js.js",
  "./scripts/newtacs/langs/json.js",
  "./scripts/newtacs/langs/html.js",
  "./scripts/newtacs/langs/css.js",
  "./scripts/newtacs/langs/md.js",
  "./scripts/newtacs/langs/py.js",
  "./scripts/newtacs/langs/php.js",
  "./scripts/newtacs/langs/cpp.js",
  "./scripts/newtacs/langs/cs.js",
  "./scripts/newtacs/langs/java.js",
  "./scripts/newtacs/langs/ts.js",
  "./scripts/newtacs/langs/sql.js",
  "./scripts/newtacs/langs/sh.js",
  "./scripts/newtacs/langs/yaml.js",
  "./scripts/newtacs/langs/toml.js",
  "./scripts/newtacs/langs/rust.js",
  "./scripts/newtacs/langs/go.js",
  "./scripts/newtacs/langs/ruby.js",
  "./scripts/newtacs/langs/kt.js",
  "./scripts/newtacs/langs/swift.js",
  "./scripts/newtacs/langs/dart.js",
  "./scripts/newtacs/langs/r.js",
  "./scripts/newtacs/langs/docker.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[FIDE PWA] 📦 23大言語モジュール＆WebWorkerコアを100%キャッシュに完全隔離しました！");
      return Promise.all(
        urlsToCache.map(url => {
          return cache.add(url).catch(err => {
            console.error("[FIDE PWA] ❌ キャッシュに失敗したファイルがあります:", url, err);
          });
        })
      );
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
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
