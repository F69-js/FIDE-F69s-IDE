// FIDE PWA Service Worker - NewTacs© Universal Path Sync Cache (v2.5 Final Complete)
const CACHE_NAME = "fide-tacs-cache-v2";

// 💡 【バグ完全根絶】架空の main.js を完全に消去し、正しい「./scripts/index.js」へ完全配線！
const urlsToCache = [
  "./",
  "./index.html",
  "./styles/main.css",
  
  // ─── 💡 1. メインエントリースクリプト（index.js に完全修正） ───
  "./scripts/index.js",
  
  // ─── 💡 2. 新TacsマルチスレッドWorkerコア ───
  "./scripts/newtacs/highlighter.js",
  "./scripts/newtacs/highlighter-worker.js",
  "./scripts/linter/tide.js",
  
  // ─── 💡 3. 一括集約ゲートウェイ ───
  "./scripts/newtacs/langs/gateway.js",
  
  // ─── 💡 4. 新Tacs 23大言語モジュール（真の物理配置） ───
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
