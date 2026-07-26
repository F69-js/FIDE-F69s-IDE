// F69's IDE - Custom Service Worker (Ultimate Full-Offline Version v5)
const CACHE_NAME = 'f69s-ide-full-cache-v5'; // バージョンをv5にアップ

// 【改善1】重複を避けるため、「./」を削除して「./index.html」に完全統一！
const ASSETS_TO_CACHE = [
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

// 1. インストール時に、GitHub Pagesのリダイレクトを自動追跡して安全にキャッシュ
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            for (const url of ASSETS_TO_CACHE) {
                try {
                    const response = await fetch(url, { redirect: 'follow' });
                    if (response.ok) await cache.put(url, response);
                } catch (err) {
                    // 個別キャッシュ失敗を無視して続行
                    console.warn(`[PWA] Skipping failed asset: ${url}`);
                }
            }
        })
    );
});
// 2. アクティベート時（変更なし：クリーンアップ＆claim）
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
            return self.clients.claim(); // 強制支配
        })
    );
});

// 3. フェッチコントロール（保険のルートも他社AIに合わせてブラッシュアップ）
if ('u' > typeof self && self.addEventListener) {
    self.addEventListener('fetch', (event) => {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request).catch(() => {
                    if (event.request.mode === 'navigate') {
                        // ネットもキャッシュもない時の最終フォールバック
                        return caches.match('./index.html') || caches.match('./offline.html');
                    }
                });
            })
        );
    });
}
