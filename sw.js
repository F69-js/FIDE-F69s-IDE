// FIDE PWA Service Worker - NewTacs© 23-Lang & WebWorker Complete Cache (v1.5)
const CACHE_NAME = "fide-tacs-cache-v2";

// 💡 【鉄壁の防衛ライン】新設した Worker、Gateway、および全23言語プラグインを完全封入！
const urlsToCache = [
  "./",
  "./index.html",
  "./styles/main.css",
  "./scripts/main.js",
  
  // ─── 💡 1. メインハイライター ＆ Web Worker スレッドコア ───
  "./scripts/highlighter.js",
  "./scripts/highlighter-worker.js",
  "./scripts/linter/tide.js",
  
  // ─── 💡 2. 言語一括集約ゲートウェイハブ ───
  "./scripts/langs/gateway.js",
  
  // ─── 💡 3. 新Tacs 23大言語プラグインアセット全集 ───
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

// 💡 Service Worker インストールイベント：全アセットをキャッシュに爆速貯蔵！
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[FIDE PWA] 📦 23大言語モジュール＆WebWorkerコアを100%キャッシュに完全隔離しました！");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 💡 古いキャッシュの自動クリーンアップ
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

// 💡 フェッチイベント：オフライン時でもキャッシュから秒速でアセットを引き出す！
self.addEventListener("fetch", (event) => {
  // placehold.co の外部動的アイコンはネットワークから取得（コケた時は alt 属性が防衛［cite: 1］）
  if (event.request.url.includes("placehold.co")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュがあればそれを返し、なければ通常の通信を行う
      return response \vert{}\vert{} fetch(event.request);
    })
  );
});
