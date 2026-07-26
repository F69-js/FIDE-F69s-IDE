// F69's IDE - Custom Service Worker (Ultimate Full-Offline Version v8)
const CACHE_NAME = 'f69s-ide-full-cache-v8'; // バージョンをv8にアップ

// 【他社AIの教えを死守】「./」は絶対に入れない！完璧に重複を排除した美しいリスト
const ASSETS_TO_CACHE = [
    './index.html', 
    './manifest.json',
    './images/favicon.ico',
    './styles/main.css',
    './scripts/index.js',
    './scripts/fjalu/index.js',
    './scripts/fjalu/emoji.js',
    './scripts/langs/i18n.js',
    './scripts/linter/tide.js'
];

// 1. インストール時（個別ループで確実に保存。重複がないので爆速で終わります）
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[PWA] Micro-optimizing assets...');
            for (const url of ASSETS_TO_CACHE) {
                try {
                    const response = await fetch(url, { redirect: 'follow' });
                    if (response.ok) await cache.put(url, response);
                } catch (err) {
                    console.warn(`[PWA] Skipping failed asset: ${url}`);
                }
            }
        }).then(() => self.skipWaiting())
    );
});

// 2. アクティベート時（変更なし）
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) return caches.delete(cache);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. 【大本命】他社AIにバレずに恐竜を倒すフェッチハンドラー
if ('u' > typeof self && self.addEventListener) {
    self.addEventListener('fetch', (event) => {
        
        // ★ここが天才的なマッピングハック！
        // ユーザーが「.../FIDE-F69s-IDE/」（末尾スラッシュ）でリロードしてきたら、
        // 脳内でこっそり「./index.html」へのリクエストに書き換えて金庫を探しに行かせる！
        let requestToMatch = event.request;
        if (event.request.mode === 'navigate' && event.request.url.endsWith('/')) {
            requestToMatch = './index.html'; // リクエストを偽装して金庫の鍵を合わせる
        }

        event.respondWith(
            caches.match(requestToMatch).then((cachedResponse) => {
                // 金庫にあればそれを返し、無ければネットワーク（最新）へ
                return cachedResponse || fetch(event.request);
            })
        );
    });
}
