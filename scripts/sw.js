// F69's IDE - Custom Service Worker (Ultimate Full-Offline Version v3)
const CACHE_NAME = 'f69s-ide-full-cache-v3'; // バージョンをv3にアップ

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './offline.html',
    './manifest.json',
    './images/favicon.ico',
    './styles/main.css',
    './scripts/index.js',
    './scripts/fjalu/index.js',
    './scripts/fjalu/emoji.js',
    './scripts/langs/i18n.js',
    './scripts/linter/tide.js'
];

// 1. インストール時
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[PWA] Core assets successfully cached for offline use.');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => {
            // ★超重要：順番待ちをさせず、古いワーカーを即座にキックして交代する！
            return self.skipWaiting();
        })
    );
});

// 2. アクティベート時
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[PWA] Outdated cache cleared.');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            // ★超重要：現在開いているこのページを、今すぐこのワーカーの支配下に置く（claim）！
            return self.clients.claim();
        })
    );
});

// 3. フェッチコントロール（変更なし）
if ('u' > typeof self && self.addEventListener) {
    self.addEventListener('fetch', (event) => {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request).catch(() => {
                    if (event.request.mode === 'navigate') {
                        return caches.match('./') || caches.match('./index.html') || caches.match('./offline.html');
                    }
                });
            })
        );
    });
}
